/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Form,
  Icon,
  Input,
  Label,
  Loader,
  Modal,
} from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './DeliverablesModal.module.scss';

const V2_BASE = window.V2_API_BASE || '';

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

const STATUS_ORDER = ['draft', 'internal_review', 'pending_client', 'approved', 'delivered'];

const STATUS_CONFIG = {
  draft:           { label: 'Borrador',            color: 'grey' },
  internal_review: { label: 'En revision interna', color: 'blue' },
  pending_client:  { label: 'Pendiente cliente',   color: 'orange' },
  approved:        { label: 'Aprobado',            color: 'green' },
  delivered:       { label: 'Entregado',           color: 'teal' },
};

function nextStatus(current) {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx === -1 || idx >= STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
}

function formatDate(iso) {
  if (!iso) return '--';
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const DeliverableRow = React.memo(({ deliverable, onAdvance, onDelete, advancing, deleting }) => {
  const cfg  = STATUS_CONFIG[deliverable.status] || STATUS_CONFIG.draft;
  const next = nextStatus(deliverable.status);
  const nextCfg = next ? STATUS_CONFIG[next] : null;

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowName}>{deliverable.name}</div>
        {deliverable.description && (
          <div className={styles.rowDesc}>{deliverable.description}</div>
        )}
      </div>
      <div className={styles.rowMeta}>
        <Label color={cfg.color} size="small" className={styles.statusLabel}>
          {cfg.label}
        </Label>
        {deliverable.dueDate && (
          <span className={styles.dueDate}>
            <Icon name="calendar outline" size="small" />
            {formatDate(deliverable.dueDate)}
          </span>
        )}
      </div>
      <div className={styles.rowActions}>
        {next && (
          <Button
            size="mini"
            loading={advancing}
            disabled={advancing || deleting}
            onClick={() => onAdvance(deliverable.id, next)}
            icon="arrow right"
            content={`Avanzar: ${nextCfg?.label}`}
            className={styles.advanceBtn}
          />
        )}
        <Button
          size="mini"
          color="red"
          basic
          icon="trash"
          loading={deleting}
          disabled={advancing || deleting}
          onClick={() => onDelete(deliverable.id)}
          title="Eliminar"
        />
      </div>
    </div>
  );
});

const EMPTY_FORM = { name: '', description: '', dueDate: '' };

const DeliverablesModal = React.memo(() => {
  const dispatch    = useDispatch();
  const project     = useSelector(selectors.selectCurrentProject);
  const accessToken = useSelector(selectors.selectAccessToken);

  const [deliverables, setDeliverables] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [advancing,    setAdvancing]    = useState(null);
  const [deleting,     setDeleting]     = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [error,        setError]        = useState('');

  const handleClose = useCallback(() => dispatch(entryActions.closeModal()), [dispatch]);

  const loadDeliverables = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const data = await apiFetch(`/api/projects/${project.id}/deliverables`, {}, accessToken);
      setDeliverables(data.items || data || []);
    } catch (_) {
      setDeliverables([]);
    } finally {
      setLoading(false);
    }
  }, [project?.id, accessToken]);

  useEffect(() => { loadDeliverables(); }, [loadDeliverables]);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) {
      setError('El nombre del entregable es requerido.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await apiFetch(
        `/api/projects/${project.id}/deliverables`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            dueDate: form.dueDate || undefined,
          }),
        },
        accessToken,
      );
      setForm(EMPTY_FORM);
      await loadDeliverables();
    } catch (_) {
      setError('Error al guardar el entregable. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }, [form, project?.id, accessToken, loadDeliverables]);

  const handleAdvance = useCallback(async (id, newStatus) => {
    setAdvancing(id);
    try {
      await apiFetch(
        `/api/projects/${project.id}/deliverables/${id}`,
        { method: 'PATCH', body: JSON.stringify({ status: newStatus }) },
        accessToken,
      );
      await loadDeliverables();
    } catch (_) { /* ignore */ }
    finally { setAdvancing(null); }
  }, [project?.id, accessToken, loadDeliverables]);

  const handleDelete = useCallback(async (id) => {
    setDeleting(id);
    try {
      await apiFetch(
        `/api/projects/${project.id}/deliverables/${id}`,
        { method: 'DELETE' },
        accessToken,
      );
      await loadDeliverables();
    } catch (_) { /* ignore */ }
    finally { setDeleting(null); }
  }, [project?.id, accessToken, loadDeliverables]);

  const countByStatus = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = deliverables.filter((d) => d.status === s).length;
    return acc;
  }, {});

  return (
    <Modal open closeIcon size="large" onClose={handleClose} className={styles.modal}>
      <Modal.Header className={styles.header}>
        <div className={styles.headerLeft}>
          <Icon name="tasks" className={styles.headerIcon} />
          <div>
            <div className={styles.headerTitle}>Entregables del Proyecto</div>
            <div className={styles.headerSub}>
              {project?.name}
              {project?.clientName && (
                <span className={styles.clientChip}>{project.clientName}</span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.summaryChips}>
            {STATUS_ORDER.map((s) => (
              <span
                key={s}
                className={styles.summaryChip}
                style={{ opacity: countByStatus[s] > 0 ? 1 : 0.45 }}
              >
                <Label color={STATUS_CONFIG[s].color} size="mini" circular>
                  {countByStatus[s]}
                </Label>
                {STATUS_CONFIG[s].label}
              </span>
            ))}
          </div>
        </div>
      </Modal.Header>

      <Modal.Content className={styles.content}>
        <div className={styles.formSection}>
          <div className={styles.formTitle}>
            <Icon name="plus circle" />
            Agregar entregable
          </div>
          <Form className={styles.form}>
            <Form.Group widths="equal">
              <Form.Field required>
                <label>Nombre</label>
                <Input
                  placeholder="Nombre del entregable..."
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Form.Field>
              <Form.Field>
                <label>Descripcion</label>
                <Input
                  placeholder="Descripcion opcional..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Form.Field>
              <Form.Field>
                <label>Fecha limite</label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </Form.Field>
              <Form.Field className={styles.submitField}>
                <label>&nbsp;</label>
                <Button
                  primary
                  loading={saving}
                  disabled={saving}
                  onClick={handleSubmit}
                  icon="save"
                  content="Guardar"
                />
              </Form.Field>
            </Form.Group>
            {error && <div className={styles.errorMsg}>{error}</div>}
          </Form>
        </div>

        <div className={styles.listSection}>
          {loading && <Loader active inline="centered" className={styles.loader} />}

          {!loading && deliverables.length === 0 && (
            <div className={styles.empty}>
              <Icon name="tasks" size="huge" className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>Sin entregables registrados</p>
              <p className={styles.emptyHint}>
                Agrega el primer entregable usando el formulario de arriba.
              </p>
            </div>
          )}

          {!loading && deliverables.length > 0 && (
            <div className={styles.deliverableList}>
              {deliverables.map((d) => (
                <DeliverableRow
                  key={d.id}
                  deliverable={d}
                  onAdvance={handleAdvance}
                  onDelete={handleDelete}
                  advancing={advancing === d.id}
                  deleting={deleting === d.id}
                />
              ))}
            </div>
          )}
        </div>
      </Modal.Content>
    </Modal>
  );
});

export default DeliverablesModal;
