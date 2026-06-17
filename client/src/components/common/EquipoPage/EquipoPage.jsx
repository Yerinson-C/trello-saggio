/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React, { useState, useMemo } from 'react';
import { Icon } from 'semantic-ui-react';

import styles from './EquipoPage.module.scss';

const MOCK_CONSULTORES = [
  { id: 1, nombre: 'Valentina Torres', rol: 'Senior Consultant', proyectos: ['Cementos del Valle', 'Agroex Colombia', 'Bancolombia'], horasMes: 142, horasFacturables: 128, capacidad: 160, especialidad: 'Huella de Carbono' },
  { id: 2, nombre: 'Sebastián Morales', rol: 'Consultant', proyectos: ['Chocolates Dulce', 'Transporte del Sur'], horasMes: 98, horasFacturables: 90, capacidad: 160, especialidad: 'Huella Hídrica' },
  { id: 3, nombre: 'Daniela Ríos', rol: 'Junior Consultant', proyectos: ['Bancolombia'], horasMes: 62, horasFacturables: 50, capacidad: 160, especialidad: 'Reporte GRI / ESG' },
  { id: 4, nombre: 'Andrés Castillo', rol: 'Senior Consultant', proyectos: ['Cementos del Valle', 'Chocolates Dulce'], horasMes: 155, horasFacturables: 148, capacidad: 160, especialidad: 'ACV / LCA' },
  { id: 5, nombre: 'Manuela Ospina', rol: 'Consultant', proyectos: ['Agroex Colombia', 'Transporte del Sur'], horasMes: 110, horasFacturables: 98, capacidad: 160, especialidad: 'Huella de Carbono' },
];

const MOCK_PROYECTOS_HORAS = [
  { proyecto: 'Cementos del Valle', horas: 156, presupuesto: 200, cliente: 'Cementos del Valle S.A.' },
  { proyecto: 'Agroex Colombia', horas: 98, presupuesto: 120, cliente: 'Agroex Colombia Ltda.' },
  { proyecto: 'Bancolombia Regional', horas: 62, presupuesto: 160, cliente: 'Bancolombia Regional' },
  { proyecto: 'Chocolates Dulce', horas: 44, presupuesto: 80, cliente: 'Chocolates Dulce S.A.' },
  { proyecto: 'Transporte del Sur', horas: 31, presupuesto: 60, cliente: 'Transporte del Sur S.A.S.' },
];

function getUtilColor(pct) {
  if (pct >= 80) return styles.green;
  if (pct >= 60) return styles.orange;
  return styles.red;
}

function getSvgColor(pct) {
  if (pct >= 60) return '#61bd4f';
  if (pct >= 30) return '#ff9f1a';
  return '#eb5a46';
}

const CIRCUMFERENCE = 2 * Math.PI * 24; // ~150.796

function EquipoPage() {
  const stats = useMemo(() => {
    const totalHoras = MOCK_CONSULTORES.reduce((s, c) => s + c.horasMes, 0);
    const totalFacturables = MOCK_CONSULTORES.reduce((s, c) => s + c.horasFacturables, 0);
    const totalCapacidad = MOCK_CONSULTORES.reduce((s, c) => s + c.capacidad, 0);
    const utilizacion = (totalHoras / totalCapacidad) * 100;
    const pctFacturable = (totalFacturables / totalHoras) * 100;
    return { totalHoras, totalFacturables, utilizacion, pctFacturable };
  }, []);

  const maxPresupuesto = 200;

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>
            <Icon name="users" />
            Equipo y Rendimiento
          </div>
          <div className={styles.pageSubtitle}>Métricas de utilización y carga de trabajo del equipo</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#172b4d' }}>{stats.totalHoras}h</div>
          <div className={styles.statLabel}>Total horas este mes</div>
          <div className={`${styles.statTrend} ${styles.trendUp}`}>
            <Icon name="arrow up" size="small" /> +12% vs mes anterior
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#0079bf' }}>{stats.totalFacturables}h</div>
          <div className={styles.statLabel}>Horas facturables</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: stats.utilizacion >= 80 ? '#61bd4f' : '#ff9f1a' }}>
            {stats.utilizacion.toFixed(1)}%
          </div>
          <div className={styles.statLabel}>Utilización del equipo</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#61bd4f' }}>{stats.pctFacturable.toFixed(1)}%</div>
          <div className={styles.statLabel}>% Facturable</div>
        </div>
      </div>

      {/* Section 1 — Carga por Consultor */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <Icon name="table" />
          Carga por Consultor
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Consultor</th>
              <th>Rol</th>
              <th>Especialidad</th>
              <th>Horas mes</th>
              <th>Facturable</th>
              <th>Utilización</th>
              <th>Proyectos activos</th>
              <th>Disponibilidad</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CONSULTORES.map((c) => {
              const util = (c.horasMes / c.capacidad) * 100;
              const disponibilidad = c.capacidad - c.horasMes;
              const colorClass = getUtilColor(util);
              return (
                <tr key={c.id}>
                  <td><span className={styles.consultorName}>{c.nombre}</span></td>
                  <td><span className={styles.rolBadge}>{c.rol}</span></td>
                  <td>{c.especialidad}</td>
                  <td>{c.horasMes}h</td>
                  <td>{c.horasFacturables}h</td>
                  <td>
                    <span>{util.toFixed(0)}%</span>
                    <span className={styles.progressMini}>
                      <span
                        className={`${styles.progressMiniBar} ${colorClass}`}
                        style={{ width: `${Math.min(util, 100)}%` }}
                      />
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#e6f3ff',
                      color: '#0052cc',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>
                      {c.proyectos.length}
                    </span>
                  </td>
                  <td style={{ color: disponibilidad > 20 ? '#61bd4f' : disponibilidad > 0 ? '#ff9f1a' : '#eb5a46', fontWeight: 600 }}>
                    {disponibilidad}h libres
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 2 — Horas por Proyecto */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <Icon name="clock outline" />
          Horas por Proyecto
        </div>
        <div className={styles.chartArea}>
          {MOCK_PROYECTOS_HORAS.map((p) => {
            const barPct = (p.horas / maxPresupuesto) * 100;
            const budgetPct = (p.presupuesto / maxPresupuesto) * 100;
            return (
              <div key={p.proyecto} className={styles.chartRow}>
                <div className={styles.chartLabel} title={`${p.proyecto} — ${p.cliente}`}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#172b4d' }}>{p.proyecto}</div>
                  <div style={{ fontSize: '11px', color: '#6b808c' }}>{p.cliente}</div>
                </div>
                <div className={styles.chartBarWrapper}>
                  <div className={styles.chartBar} style={{ width: `${barPct}%` }} />
                  <div className={styles.chartBudgetLine} style={{ left: `${budgetPct}%` }} />
                </div>
                <div className={styles.chartValue}>{p.horas}h / {p.presupuesto}h ppto</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b808c', textAlign: 'center' }}>
          Horas presupuestadas vs ejecutadas este mes
        </div>
      </div>

      {/* Section 3 — Disponibilidad del equipo esta semana */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <Icon name="calendar alternate outline" />
          Disponibilidad del equipo esta semana
        </div>
        <div className={styles.availabilityGrid}>
          {MOCK_CONSULTORES.map((c) => {
            const horasSemanaUsadas = Math.round(c.horasMes / 4);
            const horasSemanaLibres = Math.max(0, 40 - horasSemanaUsadas);
            const pctDisponible = (horasSemanaLibres / 40) * 100;
            const color = getSvgColor(pctDisponible);
            const dashoffset = CIRCUMFERENCE * (1 - pctDisponible / 100);
            return (
              <div key={c.id} className={styles.availCard}>
                <div className={styles.availName}>{c.nombre}</div>
                <div className={styles.availRol}>{c.rol}</div>
                <svg width="64" height="64" className={styles.svgProgress}>
                  <circle
                    cx="32"
                    cy="32"
                    r="24"
                    fill="none"
                    stroke="#dfe1e6"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="24"
                    fill="none"
                    stroke={color}
                    strokeWidth="6"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className={styles.availHours}>{horasSemanaLibres}h</div>
                <div className={styles.availLabel}>{pctDisponible.toFixed(0)}% disponible</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EquipoPage;
