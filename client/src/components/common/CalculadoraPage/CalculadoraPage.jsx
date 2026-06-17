/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Icon } from 'semantic-ui-react';

import styles from './CalculadoraPage.module.scss';
import FactorLibraryModal from './FactorLibraryModal';

/* ── Categorías carbono ──────────────────────────────────────────────────── */

const CARBON_CATEGORIES = [
  'Combustión estacionaria',
  'Combustión móvil',
  'Procesos industriales',
  'Emisiones fugitivas',
  'Electricidad',
  'Vapor / calor / frío comprado',
  'Vuelos de negocios',
  'Transporte de empleados',
  'Transporte de carga',
  'Residuos sólidos',
  'Aguas residuales',
  'Cadena de suministro',
  'Uso del producto',
  'Fin de vida del producto',
  'Otro',
];

const CARBON_UNITS = ['kWh', 'MWh', 'L', 'm³', 'kg', 't', 'km', 'vuelos', 'pasajero-km', 'GJ'];

const CARBON_SCOPES = ['Alcance 1', 'Alcance 2', 'Alcance 3'];

/* ── Categorías hídrica ──────────────────────────────────────────────────── */

const WATER_CATEGORIES = [
  'Agua municipal / potable',
  'Agua subterránea (pozo propio)',
  'Agua superficial (río / lago)',
  'Agua lluvia aprovechada',
  'Agua reciclada / reutilizada',
  'Materia prima agrícola',
  'Materia prima industrial',
  'Aguas residuales generadas',
  'Aguas residuales tratadas',
  'Otro',
];

const WATER_UNITS = ['m³', 'L', 'kg', 't'];

const WATER_TYPES = ['Azul', 'Verde', 'Gris'];

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
  return <span className={`${styles.scopeBadge} ${clsMap[label] || ''}`}>{label}</span>;
}

/* ── Add-activity modal ──────────────────────────────────────────────────── */

const CARBON_EMPTY = { categoria: '', descripcion: '', cantidad: '', unidad: 'kWh', factor: '', alcance: 'Alcance 1' };
const WATER_EMPTY  = { categoria: '', descripcion: '', cantidad: '', unidad: 'm³', factor: '', tipo: 'Azul' };

function AddActivityModal({ type, onSave, onClose }) {
  const [form, setForm] = useState(type === 'carbon' ? CARBON_EMPTY : WATER_EMPTY);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFactorSelect = useCallback((factor, unit) => {
    setForm((prev) => ({ ...prev, factor: String(factor), unidad: unit }));
  }, []);

  const computed = useMemo(() => {
    const q = parseFloat(form.cantidad);
    const f = parseFloat(form.factor);
    if (!Number.isNaN(q) && !Number.isNaN(f)) return (q * f).toFixed(4);
    return '—';
  }, [form.cantidad, form.factor]);

  const canSave = form.categoria && form.cantidad && form.factor && parseFloat(form.cantidad) > 0 && parseFloat(form.factor) > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    const q = parseFloat(form.cantidad);
    const f = parseFloat(form.factor);
    onSave({
      id: Date.now(),
      ...form,
      cantidad: q,
      factor: f,
      ...(type === 'carbon' ? { co2e: parseFloat((q * f).toFixed(4)) } : { huella: parseFloat((q * f).toFixed(4)) }),
    });
    onClose();
  }, [canSave, form, type, onSave, onClose]);

  const resultLabel = type === 'carbon' ? 'CO₂e (tCO₂e)' : 'Huella (m³)';
  const categories  = type === 'carbon' ? CARBON_CATEGORIES : WATER_CATEGORIES;
  const units       = type === 'carbon' ? CARBON_UNITS : WATER_UNITS;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            <Icon name={type === 'carbon' ? 'fire' : 'tint'} />
            {type === 'carbon' ? 'Agregar actividad de emisión' : 'Agregar actividad hídrica'}
          </span>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <Icon name="times" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Categoría *</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} className={styles.formInput}>
              <option value="">Seleccionar categoría...</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripción</label>
            <input
              type="text"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="Ej. Caldera principal, vehículo planta..."
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Cantidad *</label>
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="0"
                min="0"
                step="any"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Unidad</label>
              <select name="unidad" value={form.unidad} onChange={handleChange} className={styles.formInput}>
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label className={styles.formLabel}>Factor de emisión * <span className={styles.factorHint}>({type === 'carbon' ? 'tCO₂e/unidad' : 'm³/unidad'})</span></label>
                <button type="button" style={{ background:'none', border:'none', color:'#0079bf', fontSize:12, cursor:'pointer', padding:'0 0 4px 0', fontWeight:600 }} onClick={() => setShowLibrary(true)}>
                  🔍 Buscar en biblioteca
                </button>
              </div>
              <input
                type="number"
                name="factor"
                value={form.factor}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="0.00000"
                min="0"
                step="any"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{type === 'carbon' ? 'Alcance' : 'Tipo'}</label>
              {type === 'carbon' ? (
                <select name="alcance" value={form.alcance} onChange={handleChange} className={styles.formInput}>
                  {CARBON_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <select name="tipo" value={form.tipo} onChange={handleChange} className={styles.formInput}>
                  {WATER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </div>
          </div>

          <div className={styles.resultPreview}>
            <span className={styles.resultPreviewLabel}>{resultLabel} calculado:</span>
            <span className={styles.resultPreviewValue}>{computed}</span>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={!canSave}>
            <Icon name="plus" />
            Agregar
          </button>
        </div>
      </div>
      {showLibrary && (
        <FactorLibraryModal
          type={type}
          onSelect={handleFactorSelect}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */

function EmptyState({ type, onAdd }) {
  return (
    <div className={styles.emptyState}>
      <Icon name={type === 'carbon' ? 'fire' : 'tint'} className={styles.emptyIcon} />
      <div className={styles.emptyTitle}>
        {type === 'carbon' ? 'Sin actividades de emisión' : 'Sin actividades hídricas'}
      </div>
      <div className={styles.emptyText}>
        Agrega la primera actividad para comenzar a calcular la{' '}
        {type === 'carbon' ? 'huella de carbono' : 'huella hídrica'}.
      </div>
      <button type="button" className={styles.addBtnLarge} onClick={onAdd}>
        <Icon name="plus" />
        Agregar primera actividad
      </button>
    </div>
  );
}

/* ── Datos iniciales de ejemplo ──────────────────────────────────────────── */

const CARBON_INIT = [
  { id: 1, categoria: 'Combustión estacionaria', descripcion: 'Gas natural - caldera',          cantidad: 12500, unidad: 'm³',    factor: 0.00202,  co2e: 25.25, alcance: 'Alcance 1' },
  { id: 2, categoria: 'Combustión móvil',         descripcion: 'Vehículo diesel empresa',        cantidad: 4200,  unidad: 'L',     factor: 0.00268,  co2e: 11.26, alcance: 'Alcance 1' },
  { id: 3, categoria: 'Electricidad',             descripcion: 'Consumo red eléctrica',          cantidad: 85000, unidad: 'kWh',   factor: 0.000126, co2e: 10.71, alcance: 'Alcance 2' },
  { id: 4, categoria: 'Vuelos de negocios',       descripcion: 'Viajes aéreos corta distancia',  cantidad: 8,     unidad: 'vuelos',factor: 0.255,    co2e: 2.04,  alcance: 'Alcance 3' },
  { id: 5, categoria: 'Residuos sólidos',         descripcion: 'Residuos sólidos a vertedero',   cantidad: 3200,  unidad: 'kg',    factor: 0.000486, co2e: 1.556, alcance: 'Alcance 3' },
];

const WATER_INIT = [
  { id: 1, categoria: 'Agua municipal / potable',    descripcion: 'Consumo oficina',           cantidad: 1200,  unidad: 'm³', factor: 1.0,   huella: 1200, tipo: 'Azul'  },
  { id: 2, categoria: 'Agua subterránea (pozo propio)', descripcion: 'Pozo propio',           cantidad: 850,   unidad: 'm³', factor: 1.0,   huella: 850,  tipo: 'Azul'  },
  { id: 3, categoria: 'Materia prima agrícola',      descripcion: 'Cultivo de insumos',        cantidad: 42000, unidad: 'kg', factor: 0.101, huella: 4242, tipo: 'Verde' },
  { id: 4, categoria: 'Aguas residuales generadas',  descripcion: 'Efluentes proceso',         cantidad: 980,   unidad: 'm³', factor: 1.02,  huella: 999.6,tipo: 'Gris'  },
];

/* ── Main component ──────────────────────────────────────────────────────── */

const CalculadoraPage = React.memo(() => {
  const [activeTab, setActiveTab]       = useState('carbon');
  const [carbonRows, setCarbonRows]     = useState(CARBON_INIT);
  const [waterRows, setWaterRows]       = useState(WATER_INIT);
  const [showModal, setShowModal]       = useState(false);

  /* ── Totals ── */
  const carbonTotals = useMemo(() => {
    const total = carbonRows.reduce((s, r) => s + r.co2e, 0);
    const s1    = carbonRows.filter((r) => r.alcance === 'Alcance 1').reduce((s, r) => s + r.co2e, 0);
    const s2    = carbonRows.filter((r) => r.alcance === 'Alcance 2').reduce((s, r) => s + r.co2e, 0);
    const s3    = carbonRows.filter((r) => r.alcance === 'Alcance 3').reduce((s, r) => s + r.co2e, 0);
    return { total, s1, s2, s3 };
  }, [carbonRows]);

  const waterTotals = useMemo(() => {
    const total = waterRows.reduce((s, r) => s + r.huella, 0);
    const azul  = waterRows.filter((r) => r.tipo === 'Azul').reduce((s, r) => s + r.huella, 0);
    const verde = waterRows.filter((r) => r.tipo === 'Verde').reduce((s, r) => s + r.huella, 0);
    const gris  = waterRows.filter((r) => r.tipo === 'Gris').reduce((s, r) => s + r.huella, 0);
    return { total, azul, verde, gris };
  }, [waterRows]);

  const handleSaveActivity = useCallback((row) => {
    if (activeTab === 'carbon') setCarbonRows((prev) => [...prev, row]);
    else setWaterRows((prev) => [...prev, row]);
  }, [activeTab]);

  const handleDelete = useCallback((id) => {
    if (activeTab === 'carbon') setCarbonRows((prev) => prev.filter((r) => r.id !== id));
    else setWaterRows((prev) => prev.filter((r) => r.id !== id));
  }, [activeTab]);

  const handleExportCSV = useCallback(() => {
    const rows = activeTab === 'carbon' ? carbonRows : waterRows;
    if (rows.length === 0) return;
    let csv, filename;
    if (activeTab === 'carbon') {
      csv = 'Categoría,Descripción,Cantidad,Unidad,Factor (tCO₂e/u),CO₂e (tCO₂e),Alcance\n' +
        rows.map(r => [r.categoria, r.descripcion||'', r.cantidad, r.unidad, r.factor, r.co2e, r.alcance].join(',')).join('\n');
      filename = 'huella_carbono.csv';
    } else {
      csv = 'Categoría,Descripción,Cantidad,Unidad,Factor (m³/u),Huella (m³),Tipo\n' +
        rows.map(r => [r.categoria, r.descripcion||'', r.cantidad, r.unidad, r.factor, r.huella, r.tipo].join(',')).join('\n');
      filename = 'huella_hidrica.csv';
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }, [activeTab, carbonRows, waterRows]);

  const fmt = (n) => n.toFixed(4).replace(/\.?0+$/, '') || '0';
  const pct = (part, total) => (total > 0 ? ((part / total) * 100).toFixed(1) : '0.0');

  const currentRows = activeTab === 'carbon' ? carbonRows : waterRows;

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
            Cuantifica la huella ambiental — ingresa tus actividades y el resultado se calcula automáticamente
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
          {carbonRows.length > 0 && <span className={styles.tabCount}>{carbonRows.length}</span>}
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'water' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('water')}
        >
          <Icon name="tint" />
          Huella Hídrica
          {waterRows.length > 0 && <span className={styles.tabCount}>{waterRows.length}</span>}
        </button>
      </div>

      {/* ── Carbon tab ───────────────────────────────── */}
      {activeTab === 'carbon' && (
        <>
          {carbonRows.length > 0 && (
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{fmt(carbonTotals.total)} tCO₂e</div>
                <div className={styles.statLabel}>Total Emisiones</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{fmt(carbonTotals.s1)} tCO₂e</div>
                <div className={styles.statLabel}>Alcance 1</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{fmt(carbonTotals.s2)} tCO₂e</div>
                <div className={styles.statLabel}>Alcance 2</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{fmt(carbonTotals.s3)} tCO₂e</div>
                <div className={styles.statLabel}>Alcance 3</div>
              </div>
            </div>
          )}

          <div className={styles.card}>
            <div className={styles.tableHeader}>
              <span className={styles.cardTitle}>Actividades de emisión</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {currentRows.length > 0 && (
                  <button type="button" className={styles.exportBtn} onClick={handleExportCSV}>
                    ↓ Exportar CSV
                  </button>
                )}
                {currentRows.length > 0 && (
                  <button type="button" className={styles.addBtn} onClick={() => setShowModal(true)}>
                    <Icon name="plus" style={{ margin: 0 }} />
                    Agregar actividad
                  </button>
                )}
              </div>
            </div>

            {carbonRows.length === 0 ? (
              <EmptyState type="carbon" onAdd={() => setShowModal(true)} />
            ) : (
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
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {carbonRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.categoria}</td>
                        <td>{row.descripcion || '—'}</td>
                        <td>{row.cantidad.toLocaleString('es-ES')}</td>
                        <td>{row.unidad}</td>
                        <td>{row.factor}</td>
                        <td><strong>{fmt(row.co2e)}</strong></td>
                        <td><ScopeBadge label={row.alcance} /></td>
                        <td>
                          <button type="button" className={styles.iconBtn} onClick={() => handleDelete(row.id)} title="Eliminar">
                            <Icon name="trash alternate outline" style={{ color: '#eb5a46' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {carbonRows.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Resultados por Alcance</div>
              <div className={styles.scopeResults}>
                {[
                  { label: 'Alcance 1', value: carbonTotals.s1, color: '#61bd4f' },
                  { label: 'Alcance 2', value: carbonTotals.s2, color: '#0079bf' },
                  { label: 'Alcance 3', value: carbonTotals.s3, color: '#ff9f1a' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={styles.scopeCard}>
                    <div className={styles.scopeLabel}>{label}</div>
                    <div className={styles.scopeValue}>{fmt(value)} tCO₂e</div>
                    <div className={styles.scopePct}>{pct(value, carbonTotals.total)}% del total</div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${pct(value, carbonTotals.total)}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Water tab ────────────────────────────────── */}
      {activeTab === 'water' && (
        <>
          {waterRows.length > 0 && (
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{fmt(waterTotals.total)} m³</div>
                <div className={styles.statLabel}>Huella Total</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{fmt(waterTotals.azul)} m³</div>
                <div className={styles.statLabel}>Huella Azul</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{fmt(waterTotals.verde)} m³</div>
                <div className={styles.statLabel}>Huella Verde</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{fmt(waterTotals.gris)} m³</div>
                <div className={styles.statLabel}>Huella Gris</div>
              </div>
            </div>
          )}

          <div className={styles.card}>
            <div className={styles.tableHeader}>
              <span className={styles.cardTitle}>Actividades hídricas</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {currentRows.length > 0 && (
                  <button type="button" className={styles.exportBtn} onClick={handleExportCSV}>
                    ↓ Exportar CSV
                  </button>
                )}
                {currentRows.length > 0 && (
                  <button type="button" className={styles.addBtn} onClick={() => setShowModal(true)}>
                    <Icon name="plus" style={{ margin: 0 }} />
                    Agregar actividad
                  </button>
                )}
              </div>
            </div>

            {waterRows.length === 0 ? (
              <EmptyState type="water" onAdd={() => setShowModal(true)} />
            ) : (
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
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.categoria}</td>
                        <td>{row.descripcion || '—'}</td>
                        <td>{row.cantidad.toLocaleString('es-ES')}</td>
                        <td>{row.unidad}</td>
                        <td>{row.factor}</td>
                        <td><strong>{fmt(row.huella)}</strong></td>
                        <td><ScopeBadge label={row.tipo} /></td>
                        <td>
                          <button type="button" className={styles.iconBtn} onClick={() => handleDelete(row.id)} title="Eliminar">
                            <Icon name="trash alternate outline" style={{ color: '#eb5a46' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {waterRows.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Resultados por Tipo</div>
              <div className={styles.scopeResults}>
                {[
                  { label: 'Huella Azul',  value: waterTotals.azul,  color: '#0079bf' },
                  { label: 'Huella Verde', value: waterTotals.verde, color: '#61bd4f' },
                  { label: 'Huella Gris',  value: waterTotals.gris,  color: '#5e6c84' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={styles.scopeCard}>
                    <div className={styles.scopeLabel}>{label}</div>
                    <div className={styles.scopeValue}>{fmt(value)} m³</div>
                    <div className={styles.scopePct}>{pct(value, waterTotals.total)}% del total</div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${pct(value, waterTotals.total)}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modal ────────────────────────────────────── */}
      {showModal && (
        <AddActivityModal
          type={activeTab}
          onSave={handleSaveActivity}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
});

export default CalculadoraPage;
