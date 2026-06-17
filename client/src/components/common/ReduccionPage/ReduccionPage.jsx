/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useState, useCallback } from 'react';
import { Icon } from 'semantic-ui-react';

import styles from './ReduccionPage.module.scss';

const MOCK_TARGETS = [
  { id: 1, client: 'Cementos del Valle S.A.', baseYear: 2020, baseEmissions: 210.3, targetYear: 2030, targetReduction: 45, standard: 'SBTi 1.5°C', scope: 'Alcance 1 y 2' },
  { id: 2, client: 'Agroex Colombia Ltda.', baseYear: 2021, baseEmissions: 87.4, targetYear: 2030, targetReduction: 30, standard: 'GHG Protocol', scope: 'Alcance 1, 2 y 3' },
  { id: 3, client: 'Bancolombia Regional', baseYear: 2019, baseEmissions: 45.2, targetYear: 2035, targetReduction: 60, standard: 'Net Zero', scope: 'Todos los alcances' },
];

const MOCK_ANNUAL = [
  { year: 2020, emissions: 210.3, client: 'Cementos del Valle S.A.' },
  { year: 2021, emissions: 198.7, client: 'Cementos del Valle S.A.' },
  { year: 2022, emissions: 185.1, client: 'Cementos del Valle S.A.' },
  { year: 2023, emissions: 167.4, client: 'Cementos del Valle S.A.' },
  { year: 2024, emissions: 142.5, client: 'Cementos del Valle S.A.' },
];

const MOCK_ACTIONS = [
  { id: 1, action: 'Sustitución calderas a gas natural', category: 'Eficiencia energética', reduction: 18.5, cost: 280000000, status: 'implementado', year: 2022 },
  { id: 2, action: 'Panel solar 200 kWp planta principal', category: 'Energías renovables', reduction: 12.3, cost: 420000000, status: 'implementado', year: 2023 },
  { id: 3, action: 'Electrificación flota de distribución', category: 'Movilidad eléctrica', reduction: 8.7, cost: 650000000, status: 'en_progreso', year: 2025 },
  { id: 4, action: 'Compensación forestal 100 ha', category: 'Compensación', reduction: 15.0, cost: 95000000, status: 'planificado', year: 2026 },
  { id: 5, action: 'Optimización proceso clinker', category: 'Proceso industrial', reduction: 22.0, cost: 1200000000, status: 'planificado', year: 2027 },
];

const MAX_CHART_EMISSIONS = 250;
const CHART_HEIGHT = 200;
const TARGET_EMISSIONS_2030 = 210.3 * 0.55; // 115.665 tCO₂e

function formatCOP(value) {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(0)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${value.toLocaleString('es-CO')}`;
}

function StatusBadge({ status }) {
  if (status === 'implementado') {
    return <span className={`${styles.badge} ${styles.badgeImplementado}`}>Implementado</span>;
  }
  if (status === 'en_progreso') {
    return <span className={`${styles.badge} ${styles.badgeEnProgreso}`}>En progreso</span>;
  }
  return <span className={`${styles.badge} ${styles.badgePlanificado}`}>Planificado</span>;
}

function ProgressMini({ pct }) {
  const clamped = Math.min(100, Math.max(0, pct));
  let barClass = styles.barRed;
  if (clamped >= 80) barClass = styles.barGreen;
  else if (clamped >= 50) barClass = styles.barBlue;

  return (
    <span className={styles.progressMini}>
      <span className={`${styles.progressMiniBar} ${barClass}`} style={{ width: `${clamped}%` }} />
    </span>
  );
}

function TabComparador() {
  const baseEmissions = 210.3;
  const latestEmissions = 142.5;
  const absoluteReduction = baseEmissions - latestEmissions;
  const pctReduction = ((absoluteReduction / baseEmissions) * 100).toFixed(1);

  const targetLineBottom = (TARGET_EMISSIONS_2030 / MAX_CHART_EMISSIONS) * CHART_HEIGHT;

  return (
    <>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>210.3 tCO₂e</div>
          <div className={styles.statLabel}>Emisiones base (2020)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>142.5 tCO₂e</div>
          <div className={styles.statLabel}>Emisiones 2024</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#61bd4f' }}>-{pctReduction}%</div>
          <div className={styles.statLabel}>Reducción acumulada (-{absoluteReduction.toFixed(1)} tCO₂e)</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Evolución anual de emisiones</div>
        <div style={{ position: 'relative' }}>
          <div className={styles.chartArea}>
            {MOCK_ANNUAL.map((item) => {
              const barHeight = (item.emissions / MAX_CHART_EMISSIONS) * CHART_HEIGHT;
              return (
                <div
                  key={item.year}
                  className={styles.bar}
                  style={{ height: `${barHeight}px` }}
                >
                  <span className={styles.barValue}>{item.emissions}</span>
                  <span className={styles.barLabel}>{item.year}</span>
                </div>
              );
            })}
            <div
              className={styles.targetLine}
              style={{ bottom: `${targetLineBottom + 24}px` }}
            >
              <span className={styles.targetLabel}>Meta 2030: {TARGET_EMISSIONS_2030.toFixed(1)} tCO₂e</span>
            </div>
          </div>
        </div>
        <p className={styles.trendText}>
          Tendencia: -16.8 tCO₂e/año promedio. Al ritmo actual, alcanzarás la meta SBTi en 2028.
        </p>
      </div>
    </>
  );
}

function TabMetas() {
  const currentEmissions = 142.5;

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Metas de reducción registradas</div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Año base</th>
              <th>Emisiones base</th>
              <th>Meta (año)</th>
              <th>% Reducción</th>
              <th>Norma</th>
              <th>Alcance</th>
              <th>Progreso</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TARGETS.map((t) => {
              const currentPct = ((t.baseEmissions - currentEmissions) / t.baseEmissions) * 100;
              const progressPct = (currentPct / t.targetReduction) * 100;
              const clampedProgress = Math.min(100, Math.max(0, progressPct));

              let barClass = styles.barRed;
              if (clampedProgress >= 80) barClass = styles.barGreen;
              else if (clampedProgress >= 50) barClass = styles.barBlue;

              return (
                <tr key={t.id}>
                  <td>{t.client}</td>
                  <td>{t.baseYear}</td>
                  <td>{t.baseEmissions.toFixed(1)} tCO₂e</td>
                  <td>{t.targetYear}</td>
                  <td>{t.targetReduction}%</td>
                  <td>{t.standard}</td>
                  <td>{t.scope}</td>
                  <td>
                    <span className={styles.progressMini}>
                      <span
                        className={`${styles.progressMiniBar} ${barClass}`}
                        style={{ width: `${clampedProgress}%` }}
                      />
                    </span>
                    {' '}
                    <span style={{ fontSize: '11px', color: '#6b808c' }}>
                      {currentPct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button type="button" className={styles.addBtn}>
        <Icon name="plus" /> Agregar nueva meta
      </button>
    </div>
  );
}

function TabAcciones() {
  const totalReduction = MOCK_ACTIONS.reduce((sum, a) => sum + a.reduction, 0);
  const totalCost = MOCK_ACTIONS.reduce((sum, a) => sum + a.cost, 0);

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Plan de acciones de reducción</div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Acción</th>
              <th>Categoría</th>
              <th>Reducción estimada (tCO₂e)</th>
              <th>Inversión</th>
              <th>Estado</th>
              <th>Año previsto</th>
              <th>Verificado</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ACTIONS.map((a) => (
              <tr key={a.id}>
                <td>{a.action}</td>
                <td>{a.category}</td>
                <td>{a.reduction.toFixed(1)}</td>
                <td>{formatCOP(a.cost)} COP</td>
                <td><StatusBadge status={a.status} /></td>
                <td>{a.year}</td>
                <td>
                  {a.status === 'implementado' ? (
                    <Icon name="check circle" color="green" />
                  ) : (
                    <Icon name="circle outline" color="grey" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.summaryRow}>
        <span>Reducción total planificada: {totalReduction.toFixed(1)} tCO₂e</span>
        <span>Inversión total: {formatCOP(totalCost)} COP</span>
      </div>
      <button type="button" className={styles.addBtn}>
        <Icon name="plus" /> Agregar acción
      </button>
    </div>
  );
}

const ReduccionPage = () => {
  const [selectedClient, setSelectedClient] = useState('Cementos del Valle S.A.');
  const [activeTab, setActiveTab] = useState('comparador');

  const clients = MOCK_TARGETS.map((t) => t.client);

  const handleExportCSV = useCallback(() => {
    let csv, filename;
    if (activeTab === 'comparador') {
      csv = 'Año,Emisiones (tCO₂e),Cliente\n' + MOCK_ANNUAL.map(r => [r.year, r.emissions, r.client].join(',')).join('\n');
      filename = 'comparador_emisiones.csv';
    } else if (activeTab === 'metas') {
      csv = 'Cliente,Año base,Emisiones base,Meta año,% Reducción,Norma,Alcance\n' + MOCK_TARGETS.map(r => [r.client, r.baseYear, r.baseEmissions, r.targetYear, r.targetReduction, r.standard, r.scope].join(',')).join('\n');
      filename = 'metas_reduccion.csv';
    } else {
      csv = 'Acción,Categoría,Reducción estimada (tCO₂e),Inversión COP,Estado,Año previsto\n' + MOCK_ACTIONS.map(r => [r.action, r.category, r.reduction, r.cost, r.status, r.year].join(',')).join('\n');
      filename = 'plan_acciones.csv';
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }, [activeTab]);

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <Icon name="chart line" style={{ color: '#0079bf' }} />
            Reducción y Metas Climáticas
          </h1>
          <p className={styles.pageSubtitle}>Seguimiento de compromisos de reducción de emisiones</p>
        </div>
        <div className={styles.headerRight}>
          <select
            className={styles.clientSelect}
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            {clients.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="button" style={{background:'white',border:'1px solid #0079bf',color:'#0079bf',borderRadius:6,padding:'8px 14px',fontSize:13,fontWeight:600,cursor:'pointer'}} onClick={handleExportCSV}>
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'comparador' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('comparador')}
        >
          <Icon name="bar chart" />
          Comparador Interanual
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'metas' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('metas')}
        >
          <Icon name="flag" />
          Metas de Reducción
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'acciones' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('acciones')}
        >
          <Icon name="tasks" />
          Plan de Acciones
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'comparador' && <TabComparador />}
      {activeTab === 'metas' && <TabMetas />}
      {activeTab === 'acciones' && <TabAcciones />}
    </div>
  );
};

export default ReduccionPage;
