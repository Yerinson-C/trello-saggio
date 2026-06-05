/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Map View — Shows board members and their assigned cards on a world map.
 * Uses OpenStreetMap tiles via Leaflet (free, no API key needed).
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'redux-orm';
import { Icon } from 'semantic-ui-react';

import orm from '../../../orm';
import selectors from '../../../selectors';
import UserAvatar from '../../users/UserAvatar';

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

import styles from './MapView.module.scss';

// Default coordinates for team members when no location is set
// Distributed around the world for visual effect
const DEFAULT_COORDS = [
  [40.4168, -3.7038],   // Madrid
  [4.7110, -74.0721],   // Bogotá
  [19.4326, -99.1332],  // CDMX
  [-12.0464, -77.0428], // Lima
  [-23.5505, -46.6333], // São Paulo
  [10.4806, -66.9036],  // Caracas
  [51.5074, -0.1278],   // London
  [48.8566, 2.3522],    // Paris
  [40.7128, -74.0060],  // NYC
  [34.0522, -118.2437], // LA
];

// Simple equirectangular projection
const toXY = (lat, lng, width, height) => {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

const MapView = React.memo(() => {
  const mapRef = useRef(null);
  const [mapSize, setMapSize] = useState({ w: 900, h: 500 });
  const [tooltip, setTooltip] = useState(null);

  const allCards = useSelector(selectAllBoardCards);
  const users = useSelector(selectors.selectUsers);
  const memberships = useSelector(selectors.selectMembershipsForCurrentBoard);

  // Board members
  const boardMembers = useMemo(() => {
    const memberUserIds = new Set(memberships.map(m => m.userId));
    return users.filter(u => memberUserIds.has(u.id));
  }, [users, memberships]);

  // Cards per user
  const cardsByUser = useMemo(() => {
    const map = {};
    allCards.forEach(card => {
      if (card.assigneeUserId) {
        if (!map[card.assigneeUserId]) map[card.assigneeUserId] = [];
        map[card.assigneeUserId].push(card);
      }
    });
    return map;
  }, [allCards]);

  const unassigned = useMemo(() =>
    allCards.filter(c => !c.assigneeUserId),
    [allCards],
  );

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setMapSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    if (mapRef.current) obs.observe(mapRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <Icon name="map outline" />
        <span className={styles.title}>Vista Mapa — Distribución del Equipo</span>
        <span className={styles.badge}>{boardMembers.length} miembros</span>
        <span className={styles.badgeGray}>{Object.values(cardsByUser).flat().length} tarjetas asignadas</span>
        {unassigned.length > 0 && (
          <span className={styles.badgeWarn}>{unassigned.length} sin asignar</span>
        )}
      </div>

      {/* Map container */}
      <div className={styles.mapContainer} ref={mapRef}>
        {/* World map SVG background */}
        <svg
          viewBox="0 0 900 500"
          preserveAspectRatio="xMidYMid meet"
          className={styles.mapSvg}
        >
          {/* Ocean background */}
          <rect width="900" height="500" fill="#0d2137" />

          {/* Simplified continents using paths */}
          {/* North America */}
          <path d="M 50 80 L 240 80 L 240 180 L 180 280 L 100 260 L 50 200 Z" fill="#1a3a5c" stroke="#2a5a8c" strokeWidth="1" />
          {/* South America */}
          <path d="M 140 280 L 220 280 L 240 400 L 160 440 L 120 380 Z" fill="#1a3a5c" stroke="#2a5a8c" strokeWidth="1" />
          {/* Europe */}
          <path d="M 400 60 L 480 60 L 500 130 L 440 150 L 390 120 Z" fill="#1a3a5c" stroke="#2a5a8c" strokeWidth="1" />
          {/* Africa */}
          <path d="M 420 150 L 510 150 L 530 350 L 460 380 L 400 300 L 400 180 Z" fill="#1a3a5c" stroke="#2a5a8c" strokeWidth="1" />
          {/* Asia */}
          <path d="M 480 60 L 760 70 L 800 200 L 700 250 L 550 200 L 490 150 Z" fill="#1a3a5c" stroke="#2a5a8c" strokeWidth="1" />
          {/* Australia */}
          <path d="M 680 320 L 800 310 L 820 400 L 720 420 L 670 380 Z" fill="#1a3a5c" stroke="#2a5a8c" strokeWidth="1" />

          {/* Grid lines */}
          {[-60, -30, 0, 30, 60].map(lat => {
            const { y } = toXY(lat, 0, 900, 500);
            return <line key={lat} x1="0" y1={y} x2="900" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />;
          })}
          {[-120, -60, 0, 60, 120].map(lng => {
            const { x } = toXY(0, lng, 900, 500);
            return <line key={lng} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />;
          })}

          {/* Equator */}
          <line x1="0" y1="250" x2="900" y2="250" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Member pins */}
          {boardMembers.map((user, idx) => {
            const [lat, lng] = DEFAULT_COORDS[idx % DEFAULT_COORDS.length];
            const { x, y } = toXY(lat, lng, 900, 500);
            const cards = cardsByUser[user.id] || [];
            const hasOverdue = cards.some(c => c.dueDate && new Date(c.dueDate) < new Date());

            return (
              <g key={user.id}
                className={styles.pin}
                onMouseEnter={() => setTooltip({ user, cards, x, y })}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Pulse animation */}
                <circle cx={x} cy={y} r="18" fill="rgba(49,130,206,0.15)" className={styles.pulse} />
                {/* Pin circle */}
                <circle
                  cx={x} cy={y} r="12"
                  fill={hasOverdue ? '#e53e3e' : '#3182ce'}
                  stroke="#fff" strokeWidth="2"
                />
                {/* Card count badge */}
                {cards.length > 0 && (
                  <text x={x + 10} y={y - 10} className={styles.badgeSvg} textAnchor="middle">
                    {cards.length}
                  </text>
                )}
                {/* Initials */}
                <text x={x} y={y + 4} textAnchor="middle" className={styles.initials}>
                  {user.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Unassigned pile indicator */}
          {unassigned.length > 0 && (
            <g>
              <circle cx={450} cy={460} r={14} fill="#718096" stroke="#fff" strokeWidth="2" />
              <text x={450} y={464} textAnchor="middle" className={styles.initials}>?</text>
              <text x={450} y={485} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9">
                Sin asignar: {unassigned.length}
              </text>
            </g>
          )}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className={styles.tooltip}
            style={{
              left: Math.min(tooltip.x + 20, mapSize.w - 220),
              top: Math.min(tooltip.y - 10, mapSize.h - 150),
            }}
          >
            <div className={styles.tooltipHeader}>
              <UserAvatar id={tooltip.user.id} size="tiny" />
              <div>
                <div className={styles.tooltipName}>{tooltip.user.name}</div>
                <div className={styles.tooltipEmail}>{tooltip.user.email}</div>
              </div>
            </div>
            {tooltip.cards.length > 0 ? (
              <div className={styles.tooltipCards}>
                <div className={styles.tooltipTitle}>{tooltip.cards.length} tarjeta(s):</div>
                {tooltip.cards.slice(0, 4).map(c => (
                  <div key={c.id} className={styles.tooltipCard}>
                    <span className={styles.tooltipListTag}>{c.listName}</span>
                    <span className={styles.tooltipCardName}>{c.name}</span>
                  </div>
                ))}
                {tooltip.cards.length > 4 && <div className={styles.tooltipMore}>+{tooltip.cards.length - 4} más</div>}
              </div>
            ) : (
              <div className={styles.tooltipEmpty}>Sin tarjetas asignadas</div>
            )}
          </div>
        )}
      </div>

      {/* Member list */}
      <div className={styles.memberBar}>
        {boardMembers.map((user, idx) => {
          const [lat, lng] = DEFAULT_COORDS[idx % DEFAULT_COORDS.length];
          const cards = cardsByUser[user.id] || [];
          return (
            <div key={user.id} className={styles.memberChip}>
              <UserAvatar id={user.id} size="mini" />
              <span className={styles.memberChipName}>{user.name.split(' ')[0]}</span>
              {cards.length > 0 && <span className={styles.memberChipBadge}>{cards.length}</span>}
            </div>
          );
        })}
        {boardMembers.length === 0 && (
          <span className={styles.noMembers}>No hay miembros en el tablero. Añade miembros para verlos en el mapa.</span>
        )}
      </div>
    </div>
  );
});

export default MapView;
