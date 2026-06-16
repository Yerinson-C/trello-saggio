/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useState, useCallback } from 'react';
import { Icon } from 'semantic-ui-react';

import styles from './FacturacionPage.module.scss';

/* ── Mock data ───────────────────────────────────────── */
const MOCK_FACTURAS = [
  { id: 'FAC-2025-001', project: 'Inventario GEI — Cementos del Valle', client: 'Cementos del Valle S.A.', issued: '2025-03-01', due: '2025-03-31', amount: 4500000, currency: 'COP', status: 'pagada', service: 'Inventario GEI (Alcances 1, 2 y 3)' },
  { id: 'FAC-2025-002', project: 'Huella Hídrica — Agroex Colombia', client: 'Agroex Colombia Ltda.', issued: '2025-03-15', due: '2025-04-14', amount: 3200000, currency: 'COP', status: 'enviada', service: 'Huella Hídrica Corporativa' },
  { id: 'FAC-2025-003', project: 'Estrategia ESG — Bancol', client: 'Bancolombia Regional', issued: '2025-04-01', due: '2025-05-01', amount: 7800000, currency: 'COP', status: 'vencida', service: 'Estrategia ESG' },
  { id: 'FAC-2025-004', project: 'ACV Producto — Chocolates Dulce', client: 'Chocolates Dulce S.A.', issued: '2025-04-20', due: '2025-05-20', amount: 5100000, currency: 'COP', status: 'borrador', service: 'Análisis de Ciclo de Vida (ACV)' },
  { id: 'FAC-2025-005', project: 'Plan Reducción — Transporte Sur', client: 'Transporte del Sur S.A.S.', issued: '2025-05-01', due: '2025-05-31', amount: 2900000, currency: 'COP', status: 'enviada', service: 'Plan de Reducción de Emisiones' },
];

const MOCK_PROJECTS = [
  'Inventario GEI — Cementos del Valle',
  'Huella Hídrica — Agroex Colombia',
  'Estrategia ESG — Bancol',
  'ACV Producto — Chocolates Dulce',
  'Plan Reducción — Transporte Sur',
];

const SERVICES = [
  'Inventario GEI (Alcances 1, 2 y 3)',
  'Huella Hídrica Corporativa',
  'Estrategia ESG',
  'Análisis de Ciclo de Vida (ACV)',
  'Plan de Reducción de Emisiones',
  'Verificación y Certificación ISO 14064',
  'Consultoría Ambiental',
];

const MOCK_TIME_ENTRIES = [
  { id: 'te-1', description: 'Reunión de diagnóstico inicial', hours: 8, date: '2025-04-10' },
  { id: 'te-2', description: 'Recopilación de datos de emisiones', hours: 6, date: '2025-04-14' },
  { id: 'te-3', description: 'Análisis y elaboración de informe', hours: 4, date: '2025-04-18' },
];

const FILTER_LABELS = {
  todas: 'Todas',
  borrador: 'Borrador',
  enviada: 'Enviada',
  pagada: 'Pagada',
  vencida: 'Vencida',
};

/* ── Helpers ─────────────────────────────────────────── */
function formatAmountShort(amount) {
  const millions = amount / 1000000;
  return `$ ${millions.toFixed(1)} M COP`;
}

function formatAmountTable(amount) {
  return `$${(amount / 1000).toFixed(0)}K COP`;
}

function badgeClass(status) {
  switch (status) {
    case 'borrador': return styles.badgeBorrador;
    case 'enviada':  return styles.badgeEnviada;
    case 'pagada':   return styles.badgePagada;
    case 'vencida':  return styles.badgeVencida;
    default:         return styles.badgeBorrador;
  }
}

/* ── Main component ──────────────────────────────────── */
function FacturacionPage() {
  const [activeFilter, setActiveFilter] = useState('todas');
  const [showNewModal, setShowNewModal] = useState(false);

  /* Modal form state */
  const [form, setForm] = useState({
    cliente: '',
    proyecto: '',
    servicio: '',
    fechaEmision: '',
    fechaVencimiento: '',
    monto: '',
    moneda: 'COP',
    notas: '',
  });
  const [selectedEntries, setSelectedEntries] = useState([]);

  /* ── Summary calculations ── */
  const totalFact = MOCK_FACTURAS.reduce((acc, f) => acc + f.amount, 0);

  const pagadas = MOCK_FACTURAS.filter(f => f.status === 'pagada');
  const totalPagadas = pagadas.reduce((acc, f) => acc + f.amount, 0);

  const enviadas = MOCK_FACTURAS.filter(f => f.status === 'enviada');
  const totalEnviadas = enviadas.reduce((acc, f) => acc + f.amount, 0);

  const vencidas = MOCK_FACTURAS.filter(f => f.status === 'vencida');
  const totalVencidas = vencidas.reduce((acc, f) => acc + f.amount, 0);

  /* ── Filtered list ── */
  const filtered = activeFilter === 'todas'
    ? MOCK_FACTURAS
    : MOCK_FACTURAS.filter(f => f.status === activeFilter);

  /* ── Modal handlers ── */
  const handleOpenModal = useCallback(() => {
    setForm({
      cliente: '',
      proyecto: '',
      servicio: '',
      fechaEmision: '',
      fechaVencimiento: '',
      monto: '',
      moneda: 'COP',
      notas: '',
    });
    setSelectedEntries([]);
    setShowNewModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowNewModal(false);
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleToggleEntry = useCallback((id) => {
    setSelectedEntries(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }, []);

  const handleCreate = useCallback(() => {
    // Mock create — just close modal
    setShowNewModal(false);
  }, []);

  /* ── Render ── */
  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Facturación</div>
          <div className={styles.pageSubtitle}>Gestión de propuestas y facturas</div>
        </div>
        <button className={styles.newBtn} type="button" onClick={handleOpenModal}>
          <Icon name="plus" />
          Nueva factura
        </button>
      </div>

      {/* Summary stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Icon name="dollar" /></div>
          <div className={styles.statValue}>{formatAmountShort(totalFact)}</div>
          <div className={styles.statSub}>Total facturado</div>
        </div>

        <div className={`${styles.statCard} ${styles.statGreen}`}>
          <div className={styles.statIcon}><Icon name="check circle" /></div>
          <div className={styles.statValue}>{formatAmountShort(totalPagadas)}</div>
          <div className={styles.statSub}>{pagadas.length} facturas pagadas</div>
        </div>

        <div className={`${styles.statCard} ${styles.statBlue}`}>
          <div className={styles.statIcon}><Icon name="send" /></div>
          <div className={styles.statValue}>{formatAmountShort(totalEnviadas)}</div>
          <div className={styles.statSub}>{enviadas.length} facturas pendientes</div>
        </div>

        <div className={`${styles.statCard} ${styles.statRed}`}>
          <div className={styles.statIcon}><Icon name="warning circle" /></div>
          <div className={styles.statValue}>{formatAmountShort(totalVencidas)}</div>
          <div className={styles.statSub}>{vencidas.length} facturas vencidas</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterTabs}>
        {Object.entries(FILTER_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`${styles.filterTab} ${activeFilter === key ? styles.filterTabActive : ''}`}
            onClick={() => setActiveFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Proyecto</th>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Emitida</th>
              <th>Vencimiento</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(factura => (
              <tr key={factura.id}>
                <td><span className={styles.invoiceId}>{factura.id}</span></td>
                <td>{factura.project}</td>
                <td>{factura.client}</td>
                <td>{factura.service}</td>
                <td>{factura.issued}</td>
                <td>{factura.due}</td>
                <td>{formatAmountTable(factura.amount)}</td>
                <td>
                  <span className={`${styles.badge} ${badgeClass(factura.status)}`}>
                    {FILTER_LABELS[factura.status] || factura.status}
                  </span>
                </td>
                <td>
                  <button className={styles.actionBtn} type="button" title="Ver detalle">
                    <Icon name="eye" />
                  </button>
                  {factura.status === 'borrador' && (
                    <button className={styles.actionBtn} type="button" title="Enviar">
                      <Icon name="send" />
                    </button>
                  )}
                  <button className={styles.actionBtn} type="button" title="Descargar">
                    <Icon name="download" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: '#6b808c', padding: '32px 0' }}>
                  No hay facturas en este estado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      {showNewModal && (
        <div className={styles.overlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Nueva Factura</span>
              <button className={styles.actionBtn} type="button" onClick={handleCloseModal}>
                <Icon name="close" />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Cliente */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Cliente</label>
                <input
                  className={styles.formInput}
                  type="text"
                  name="cliente"
                  placeholder="Nombre del cliente"
                  value={form.cliente}
                  onChange={handleFormChange}
                />
              </div>

              {/* Proyecto */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Proyecto</label>
                <select
                  className={styles.formInput}
                  name="proyecto"
                  value={form.proyecto}
                  onChange={handleFormChange}
                >
                  <option value="">Seleccionar proyecto...</option>
                  {MOCK_PROJECTS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Servicio */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Servicio</label>
                <select
                  className={styles.formInput}
                  name="servicio"
                  value={form.servicio}
                  onChange={handleFormChange}
                >
                  <option value="">Seleccionar servicio...</option>
                  {SERVICES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Fechas */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha emisión</label>
                  <input
                    className={styles.formInput}
                    type="date"
                    name="fechaEmision"
                    value={form.fechaEmision}
                    onChange={handleFormChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha vencimiento</label>
                  <input
                    className={styles.formInput}
                    type="date"
                    name="fechaVencimiento"
                    value={form.fechaVencimiento}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              {/* Monto y moneda */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Monto</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    name="monto"
                    placeholder="0"
                    min="0"
                    value={form.monto}
                    onChange={handleFormChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Moneda</label>
                  <select
                    className={styles.formInput}
                    name="moneda"
                    value={form.moneda}
                    onChange={handleFormChange}
                  >
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              {/* Notas */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Notas</label>
                <textarea
                  className={styles.formInput}
                  name="notas"
                  rows={3}
                  placeholder="Observaciones adicionales..."
                  value={form.notas}
                  onChange={handleFormChange}
                />
              </div>

              {/* Time entries */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Incluir registros de tiempo</label>
                {MOCK_TIME_ENTRIES.map(entry => (
                  <div key={entry.id} className={styles.timeEntry}>
                    <input
                      type="checkbox"
                      id={entry.id}
                      checked={selectedEntries.includes(entry.id)}
                      onChange={() => handleToggleEntry(entry.id)}
                    />
                    <label htmlFor={entry.id} style={{ cursor: 'pointer', flex: 1 }}>
                      {entry.description}
                    </label>
                    <span style={{ color: '#6b808c', marginLeft: 'auto' }}>
                      {entry.hours}h — {entry.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} type="button" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className={styles.createBtn} type="button" onClick={handleCreate}>
                Crear Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacturacionPage;
