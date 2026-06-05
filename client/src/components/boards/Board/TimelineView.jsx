/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'redux-orm';
import { Icon } from 'semantic-ui-react';

import orm from '../../../orm';
import selectors from '../../../selectors';
import CardModal from '../../cards/CardModal';

const selectAllBoardCards = createSelector(
  orm,
  (state) => selectors.selectPath(state).boardId,
  ({ Board }, boardId) => {
    if (!boardId) return [];
    const board = Board.withId(boardId);
    if (!board) return [];
    const result = [];
    board.getKanbanListsQuerySet().toModelArray().forEach(list => {
      list.getCardsModelArray().forEach(card => {
        result.push({ ...card.ref, listName: list.ref.name });
      });
    });
    return result;
  },
);

import styles from './TimelineView.module.scss';

const PRIORITY_COLORS = {
  low: '#38a169', medium: '#3182ce', high: '#dd6b20', critical: '#e53e3e',
};

const DAY_WIDTH = 40; // px per day

const TimelineView = React.memo(() => {
  const isCardModalOpened = useSelector(state => !!selectors.selectPath(state).cardId);
  const allCards = useSelector(selectAllBoardCards);
  const scrollRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // All cards with dates
  const rows = useMemo(() => allCards.map(card => {
    const created = new Date(card.createdAt || Date.now());
    const due = card.dueDate ? new Date(card.dueDate) : new Date(created.getTime() + 7 * 86400000);
    return { ...card, createdDate: created, dueDate: due };
  }), [allCards]);

  // Time range: from earliest to latest
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (rows.length === 0) {
      const min = new Date(today); min.setDate(min.getDate() - 7);
      const max = new Date(today); max.setDate(max.getDate() + 30);
      return { minDate: min, maxDate: max, totalDays: 37 };
    }
    const minD = new Date(Math.min(...rows.map(r => r.createdDate.getTime())));
    const maxD = new Date(Math.max(...rows.map(r => r.dueDate.getTime())));
    minD.setDate(minD.getDate() - 3);
    maxD.setDate(maxD.getDate() + 5);
    const total = Math.ceil((maxD - minD) / 86400000);
    return { minDate: minD, maxDate: maxD, totalDays: total };
  }, [rows]);

  const dayOffset = (date) => Math.max(0, Math.floor((date - minDate) / 86400000));
  const todayOffset = dayOffset(today);

  // Generate column headers (weeks)
  const headers = useMemo(() => {
    const result = [];
    const d = new Date(minDate);
    while (d <= maxDate) {
      result.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
    return result;
  }, [minDate, maxDate]);

  // Generate day ticks
  const days = useMemo(() => Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(minDate);
    d.setDate(d.getDate() + i);
    return d;
  }), [minDate, totalDays]);

  const LABEL_WIDTH = 220;
  const totalWidth = totalDays * DAY_WIDTH + LABEL_WIDTH;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Icon name="chart bar" />
        <span className={styles.title}>Vista Cronología (Gantt)</span>
        <span className={styles.badge}>{rows.length} tarjetas</span>
        <span className={styles.hint}>← Desplaza horizontalmente →</span>
      </div>

      <div className={styles.timelineWrapper} ref={scrollRef}>
        <div style={{ width: totalWidth, minWidth: '100%', position: 'relative' }}>
          {/* Column headers - week labels */}
          <div className={styles.weekRow} style={{ marginLeft: LABEL_WIDTH }}>
            {headers.map((d, i) => (
              <div key={i} className={styles.weekLabel} style={{ width: 7 * DAY_WIDTH }}>
                {d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
              </div>
            ))}
          </div>

          {/* Day tick row */}
          <div className={styles.dayRow} style={{ marginLeft: LABEL_WIDTH }}>
            {days.map((d, i) => (
              <div
                key={i}
                className={`${styles.dayTick} ${d.getDay() === 0 || d.getDay() === 6 ? styles.weekend : ''}`}
                style={{ width: DAY_WIDTH }}
              >
                <span className={styles.dayNum}>{d.getDate()}</span>
              </div>
            ))}
          </div>

          {/* Today line */}
          {todayOffset >= 0 && todayOffset <= totalDays && (
            <div
              className={styles.todayLine}
              style={{ left: LABEL_WIDTH + todayOffset * DAY_WIDTH }}
            >
              <div className={styles.todayLabel}>Hoy</div>
            </div>
          )}

          {/* Rows */}
          {rows.length === 0 ? (
            <div className={styles.empty}>
              <Icon name="calendar times outline" size="large" />
              <p>No hay tarjetas. Agrega tarjetas con fechas para verlas aquí.</p>
            </div>
          ) : (
            rows.map((card, idx) => {
              const startOff = dayOffset(card.createdDate);
              const endOff = dayOffset(card.dueDate);
              const barWidth = Math.max(DAY_WIDTH, (endOff - startOff) * DAY_WIDTH);
              const isPast = card.dueDate < today;
              const color = PRIORITY_COLORS[card.priority] || '#3182ce';

              return (
                <div key={card.id} className={styles.taskRow}>
                  <div className={styles.taskLabel} style={{ width: LABEL_WIDTH }}>
                    <div className={styles.taskLabelInner}>
                      <span className={styles.listTag} style={{ background: color + '30', color }}>{card.listName}</span>
                      <span className={styles.taskName} title={card.name}>{card.name}</span>
                    </div>
                  </div>
                  <div className={styles.taskTrack} style={{ width: totalDays * DAY_WIDTH }}>
                    {/* Weekend shading */}
                    {days.map((d, i) => (d.getDay() === 0 || d.getDay() === 6) && (
                      <div key={i} className={styles.weekendShade} style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }} />
                    ))}
                    {/* Bar */}
                    <div
                      className={styles.bar}
                      style={{
                        left: startOff * DAY_WIDTH,
                        width: barWidth,
                        background: isPast ? '#e53e3e' : color,
                        opacity: isPast ? 0.7 : 1,
                      }}
                      title={`${card.name}\nInicio: ${card.createdDate.toLocaleDateString('es-ES')}\nVence: ${card.dueDate.toLocaleDateString('es-ES')}`}
                    >
                      <span className={styles.barLabel}>{card.name}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isCardModalOpened && <CardModal />}
    </div>
  );
});

export default TimelineView;
