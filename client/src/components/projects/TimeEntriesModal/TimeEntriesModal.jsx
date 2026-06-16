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
  Loader,
  Modal,
  Table,
} from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './TimeEntriesModal.module.scss';

/* ─────────────────── helpers ─────────────────── */

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

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/* ─────────────────── TimeEntriesModal ─────────────────── */

const EMPTY_FORM = { date: '', description: '', hours: '' };

const TimeEntriesModal = React.memo(() => {
  const dispatch    = useDispatch();
  const project     = useSelector(selectors.selectCurrentProject);
  const accessToken = useSelector(selectors.selectAccessToken);
  const currentUser = useSelector(selectors.selectCurrentUser);

  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [error,    setError]    = useState('');

  const handleClose = useCallback(() => dispatch(entryActions.closeModal()), [dispatch]);

  /* ── load entries ── */
  const loadEntries = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const data = await apiFetch(`/api/projects/${project.id}/time-entries`, {}, accessToken);
      setEntries(data.items || data || []);
    } catch (_) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [project?.id, accessToken]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  /* ── add entry ── */
  const handleSubmit = useCallback(async () => {
    if (!form.date || !form.hours) {
      setError('Fecha y horas son requeridas.');
      return;
    }
    const hours = parseFloat(form.hours);
    if (isNaN(hours) || hours <= 0) {
      setError('Ingresa un valor valido de horas.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await apiFetch(
        `/api/projects/${project.id}/time-entries`,
        {
          method: 'POST',
          body: JSON.stringify({
            date: form.date,
            description: form.description,
            hours,
          }),
        },
        accessToken,
      );
      setForm(EMPTY_FORM);
      await loadEntries();
    } catch (_) {
      setError('Error al guardar la entrada. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }, [form, project?.id, accessToken, loadEntries]);

  /* ── delete entry ── */
  const handleDelete = useCallback(async (id) => {
    setDeleting(id);
    try {
      await apiFetch(
        `/api/projects/${project.id}/time-entries/${id}`,
        { method: 'DELETE' },
        accessToken,
      );
      await loadEntries();
    } catch (_) {
      /* ignore */
    } finally {
      setDeleting(null);
    }
  }, [project?.id, accessToken, loadEntries]);

  const totalHours = entries.reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0);

  return (
    <Modal open closeIcon size="large" onClose={handleClose} className={styles.modal}>
      <Modal.Header className={styles.header}>
        <div className={styles.headerLeft}>
          <Icon name="clock outline" className={styles.headerIcon} />
          <div>
            <div className={styles.headerTitle}>Registro de Horas</div>
            <div className={styles.headerSub}>
              {project?.name}
              {project?.clientName && (
                <span className={styles.clientChip}>{project.clientName}</span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.totalBadge}>
            <Icon name="time" size="small" />
            Total: <strong>{totalHours.toFixed(1)} horas</strong>
          </div>
        </div>
      </Modal.Header>

      <Modal.Content className={styles.content}>
        {/* Add entry form */}
        <div className={styles.formSection}>
          <div className={styles.formTitle}>
            <Icon name="plus circle" />
            Agregar entrada de horas
          </div>
          <Form className={styles.form}>
            <Form.Group widths="equal">
              <Form.Field>
                <label>Fecha</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </Form.Field>
              <Form.Field>
                <label>Descripcion</label>
                <Input
                  placeholder="Descripcion del trabajo..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Form.Field>
              <Form.Field>
                <label>Horas</label>
                <Input
                  type="number"
                  min="0.25"
                  step="0.25"
                  placeholder="0.0"
                  value={form.hours}
                  onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
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

        {/* Table */}
        <div className={styles.tableSection}>
          {loading && <Loader active inline="centered" className={styles.loader} />}

          {!loading && entries.length === 0 && (
            <div className={styles.empty}>
              <Icon name="clock outline" size="huge" className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>Sin registros de horas</p>
              <p className={styles.emptyHint}>Agrega la primera entrada usando el formulario de arriba.</p>
            </div>
          )}

          {!loading && entries.length > 0 && (
            <>
              <Table celled striped compact className={styles.table}>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Fecha</Table.HeaderCell>
                    <Table.HeaderCell>Descripcion</Table.HeaderCell>
                    <Table.HeaderCell textAlign="right">Horas</Table.HeaderCell>
                    <Table.HeaderCell>Consultor</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">Acciones</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {entries.map((entry) => (
                    <Table.Row key={entry.id}>
                      <Table.Cell className={styles.dateCell}>
                        {formatDate(entry.date)}
                      </Table.Cell>
                      <Table.Cell>{entry.description || '—'}</Table.Cell>
                      <Table.Cell textAlign="right" className={styles.hoursCell}>
                        {parseFloat(entry.hours || 0).toFixed(1)}
                      </Table.Cell>
                      <Table.Cell className={styles.consultantCell}>
                        {entry.consultantName || entry.userName || currentUser?.name || '—'}
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        <Button
                          size="mini"
                          color="red"
                          basic
                          icon="trash"
                          loading={deleting === entry.id}
                          disabled={deleting === entry.id}
                          onClick={() => handleDelete(entry.id)}
                          title="Eliminar"
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              <div className={styles.totalRow}>
                <Icon name="sigma" />
                Total de horas registradas:
                <strong className={styles.totalValue}>{totalHours.toFixed(1)} h</strong>
              </div>
            </>
          )}
        </div>
      </Modal.Content>
    </Modal>
  );
});

export default TimeEntriesModal;
