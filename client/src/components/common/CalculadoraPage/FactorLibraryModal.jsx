/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useState, useCallback, useMemo } from 'react';
import styles from './FactorLibraryModal.module.scss';

/* ── Carbon emission factors ─────────────────────────────────────────────── */

const CARBON_FACTORS = [
  // Combustión estacionaria - Alcance 1
  { id:1,  nombre:'Gas natural',                categoria:'Combustión estacionaria', fuente:'GHG Protocol / IPCC AR6', factor:0.00202,  unidadEntrada:'m³',          unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'Colombia - factor promedio' },
  { id:2,  nombre:'Diésel industrial',           categoria:'Combustión estacionaria', fuente:'GHG Protocol',           factor:0.002681, unidadEntrada:'L',           unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'' },
  { id:3,  nombre:'Gasolina',                    categoria:'Combustión estacionaria', fuente:'GHG Protocol',           factor:0.002314, unidadEntrada:'L',           unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'' },
  { id:4,  nombre:'GLP / Propano',               categoria:'Combustión estacionaria', fuente:'GHG Protocol',           factor:0.001556, unidadEntrada:'L',           unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'' },
  { id:5,  nombre:'Fuel oil / ACPM',             categoria:'Combustión estacionaria', fuente:'GHG Protocol',           factor:0.002985, unidadEntrada:'L',           unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'' },
  { id:6,  nombre:'Carbón mineral',              categoria:'Combustión estacionaria', fuente:'IPCC 2006',              factor:0.003254, unidadEntrada:'kg',          unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'' },
  // Combustión móvil - Alcance 1
  { id:7,  nombre:'Diésel vehicular',            categoria:'Combustión móvil',        fuente:'GHG Protocol',           factor:0.002668, unidadEntrada:'L',           unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'' },
  { id:8,  nombre:'Gasolina vehicular',          categoria:'Combustión móvil',        fuente:'GHG Protocol',           factor:0.002310, unidadEntrada:'L',           unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'' },
  { id:9,  nombre:'Gas natural comprimido (GNC)',categoria:'Combustión móvil',        fuente:'GHG Protocol',           factor:0.001934, unidadEntrada:'m³',          unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'' },
  // Refrigerantes - Alcance 1
  { id:10, nombre:'Refrigerante R-410A',         categoria:'Emisiones fugitivas',     fuente:'IPCC AR6 GWP100',        factor:2.088,    unidadEntrada:'kg',          unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'GWP = 2088' },
  { id:11, nombre:'Refrigerante R-22',           categoria:'Emisiones fugitivas',     fuente:'IPCC AR6 GWP100',        factor:1.810,    unidadEntrada:'kg',          unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'GWP = 1810' },
  { id:12, nombre:'Refrigerante R-134a',         categoria:'Emisiones fugitivas',     fuente:'IPCC AR6 GWP100',        factor:1.430,    unidadEntrada:'kg',          unidadSalida:'tCO₂e', alcance:'Alcance 1', nota:'GWP = 1430' },
  // Electricidad - Alcance 2
  { id:13, nombre:'Red eléctrica Colombia',      categoria:'Electricidad',            fuente:'UPME 2022 / XM',         factor:0.0001260,unidadEntrada:'kWh',         unidadSalida:'tCO₂e', alcance:'Alcance 2', nota:'🇨🇴 Factor SIN Colombia 2022: 0.126 kgCO₂e/kWh' },
  { id:14, nombre:'Red eléctrica Colombia',      categoria:'Electricidad',            fuente:'UPME 2022 / XM',         factor:0.1260,   unidadEntrada:'MWh',         unidadSalida:'tCO₂e', alcance:'Alcance 2', nota:'🇨🇴 Factor SIN Colombia 2022' },
  { id:15, nombre:'Red eléctrica Latam promedio',categoria:'Electricidad',            fuente:'IEA 2022',               factor:0.000220, unidadEntrada:'kWh',         unidadSalida:'tCO₂e', alcance:'Alcance 2', nota:'' },
  // Vuelos - Alcance 3
  { id:16, nombre:'Vuelo corta distancia (<500km)',  categoria:'Vuelos de negocios', fuente:'DEFRA UK 2023',          factor:0.2553,   unidadEntrada:'vuelos',      unidadSalida:'tCO₂e', alcance:'Alcance 3', nota:'Clase económica, por pasajero' },
  { id:17, nombre:'Vuelo media distancia (500-1500km)', categoria:'Vuelos de negocios', fuente:'DEFRA UK 2023',      factor:0.1854,   unidadEntrada:'vuelos',      unidadSalida:'tCO₂e', alcance:'Alcance 3', nota:'Clase económica, por pasajero' },
  { id:18, nombre:'Vuelo larga distancia (>1500km)', categoria:'Vuelos de negocios', fuente:'DEFRA UK 2023',         factor:0.1748,   unidadEntrada:'vuelos',      unidadSalida:'tCO₂e', alcance:'Alcance 3', nota:'Clase económica, por pasajero' },
  { id:19, nombre:'Vuelos - pasajero-km corto',  categoria:'Vuelos de negocios',      fuente:'DEFRA UK 2023',          factor:0.000255, unidadEntrada:'pasajero-km', unidadSalida:'tCO₂e', alcance:'Alcance 3', nota:'' },
  // Residuos - Alcance 3
  { id:20, nombre:'Residuos sólidos a vertedero',categoria:'Residuos sólidos',        fuente:'IPCC 2006',              factor:0.000486, unidadEntrada:'kg',          unidadSalida:'tCO₂e', alcance:'Alcance 3', nota:'' },
  { id:21, nombre:'Papel a vertedero',           categoria:'Residuos sólidos',        fuente:'IPCC 2006',              factor:0.001506, unidadEntrada:'kg',          unidadSalida:'tCO₂e', alcance:'Alcance 3', nota:'' },
  // Transporte - Alcance 3
  { id:22, nombre:'Camión diésel <3.5t',         categoria:'Transporte de carga',     fuente:'DEFRA UK 2023',          factor:0.000271, unidadEntrada:'km',          unidadSalida:'tCO₂e', alcance:'Alcance 3', nota:'Distancia recorrida' },
  { id:23, nombre:'Transporte marítimo',         categoria:'Transporte de carga',     fuente:'IMO / DEFRA 2023',       factor:0.0000117,unidadEntrada:'t·km',        unidadSalida:'tCO₂e', alcance:'Alcance 3', nota:'Por tonelada-kilómetro' },
];

/* ── Water footprint factors ─────────────────────────────────────────────── */

const WATER_FACTORS = [
  { id:1,  nombre:'Agua potable / municipal',   categoria:'Agua directa',            fuente:'WFN / ISO 14046',        factor:1.0,     unidadEntrada:'m³',  unidadSalida:'m³', tipo:'Azul',  nota:'Consumo directo' },
  { id:2,  nombre:'Agua subterránea (pozo)',    categoria:'Agua directa',            fuente:'WFN / ISO 14046',        factor:1.0,     unidadEntrada:'m³',  unidadSalida:'m³', tipo:'Azul',  nota:'Extracción propia' },
  { id:3,  nombre:'Agua superficial (río/lago)',categoria:'Agua directa',            fuente:'WFN / ISO 14046',        factor:1.0,     unidadEntrada:'m³',  unidadSalida:'m³', tipo:'Azul',  nota:'' },
  { id:4,  nombre:'Café (grano verde)',         categoria:'Materia prima agrícola',  fuente:'WFN 2012',               factor:1.40,    unidadEntrada:'kg',  unidadSalida:'m³', tipo:'Verde', nota:'🇨🇴 Producto clave Colombia' },
  { id:5,  nombre:'Caña de azúcar',            categoria:'Materia prima agrícola',  fuente:'WFN 2012',               factor:1.782,   unidadEntrada:'kg',  unidadSalida:'m³', tipo:'Verde', nota:'' },
  { id:6,  nombre:'Maíz',                      categoria:'Materia prima agrícola',  fuente:'WFN 2012',               factor:0.900,   unidadEntrada:'kg',  unidadSalida:'m³', tipo:'Verde', nota:'' },
  { id:7,  nombre:'Arroz',                     categoria:'Materia prima agrícola',  fuente:'WFN 2012',               factor:1.670,   unidadEntrada:'kg',  unidadSalida:'m³', tipo:'Verde', nota:'' },
  { id:8,  nombre:'Soya',                      categoria:'Materia prima agrícola',  fuente:'WFN 2012',               factor:2.145,   unidadEntrada:'kg',  unidadSalida:'m³', tipo:'Verde', nota:'' },
  { id:9,  nombre:'Cacao',                     categoria:'Materia prima agrícola',  fuente:'WFN 2012',               factor:20.0,    unidadEntrada:'kg',  unidadSalida:'m³', tipo:'Verde', nota:'🇨🇴 Producto clave Colombia' },
  { id:10, nombre:'Carne vacuna (res)',         categoria:'Materia prima agrícola',  fuente:'WFN 2012',               factor:15.415,  unidadEntrada:'kg',  unidadSalida:'m³', tipo:'Verde', nota:'' },
  { id:11, nombre:'Pollo',                     categoria:'Materia prima agrícola',  fuente:'WFN 2012',               factor:4.325,   unidadEntrada:'kg',  unidadSalida:'m³', tipo:'Verde', nota:'' },
  { id:12, nombre:'Leche bovina',              categoria:'Materia prima agrícola',  fuente:'WFN 2012',               factor:1.021,   unidadEntrada:'L',   unidadSalida:'m³', tipo:'Verde', nota:'' },
  { id:13, nombre:'Papel / cartón',            categoria:'Material industrial',     fuente:'WFN 2012',               factor:2.0,     unidadEntrada:'kg',  unidadSalida:'m³', tipo:'Verde', nota:'' },
  { id:14, nombre:'Algodón',                   categoria:'Material industrial',     fuente:'WFN 2012',               factor:10.0,    unidadEntrada:'kg',  unidadSalida:'m³', tipo:'Azul',  nota:'' },
  { id:15, nombre:'Cuero bovino',              categoria:'Material industrial',     fuente:'WFN 2012',               factor:17.1,    unidadEntrada:'kg',  unidadSalida:'m³', tipo:'Azul',  nota:'' },
  { id:16, nombre:'Aguas residuales generadas',categoria:'Aguas residuales',        fuente:'WFN / ISO 14046',        factor:1.02,    unidadEntrada:'m³',  unidadSalida:'m³', tipo:'Gris',  nota:'Incluye factor de dilución' },
];

/* ── Scope / tipo badge helpers ──────────────────────────────────────────── */

function ScopeBadge({ label }) {
  const clsMap = {
    'Alcance 1': styles.scope1,
    'Alcance 2': styles.scope2,
    'Alcance 3': styles.scope3,
  };
  return <span className={`${styles.badge} ${clsMap[label] || ''}`}>{label}</span>;
}

function TipoBadge({ label }) {
  const clsMap = {
    Azul:  styles.azul,
    Verde: styles.verde,
    Gris:  styles.gris,
  };
  return <span className={`${styles.badge} ${clsMap[label] || ''}`}>{label}</span>;
}

/* ── FactorLibraryModal ──────────────────────────────────────────────────── */

function FactorLibraryModal({ type, onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');

  const factors = type === 'carbon' ? CARBON_FACTORS : WATER_FACTORS;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return factors;
    return factors.filter(
      (f) =>
        f.nombre.toLowerCase().includes(q) ||
        f.categoria.toLowerCase().includes(q) ||
        f.fuente.toLowerCase().includes(q),
    );
  }, [factors, searchQuery]);

  const handleUsar = useCallback(
    (row) => {
      onSelect(row.factor, row.unidadEntrada);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <span className={styles.title}>
              {type === 'carbon' ? '🔥' : '💧'} Biblioteca de Factores
            </span>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
              ✕
            </button>
          </div>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por nombre, categoría o fuente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          {type === 'carbon' ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Fuente</th>
                  <th>Factor</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Alcance</th>
                  <th>Nota</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className={row.nota && row.nota.includes('🇨🇴') ? styles.colombiaRow : ''}>
                    <td>{row.nombre}</td>
                    <td>{row.categoria}</td>
                    <td>{row.fuente}</td>
                    <td className={styles.colFactor}>{row.factor}</td>
                    <td>{row.unidadEntrada}</td>
                    <td>{row.unidadSalida}</td>
                    <td><ScopeBadge label={row.alcance} /></td>
                    <td className={styles.colNota}>{row.nota || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.usarBtn}
                        onClick={() => handleUsar(row)}
                      >
                        Usar
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: '#6b808c', padding: '24px' }}>
                      No se encontraron factores para "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Fuente</th>
                  <th>Factor</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Tipo</th>
                  <th>Nota</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className={row.nota && row.nota.includes('🇨🇴') ? styles.colombiaRow : ''}>
                    <td>{row.nombre}</td>
                    <td>{row.categoria}</td>
                    <td>{row.fuente}</td>
                    <td className={styles.colFactor}>{row.factor}</td>
                    <td>{row.unidadEntrada}</td>
                    <td>{row.unidadSalida}</td>
                    <td><TipoBadge label={row.tipo} /></td>
                    <td className={styles.colNota}>{row.nota || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.usarBtn}
                        onClick={() => handleUsar(row)}
                      >
                        Usar
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: '#6b808c', padding: '24px' }}>
                      No se encontraron factores para "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          Fuentes: GHG Protocol, IPCC AR6, UPME 2022, WFN, DEFRA UK 2023, IMO
        </div>
      </div>
    </div>
  );
}

export default FactorLibraryModal;
