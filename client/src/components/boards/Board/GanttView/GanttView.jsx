/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'redux-orm';
import { Icon } from 'semantic-ui-react';

import orm from '../../../../orm';
import selectors from '../../../../selectors';
import CardModal from '../../../cards/CardModal';

import styles from './GanttView.module.scss';

// ---------------------------------------------------------------------------
// ORM selector – collects cards with list metadata
// ---------------------------------------------------------------------------
const selectGanttData = createSelector(
  orm,
  (state) => selectors.selectPath(state).boardId,
  ({ Board }, boardId) => {
    if (!boardId) return { lists: [], cards: [] };
    const board = Board.withId(boardId);
    if (!board) return { lists: [], cards: [] };

    const lists = [];
    const cards = [];

    board.getKanbanListsQuerySet().toModelArray().forEach((list) => {
      const listRef = { id: list.id, name: list.ref.name };
      lists.push(listRef);
      list.getCardsModelArray().forEach((card) => {
        cards.push({
          ...card.ref,
          listId: list.id,
          listName: list.ref.name,
        });
      });
    });

    return { lists, cards };
  },
);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DAY_PX = 28; // pixels per day column
const LABEL_WIDTH = 240; // left label panel width
const ROW_HEIGHT = 38; // row height in px
const HEADER_MONTH_H = 28;
const HEADER_DAY_H = 24;
const HEADER_H = HEADER_MONTH_H + HEADER_DAY_H;

// A colour palette for lists (cycles if more lists than colours)
const LIST_PALETTE = [
  '#4f83cc',
  '#38a169',
  '#d69e2e',
  '#dd6b20',
  '#805ad5',
  '#e53e3e',
  '#00b5d8',
  '#b7791f',
  '#2b6cb0',
  '#276749',
];

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------
function toDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function diffDays(a, b) {
  return Math.round((b - a) / 86400000);
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

// ---------------------------------------------------------------------------
// GanttView component
// ---------------------------------------------------------------------------
const GanttView = React.memo(({ cards: cardsProp, lists: listsProp, onCardClick }) => {
  // Support both prop-driven and self-contained (ORM selector) modes
  const ormData = useSelector(selectGanttData);
  const isCardModalOpened = useSelector((state) => !!selectors.selectPath(state).cardId);

  const allCards = cardsProp || ormData.cards;
  const allLists = listsProp || ormData.lists;

  const scrollRef = useRef(null);
  const today = useMemo(() => toDay(new Date()), []);

  // Build list colour map
  const listColorMap = useMemo(() => {
    const map = {};
    allLists.forEach((list, idx) => {
      map[list.id] = LIST_PALETTE[idx % LIST_PALETTE.length];
    });
    return map;
  }, [allLists]);

  // Filter cards that have at least one date
  const eligibleCards = useMemo(
    () => allCards.filter((c) => c.dueDate || c.createdAt || c.startDate),
    [allCards],
  );

  // Compute start/end for each card
  const rows = useMemo(() => {
    return eligibleCards.map((card) => {
      const start = card.startDate
        ? toDay(card.startDate)
        : card.createdAt
        ? toDay(card.createdAt)
        : toDay(today);

      const end = card.dueDate
        ? toDay(card.dueDate)
        : addDays(start, 7);

      // Ensure end >= start + 1
      const safeEnd = end <= start ? addDays(start, 7) : end;
      const durationDays = Math.max(1, diffDays(start, safeEnd));

      return { ...card, barStart: start, barEnd: safeEnd, durationDays };
    });
  }, [eligibleCards, today]);

  // Timeline range: min/max of all dates + 2-month buffer
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (rows.length === 0) {
      const min = addDays(today, -7);
      const max = addDays(today, 60);
      return { minDate: min, maxDate: max, totalDays: diffDays(min, max) };
    }

    const allStarts = rows.map((r) => r.barStart.getTime());
    const allEnds = rows.map((r) => r.barEnd.getTime());

    const rawMin = new Date(Math.min(...allStarts));
    const rawMax = new Date(Math.max(...allEnds));

    const min = addDays(rawMin, -14); // 2-week left buffer
    const max = addDays(rawMax, 60); // 2-month right buffer

    return { minDate: min, maxDate: max, totalDays: diffDays(min, max) };
  }, [rows, today]);

  // Day offset helper (days from minDate)
  const dayOff = (date) => Math.max(0, diffDays(minDate, date));

  const todayOff = dayOff(today);

  // Build month header segments
  const monthSegments = useMemo(() => {
    const segments = [];
    let cursor = new Date(minDate);
    while (cursor < maxDate) {
      const segStart = new Date(cursor);
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      const segEnd = monthEnd < maxDate ? monthEnd : new Date(maxDate);
      const days = diffDays(segStart, segEnd);
      segments.push({
        label: segStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        days,
        offset: dayOff(segStart),
      });
      cursor = monthEnd;
    }
    return segments;
  }, [minDate, maxDate]);

  // Build day header ticks (every day, but label only on Mondays / 1st of month)
  const dayTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(minDate, i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isMonday = d.getDay() === 1;
      const isFirst = d.getDate() === 1;
      ticks.push({ date: d, isWeekend, showLabel: isMonday || isFirst });
    }
    return ticks;
  }, [minDate, totalDays]);

  // Group rows by list (respecting original list order)
  const groupedRows = useMemo(() => {
    const groups = [];
    const listOrder = allLists.map((l) => l.id);
    const byList = {};
    rows.forEach((row) => {
      const lid = row.listId;
      if (!byList[lid]) byList[lid] = [];
      byList[lid].push(row);
    });
    listOrder.forEach((lid) => {
      const listRows = byList[lid];
      if (listRows && listRows.length > 0) {
        const list = allLists.find((l) => l.id === lid);
        groups.push({ list, rows: listRows });
      }
    });
    // Cards with unknown list (edge case)
    Object.keys(byList).forEach((lid) => {
      if (!listOrder.includes(lid)) {
        groups.push({ list: { id: lid, name: 'Sin lista' }, rows: byList[lid] });
      }
    });
    return groups;
  }, [rows, allLists]);

  const totalGridWidth = totalDays * DAY_PX;
  const totalWidth = LABEL_WIDTH + totalGridWidth;

  const handleBarClick = (card) => {
    if (onCardClick) onCardClick(card);
  };

  return (
    <div className={styles.wrapper}>
      {/* Top header bar */}
      <div className={styles.topBar}>
        <Icon name="tasks" />
        <span className={styles.title}>Vista Gantt</span>
        <span className={styles.badge}>{rows.length} tarjetas con fechas</span>
        {eligibleCards.length !== allCards.length && (
          <span className={styles.hint}>
            {allCards.length - eligibleCards.length} tarjetas sin fechas no se muestran
          </span>
        )}
        <span className={styles.scrollHint}>← Desplaza horizontalmente →</span>
      </div>

      {/* Gantt container */}
      <div className={styles.ganttOuter} ref={scrollRef}>
        <div style={{ width: totalWidth, minWidth: '100%', position: 'relative' }}>

          {/* ---- Sticky double header ---- */}
          <div className={styles.headerRow} style={{ height: HEADER_H }}>
            {/* Label column corner */}
            <div className={styles.cornerCell} style={{ width: LABEL_WIDTH, height: HEADER_H }} />

            {/* Month segments */}
            <div
              className={styles.monthsRow}
              style={{ left: LABEL_WIDTH, height: HEADER_MONTH_H, width: totalGridWidth }}
            >
              {monthSegments.map((seg, i) => (
                <div
                  key={i}
                  className={styles.monthCell}
                  style={{ left: seg.offset * DAY_PX, width: seg.days * DAY_PX }}
                >
                  {seg.label}
                </div>
              ))}
            </div>

            {/* Day ticks */}
            <div
              className={styles.daysRow}
              style={{ left: LABEL_WIDTH, top: HEADER_MONTH_H, height: HEADER_DAY_H, width: totalGridWidth }}
            >
              {dayTicks.map((tick, i) => (
                <div
                  key={i}
                  className={`${styles.dayCell} ${tick.isWeekend ? styles.dayCellWeekend : ''}`}
                  style={{ left: i * DAY_PX, width: DAY_PX }}
                >
                  {tick.showLabel && (
                    <span className={styles.dayLabel}>{tick.date.getDate()}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ---- Today vertical line ---- */}
          {todayOff >= 0 && todayOff <= totalDays && (
            <div
              className={styles.todayLine}
              style={{ left: LABEL_WIDTH + todayOff * DAY_PX, top: 0 }}
            >
              <span className={styles.todayLabel}>Hoy</span>
            </div>
          )}

          {/* ---- Groups and rows ---- */}
          {rows.length === 0 ? (
            <div className={styles.empty}>
              <Icon name="calendar times outline" size="large" />
              <p>No hay tarjetas con fechas. Agrega fechas de vencimiento a tus tarjetas para verlas en el Gantt.</p>
            </div>
          ) : (
            groupedRows.map(({ list, rows: listRows }) => {
              const color = listColorMap[list.id] || LIST_PALETTE[0];
              return (
                <React.Fragment key={list.id}>
                  {/* List group header */}
                  <div className={styles.groupHeader} style={{ height: ROW_HEIGHT }}>
                    <div
                      className={styles.groupHeaderLabel}
                      style={{ width: LABEL_WIDTH, borderLeft: `4px solid ${color}` }}
                    >
                      <span className={styles.groupDot} style={{ background: color }} />
                      <span className={styles.groupName}>{list.name}</span>
                      <span className={styles.groupCount}>{listRows.length}</span>
                    </div>
                    <div
                      className={styles.groupHeaderTrack}
                      style={{ width: totalGridWidth, height: ROW_HEIGHT }}
                    >
                      {/* Weekend shading */}
                      {dayTicks.map((tick, i) =>
                        tick.isWeekend ? (
                          <div
                            key={i}
                            className={styles.weekendShade}
                            style={{ left: i * DAY_PX, width: DAY_PX }}
                          />
                        ) : null,
                      )}
                    </div>
                  </div>

                  {/* Card rows */}
                  {listRows.map((card) => {
                    const startOff = dayOff(card.barStart);
                    const widthDays = card.durationDays;
                    const barWidth = Math.max(DAY_PX, widthDays * DAY_PX);
                    const isPast = card.barEnd < today;
                    const isActive = card.barStart <= today && card.barEnd >= today;
                    const displayName = truncate(card.name, 30);
                    const showBarLabel = barWidth >= 60;

                    let barBg = color;
                    if (isPast) barBg = '#a0aec0';

                    return (
                      <div key={card.id} className={styles.cardRow} style={{ height: ROW_HEIGHT }}>
                        {/* Label cell */}
                        <div className={styles.cardLabel} style={{ width: LABEL_WIDTH }}>
                          <span
                            className={styles.cardName}
                            title={card.name}
                          >
                            {displayName}
                          </span>
                          {card.dueDate && (
                            <span
                              className={`${styles.dueBadge} ${isPast ? styles.dueBadgePast : ''}`}
                            >
                              {new Date(card.dueDate).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                          )}
                        </div>

                        {/* Track cell */}
                        <div
                          className={styles.cardTrack}
                          style={{ width: totalGridWidth, height: ROW_HEIGHT }}
                        >
                          {/* Weekend shading */}
                          {dayTicks.map((tick, i) =>
                            tick.isWeekend ? (
                              <div
                                key={i}
                                className={styles.weekendShade}
                                style={{ left: i * DAY_PX, width: DAY_PX }}
                              />
                            ) : null,
                          )}

                          {/* Gantt bar */}
                          <div
                            className={`${styles.bar} ${isActive ? styles.barActive : ''} ${isPast ? styles.barPast : ''}`}
                            style={{
                              left: startOff * DAY_PX,
                              width: barWidth,
                              background: barBg,
                            }}
                            title={`${card.name}\nInicio: ${card.barStart.toLocaleDateString('es-ES')}\nFin: ${card.barEnd.toLocaleDateString('es-ES')} (${widthDays} días)`}
                            onClick={() => handleBarClick(card)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleBarClick(card)}
                          >
                            {showBarLabel && (
                              <span className={styles.barLabel}>{displayName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {isCardModalOpened && <CardModal />}
    </div>
  );
});

GanttView.displayName = 'GanttView';

export default GanttView;
