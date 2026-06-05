/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'redux-orm';
import { Icon } from 'semantic-ui-react';

import orm from '../../../orm';
import selectors from '../../../selectors';
import CardModal from '../../cards/CardModal';

import styles from './CalendarView.module.scss';

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

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const PRIORITY_COLORS = {
  low: '#38a169', medium: '#d69e2e', high: '#dd6b20', critical: '#e53e3e',
};

const CalendarView = React.memo(() => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const isCardModalOpened = useSelector(state => !!selectors.selectPath(state).cardId);
  const allCards = useSelector(selectAllBoardCards);

  // All cards with due dates grouped by day
  const cardsByDay = useMemo(() => {
    const map = {};
    allCards.forEach(card => {
      if (!card.dueDate) return;
      const d = new Date(card.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!map[key]) map[key] = [];
        map[key].push(card);
      }
    });
    return map;
  }, [allCards, year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const totalCards = Object.values(cardsByDay).flat().length;

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={prevMonth}><Icon name="chevron left" /></button>
        <div className={styles.headerCenter}>
          <Icon name="calendar alternate" />
          <span className={styles.monthTitle}>{MONTHS[month]} {year}</span>
          <span className={styles.badge}>{totalCards} tarjetas</span>
        </div>
        <button className={styles.navBtn} onClick={nextMonth}><Icon name="chevron right" /></button>
      </div>

      {/* Day names */}
      <div className={styles.dayNames}>
        {DAYS.map(d => <div key={d} className={styles.dayName}>{d}</div>)}
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {cells.map((day, i) => {
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const dayCards = day ? (cardsByDay[day] || []) : [];
          return (
            <div
              key={i}
              className={`${styles.cell} ${!day ? styles.cellEmpty : ''} ${isToday ? styles.cellToday : ''}`}
            >
              {day && (
                <>
                  <span className={styles.dayNum}>{day}</span>
                  <div className={styles.cardList}>
                    {dayCards.slice(0, 3).map(card => (
                      <div
                        key={card.id}
                        className={styles.cardItem}
                        style={{ borderLeftColor: PRIORITY_COLORS[card.priority] || '#a0aec0' }}
                        title={`${card.name} — ${card.listName}`}
                      >
                        <span className={styles.cardText}>{card.name}</span>
                      </div>
                    ))}
                    {dayCards.length > 3 && (
                      <div className={styles.more}>+{dayCards.length - 3} más</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {Object.entries(PRIORITY_COLORS).map(([k, c]) => (
          <span key={k} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: c }} />
            {k === 'low' ? 'Baja' : k === 'medium' ? 'Media' : k === 'high' ? 'Alta' : 'Crítica'}
          </span>
        ))}
      </div>

      {isCardModalOpened && <CardModal />}
    </div>
  );
});

export default CalendarView;
