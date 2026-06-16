/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Icon, Loader } from 'semantic-ui-react';

import selectors from '../../../selectors';

import styles from './CrmPage.module.scss';

/* ─────────────────── constants ─────────────────── */

const V2_BASE = window.V2_API_BASE || '';

const STAGES = [
  { key: 'prospecto',   label: 'Prospecto' },
  { key: 'contactado',  label: 'Contactado' },
  { key: 'propuesta',   label: 'Propuesta' },
  { key: 'negociacion', label: 'Negociacion' },
  { key: 'ganado',      label: 'Ganado' },
  { key: 'perdido',     label: 'Perdido' },
];

const STAGE_KEYS = STAGES.map((s) => s.key);

const SAGGIO_SERVICES = [
  'Inventario GEI',
  'Huella de Carbono de Producto',
  'Plan de Reduccion de Emisiones',
  'Compensacion y Neutralidad Climatica',
  'Verificacion ISO 14064',
  'Huella Hidrica Corporativa',
  'Huella Hidrica de Producto',
  'Plan de Gestion del Agua',
  'Certificacion ISO 14046',
  'Estrategia ESG',
  'Reporte GRI',
  'ACV-LCA',
  'Diagnostico Ambiental',
  'Plan de Accion Climatica',
  'Formacion en Sostenibilidad',
];

const STAGE_COLORS = {
  prospecto:   '#0079bf',
  contactado:  '#9b59b6',
  propuesta:   '#f39c12',
  negociacion: '#e67e22',
  ganado:      '#27ae60',
  perdido:     '#c0392b',
};

const EMPTY_FORM = {
  company: '',
  contact: '',
  email: '',
  phone: '',
  serviceInterest: SAGGIO_SERVICES[0],
  estimatedValue: '',
  expectedCloseDate: '',
  notes: '',
};

/* ─────────────────── helpers ─────────────────── */

async function apiFetch(url, opts = {}, token) {
  const fullUrl = url.startsWith('http') ? url : `${V2_BASE}${url}`;
  const res = await fetch(fullUrl, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function formatCurrency(value) {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return '$0';
  return `$${num.toLocaleString('es-CL')}`;
}

/* ─────────────────── LeadCard ─────────────────── */

function LeadCard({ lead, onMove, onDelete }) {
  const stageIndex = STAGE_KEYS.indexOf(lead.stage);
  const canMoveLeft  = stageIndex > 0;
  const canMoveRight = stageIndex < STAGE_KEYS.length - 1;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardCompany}>{lead.company}</span>
        <button
          type="button"
          className={styles.cardDeleteBtn}
          onClick={() => onDelete(lead.id)}
          title="Eliminar lead"
        >
          <Icon name="times" />
        </button>
      </div>
      <div className={styles.cardContact}>{lead.contact}</div>
      <div className={styles.cardService}>{lead.serviceInterest}</div>
      <div className={styles.cardValue}>{formatCurrency(lead.estimatedValue)}</div>
      {lead.expectedCloseDate && (
        <div className={styles.cardDate}>
          Cierre: {new Date(lead.expectedCloseDate).toLocaleDateString('es-CL')}
        </div>
      )}
      <div className={styles.cardActions}>
        <button
          type="button"
          className={styles.cardMoveBtn}
          disabled={!canMoveLeft}
          onClick={() => onMove(lead.id, STAGE_KEYS[stageIndex - 1])}
          title="Mover a etapa anterior"
        >
          <Icon name="chevron left" />
        </button>
        <button
          type="button"
          className={styles.cardMoveBtn}
          disabled={!canMoveRight}
          onClick={() => onMove(lead.id, STAGE_KEYS[stageIndex + 1])}
          title="Mover a siguiente etapa"
        >
          <Icon name="chevron right" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── NewLeadForm ─────────────────── */

function NewLeadForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit({ ...form, stage: 'prospecto' });
    },
    [form, onSubmit],
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formTitle}>Nuevo Lead</div>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="crm-company">
            Empresa *
          </label>
          <input
            id="crm-company"
            className={styles.formInput}
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            placeholder="Nombre de la empresa"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="crm-contact">
            Contacto *
          </label>
          <input
            id="crm-contact"
            className={styles.formInput}
            name="contact"
            value={form.contact}
            onChange={handleChange}
            required
            placeholder="Nombre del contacto"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="crm-email">
            Email
          </label>
          <input
            id="crm-email"
            className={styles.formInput}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@empresa.com"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="crm-phone">
            Telefono
          </label>
          <input
            id="crm-phone"
            className={styles.formInput}
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+56 9 0000 0000"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="crm-service">
            Servicio de interes *
          </label>
          <select
            id="crm-service"
            className={styles.formSelect}
            name="serviceInterest"
            value={form.serviceInterest}
            onChange={handleChange}
            required
          >
            {SAGGIO_SERVICES.map((svc) => (
              <option key={svc} value={svc}>
                {svc}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="crm-value">
            Valor estimado (CLP)
          </label>
          <input
            id="crm-value"
            className={styles.formInput}
            type="number"
            min="0"
            name="estimatedValue"
            value={form.estimatedValue}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="crm-date">
            Fecha de cierre esperada
          </label>
          <input
            id="crm-date"
            className={styles.formInput}
            type="date"
            name="expectedCloseDate"
            value={form.expectedCloseDate}
            onChange={handleChange}
          />
        </div>
        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
          <label className={styles.formLabel} htmlFor="crm-notes">
            Notas
          </label>
          <textarea
            id="crm-notes"
            className={styles.formTextarea}
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Observaciones adicionales..."
          />
        </div>
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.btnCancel} onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? 'Guardando...' : 'Crear Lead'}
        </button>
      </div>
    </form>
  );
}

/* ─────────────────── CrmPage ─────────────────── */

const CrmPage = React.memo(() => {
  const accessToken = useSelector(selectors.selectAccessToken);

  const [leads, setLeads]           = useState([]);
  const [fetching, setFetching]     = useState(true);
  const [error, setError]           = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  /* ── fetch all leads ── */
  const loadLeads = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const data = await apiFetch('/api/crm-leads', {}, accessToken);
      setLeads(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(`No se pudieron cargar los leads: ${err.message}`);
    } finally {
      setFetching(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  /* ── create lead ── */
  const handleCreate = useCallback(
    async (formData) => {
      setFormLoading(true);
      try {
        const created = await apiFetch(
          '/api/crm-leads',
          { method: 'POST', body: JSON.stringify(formData) },
          accessToken,
        );
        setLeads((prev) => [created, ...prev]);
        setShowForm(false);
      } catch (err) {
        // eslint-disable-next-line no-alert
        alert(`Error al crear lead: ${err.message}`);
      } finally {
        setFormLoading(false);
      }
    },
    [accessToken],
  );

  /* ── move lead ── */
  const handleMove = useCallback(
    async (id, newStage) => {
      // optimistic update
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, stage: newStage } : l)),
      );
      try {
        await apiFetch(
          `/api/crm-leads/${id}`,
          { method: 'PATCH', body: JSON.stringify({ stage: newStage }) },
          accessToken,
        );
      } catch (err) {
        // revert on error
        await loadLeads();
      }
    },
    [accessToken, loadLeads],
  );

  /* ── delete lead ── */
  const handleDelete = useCallback(
    async (id) => {
      // eslint-disable-next-line no-alert
      if (!window.confirm('¿Eliminar este lead?')) return;
      setLeads((prev) => prev.filter((l) => l.id !== id));
      try {
        await apiFetch(`/api/crm-leads/${id}`, { method: 'DELETE' }, accessToken);
      } catch (err) {
        await loadLeads();
      }
    },
    [accessToken, loadLeads],
  );

  /* ── stats ── */
  const totalLeads     = leads.length;
  const totalProposal  = leads.filter((l) => l.stage === 'propuesta').length;
  const wonValue       = leads
    .filter((l) => l.stage === 'ganado')
    .reduce((sum, l) => sum + (parseFloat(l.estimatedValue) || 0), 0);

  return (
    <div className={styles.wrapper}>
      {/* ── top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1 className={styles.pageTitle}>CRM Pipeline</h1>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalLeads}</span>
            <span className={styles.statLabel}>Total leads</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalProposal}</span>
            <span className={styles.statLabel}>En propuesta</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${styles.statValueGreen}`}>
              {formatCurrency(wonValue)}
            </span>
            <span className={styles.statLabel}>Valor ganado</span>
          </div>
        </div>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() => setShowForm((v) => !v)}
        >
          <Icon name={showForm ? 'minus' : 'plus'} />
          {showForm ? 'Cerrar formulario' : 'Nuevo lead'}
        </button>
      </div>

      {/* ── new lead form ── */}
      {showForm && (
        <NewLeadForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={formLoading}
        />
      )}

      {/* ── error banner ── */}
      {error && (
        <div className={styles.errorBanner}>
          <Icon name="warning sign" /> {error}
          <button type="button" className={styles.retryBtn} onClick={loadLeads}>
            Reintentar
          </button>
        </div>
      )}

      {/* ── kanban board ── */}
      {fetching ? (
        <div className={styles.loaderWrap}>
          <Loader active inline="centered" size="large" />
        </div>
      ) : (
        <div className={styles.board}>
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.key);
            return (
              <div key={stage.key} className={styles.column}>
                <div
                  className={styles.columnHeader}
                  style={{ borderTopColor: STAGE_COLORS[stage.key] }}
                >
                  <span className={styles.columnTitle}>{stage.label}</span>
                  <span
                    className={styles.columnCount}
                    style={{ background: STAGE_COLORS[stage.key] }}
                  >
                    {stageLeads.length}
                  </span>
                </div>
                <div className={styles.columnBody}>
                  {stageLeads.length === 0 ? (
                    <div className={styles.emptyColumn}>Sin leads</div>
                  ) : (
                    stageLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onMove={handleMove}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default CrmPage;
