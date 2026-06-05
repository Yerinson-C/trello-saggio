/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'redux-orm';
import { Icon } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';

import orm from '../../../orm';
import selectors from '../../../selectors';
import UserAvatar from '../../users/UserAvatar';
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
        result.push({
          ...card.ref,
          listName: list.ref.name,
          listColor: list.ref.color,
          labels: card.labels ? card.labels.toRefArray() : [],
        });
      });
    });
    return result;
  },
);

import styles from './TableView.module.scss';

const PRIORITY_CONFIG = {
  low:      { label: 'Baja',    color: '#38a169' },
  medium:   { label: 'Media',   color: '#d69e2e' },
  high:     { label: 'Alta',    color: '#dd6b20' },
  critical: { label: 'Crítica', color: '#e53e3e' },
};

const TableView = React.memo(() => {
  const [t] = useTranslation();
  const [openCardId, setOpenCardId] = useState(null);
  const [sortField, setSortField] = useState('position');
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');

  const board = useSelector(selectors.selectCurrentBoard);
  const allCards = useSelector(selectAllBoardCards);
  const isCardModalOpened = useSelector(state => !!selectors.selectPath(state).cardId);

  const filtered = useMemo(() => {
    let cards = allCards;
    if (search) {
      cards = cards.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return [...cards].sort((a, b) => {
      let va = a[sortField] ?? '';
      let vb = b[sortField] ?? '';
      if (sortField === 'dueDate') {
        va = va ? new Date(va).getTime() : Infinity;
        vb = vb ? new Date(vb).getTime() : Infinity;
      } else {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allCards, search, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => sortField === field
    ? <Icon name={sortDir === 'asc' ? 'sort up' : 'sort down'} size="small" />
    : <Icon name="sort" size="small" style={{ opacity: 0.3 }} />;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Icon name="table" />
          <span className={styles.title}>Vista Tabla</span>
          <span className={styles.count}>{filtered.length} tarjetas</span>
        </div>
        <input
          className={styles.search}
          placeholder="Buscar tarjetas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className={styles.thSortable}>
                Título <SortIcon field="name" />
              </th>
              <th onClick={() => handleSort('listName')} className={styles.thSortable}>
                Lista <SortIcon field="listName" />
              </th>
              <th onClick={() => handleSort('priority')} className={styles.thSortable}>
                Prioridad <SortIcon field="priority" />
              </th>
              <th onClick={() => handleSort('dueDate')} className={styles.thSortable}>
                Vencimiento <SortIcon field="dueDate" />
              </th>
              <th>Responsable</th>
              <th>Etiquetas</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  <Icon name="search" />
                  {search ? 'Sin resultados' : 'No hay tarjetas en este tablero'}
                </td>
              </tr>
            ) : (
              filtered.map(card => {
                const p = PRIORITY_CONFIG[card.priority] || PRIORITY_CONFIG.medium;
                const overdue = card.dueDate && new Date(card.dueDate) < new Date();
                return (
                  <tr key={card.id} className={styles.row} onClick={() => setOpenCardId(card.id)}>
                    <td className={styles.tdTitle}>
                      <span className={styles.cardName}>{card.name}</span>
                      {card.description && <Icon name="align left" size="small" className={styles.descIcon} />}
                    </td>
                    <td>
                      <span
                        className={styles.listBadge}
                        style={{ borderColor: card.listColor || '#a0aec0' }}
                      >
                        {card.listName}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.priorityDot}
                        style={{ background: p.color }}
                        title={p.label}
                      />
                      <span style={{ color: p.color, fontWeight: 600, fontSize: 12 }}>{p.label}</span>
                    </td>
                    <td className={overdue ? styles.overdue : ''}>
                      {card.dueDate
                        ? new Date(card.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span style={{ color: '#aaa' }}>—</span>}
                    </td>
                    <td>
                      {card.assigneeUserId
                        ? <UserAvatar id={card.assigneeUserId} size="mini" />
                        : <span style={{ color: '#aaa' }}>—</span>}
                    </td>
                    <td>
                      {card.labels?.length > 0
                        ? card.labels.slice(0, 3).map(l => (
                            <span key={l.id} className={styles.labelDot} style={{ background: l.color }} title={l.name} />
                          ))
                        : <span style={{ color: '#aaa' }}>—</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {(isCardModalOpened || openCardId) && <CardModal />}
    </div>
  );
});

export default TableView;
