/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';

import styles from './CalculadoraPage.module.scss';

/* ── Mock data ───────────────────────────────────────────────────────────── */

const CARBON_ACTIVITIES = [
  {
    id: 1,
    categoria: 'Combustión estacionaria',
    descripcion: 'Gas natural - caldera',
    cantidad: 12500,
    unidad: 'm³',
    factor: 0.00202,
    co2e: 25.25,
    alcance: 'Alcance 1',
  },
  {
    id: 2,
    categoria: 'Combustión móvil',
    descripcion: 'Vehículo diesel empresa',
    cantidad: 4200,
    unidad: 'L',
    factor: 0.00268,
    co2e: 11.26,
    alcance: 'Alcance 1',
  },
  {
    id: 3,
    categoria: 'Electricidad',
    descripcion: 'Consumo red eléctrica',
    cantidad: 85000,
    unidad: 'kWh',
    factor: 0.000126,
    co2e: 10.71,
    alcance: 'Alcance 2',
  },
  {
    id: 4,
    categoria: 'Vuelos',
    descripcion: 'Viajes aéreos corta distancia',
    cantidad: 8,
    unidad: 'vuelos',
    factor: 0.255,
    co2e: 2.04,
    alcance: 'Alcance 3',
  },
  {
    id: 5,
    categoria: 'Residuos',
    descripcion: 'Residuos sólidos a vertedero',
    cantidad: 3200,
    unidad: 'kg',
    factor: 0.000486,
    co2e: 1.56,
    alcance: 'Alcance 3',
  },
];

const WATER_ACTIVITIES = [
  {
    id: 1,
    categoria: 'Agua municipal',
    descripcion: 'Consumo oficina',
    cantidad: 1200,
    unidad: 'm³',
    factor: 1.0,
    huella: 1200,
    tipo: 'Azul',
  },
  {
    id: 2,
    categoria: 'Agua subterránea',
    descripcion: 'Pozo propio',
    cantidad: 850,
    unidad: 'm³',
    factor: 1.0,
    huella: 850,
    tipo: 'Azul',
  },
  {
    id: 3,
    categoria: 'Materia prima agrícola',
    descripcion: 'Cultivo de insumos',
    cantidad: 42000,
    unidad: 'kg',
    factor: 0.101,
    huella: 4240,
    tipo: 'Verde',
  },
  {
    id: 4,
    categoria: 'Tratamiento aguas residuales',
    descripcion: 'Efluentes proceso',
    cantidad: 980,
    unidad: 'm³',
    factor: 1.02,
    huella: 1000,
    tipo: 'Gris',
  },
];

/* ── Scope badge ─────────────────────────────────────────────────────────── */

function ScopeBadge({ label }) {
  const clsMap = {
    'Alcance 1': styles.scope1,
    'Alcance 2': styles.scope2,
    'Alcance 3': styles.scope3,
    Azul:  styles.azul,
    Verde: styles.verde,
    Gris:  styles.gris,
  };
  return (
    <span className={`${styles.scopeBadge} ${clsMap[label] || ''}`}>
      {label}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

const CalculadoraPage = React.memo(() => {
  // eslint-disable-next-line no-unused-vars
  const currentUser = useSelector(selectors.selectCurrentUser);
  const [activeTab, setActiveTab] = useState('carbon');

  return (
    <div className={styles.wrapper}>
      {/* ── Page header ──────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <Icon name="calculator" style={{ color: '#0079bf' }} />
            Calculadora de Huella
          </h1>
          <p className={styles.pageSubtitle}>
            Cuantifica y gestiona la huella ambiental de tus clientes
          </p>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────── */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'carbon' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('carbon')}
        >
          <Icon name="fire" />
          Huella de Carbono
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'water' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('water')}
        >
          <Icon name="tint" />
          Huella Hídrica
        </button>
      </div>

      {/* ── Carbon tab ───────────────────────────────── */}
      {activeTab === 'carbon' && (
        <>
          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>142.5 tCO₂e</div>
              <div className={styles.statLabel}>Total Emisiones</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>45.2 tCO₂e</div>
              <div className={styles.statLabel}>Alcance 1</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>38.1 tCO₂e</div>
              <div className={styles.statLabel}>Alcance 2</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>59.2 tCO₂e</div>
              <div className={styles.statLabel}>Alcance 3</div>
            </div>
          </div>

          {/* Activities table */}
          <div className={styles.card}>
            <div className={styles.tableHeader}>
              <span className={styles.cardTitle}>Actividades de emisión</span>
              <button type="button" className={styles.addBtn}>
                <Icon name="plus" style={{ margin: 0 }} />
                Agregar actividad
              </button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Factor</th>
                    <th>CO₂e (tCO₂e)</th>
                    <th>Alcance</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {CARBON_ACTIVITIES.map((row) => (
                    <tr key={row.id}>
                      <td>{row.categoria}</td>
                      <td>{row.descripcion}</td>
                      <td>{row.cantidad.toLocaleString('es-ES')}</td>
                      <td>{row.unidad}</td>
                      <td>{row.factor}</td>
                      <td><strong>{row.co2e}</strong></td>
                      <td><ScopeBadge label={row.alcance} /></td>
                      <td>
                        <Icon name="pencil" style={{ cursor: 'pointer', color: '#6b808c' }} />
                        <Icon name="trash" style={{ cursor: 'pointer', color: '#eb5a46', marginLeft: 8 }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scope results */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Resultados por Alcance</div>
            <div className={styles.scopeResults}>
              <div className={styles.scopeCard}>
                <div className={styles.scopeLabel}>Alcance 1</div>
                <div className={styles.scopeValue}>45.2 tCO₂e</div>
                <div className={styles.scopePct}>31.7% del total</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '32%', background: '#61bd4f' }} />
                </div>
              </div>
              <div className={styles.scopeCard}>
                <div className={styles.scopeLabel}>Alcance 2</div>
                <div className={styles.scopeValue}>38.1 tCO₂e</div>
                <div className={styles.scopePct}>26.7% del total</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '27%', background: '#0079bf' }} />
                </div>
              </div>
              <div className={styles.scopeCard}>
                <div className={styles.scopeLabel}>Alcance 3</div>
                <div className={styles.scopeValue}>59.2 tCO₂e</div>
                <div className={styles.scopePct}>41.5% del total</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '42%', background: '#ff9f1a' }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Water tab ────────────────────────────────── */}
      {activeTab === 'water' && (
        <>
          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>8,420 m³</div>
              <div className={styles.statLabel}>Huella Total</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>3,180 m³</div>
              <div className={styles.statLabel}>Huella Azul</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>4,240 m³</div>
              <div className={styles.statLabel}>Huella Verde</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>1,000 m³</div>
              <div className={styles.statLabel}>Huella Gris</div>
            </div>
          </div>

          {/* Activities table */}
          <div className={styles.card}>
            <div className={styles.tableHeader}>
              <span className={styles.cardTitle}>Actividades hídricas</span>
              <button type="button" className={styles.addBtn}>
                <Icon name="plus" style={{ margin: 0 }} />
                Agregar actividad
              </button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Factor</th>
                    <th>Huella (m³)</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {WATER_ACTIVITIES.map((row) => (
                    <tr key={row.id}>
                      <td>{row.categoria}</td>
                      <td>{row.descripcion}</td>
                      <td>{row.cantidad.toLocaleString('es-ES')}</td>
                      <td>{row.unidad}</td>
                      <td>{row.factor}</td>
                      <td><strong>{row.huella.toLocaleString('es-ES')}</strong></td>
                      <td><ScopeBadge label={row.tipo} /></td>
                      <td>
                        <Icon name="pencil" style={{ cursor: 'pointer', color: '#6b808c' }} />
                        <Icon name="trash" style={{ cursor: 'pointer', color: '#eb5a46', marginLeft: 8 }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Type results */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Resultados por Tipo</div>
            <div className={styles.scopeResults}>
              <div className={styles.scopeCard}>
                <div className={styles.scopeLabel}>Huella Azul</div>
                <div className={styles.scopeValue}>3,180 m³</div>
                <div className={styles.scopePct}>37.8% del total</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '38%', background: '#0079bf' }} />
                </div>
              </div>
              <div className={styles.scopeCard}>
                <div className={styles.scopeLabel}>Huella Verde</div>
                <div className={styles.scopeValue}>4,240 m³</div>
                <div className={styles.scopePct}>50.4% del total</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '50%', background: '#61bd4f' }} />
                </div>
              </div>
              <div className={styles.scopeCard}>
                <div className={styles.scopeLabel}>Huella Gris</div>
                <div className={styles.scopeValue}>1,000 m³</div>
                <div className={styles.scopePct}>11.9% del total</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '12%', background: '#5e6c84' }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default CalculadoraPage;
