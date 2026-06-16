/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Dropdown,
  Form,
  Icon,
  Input,
  Loader,
  Modal,
  Tab,
  Table,
} from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './EnvironmentalDataModal.module.scss';

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

const CATEGORY_OPTIONS = [
  { key: 'Energia',       value: 'Energia',       text: 'Energia' },
  { key: 'Agua',          value: 'Agua',          text: 'Agua' },
  { key: 'Combustible',   value: 'Combustible',   text: 'Combustible' },
  { key: 'Residuos',      value: 'Residuos',      text: 'Residuos' },
  { key: 'Transporte',    value: 'Transporte',    text: 'Transporte' },
  { key: 'Refrigerantes', value: 'Refrigerantes', text: 'Refrigerantes' },
];

const SCOPE_OPTIONS = [
  { key: '1', value: 'Alcance 1', text: 'Alcance 1' },
  { key: '2', value: 'Alcance 2', text: 'Alcance 2' },
  { key: '3', value: 'Alcance 3', text: 'Alcance 3' },
];

const EMPTY_FORM = {
  category: '',
  subcategory: '',
  scope: '',
  quantity: '',
  unit: '',
  period: '',
  source: '',
};

/* ─────────────────── Tab 1: Datos del Cliente ─────────────────── */

const ClientDataTab = React.memo(({ projectId, accessToken }) => {
  const [data,     setData]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [error,    setError]    = useState('');

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/projects/${projectId}/environmental-data`, {}, accessToken);
      setData(res.items || res || []);
    } catch (_) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, accessToken]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = useCallback(async () => {
    if (!form.category || !form.quantity) {
      setError('Categoria y cantidad son requeridas.');
      return;
    }
    const qty = parseFloat(form.quantity);
    if (isNaN(qty) || qty < 0) {
      setError('Ingresa una cantidad valida.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await apiFetch(
        `/api/projects/${projectId}/environmental-data`,
        {
          method: 'POST',
          body: JSON.stringify({
            category:    form.category,
            subcategory: form.subcategory || undefined,
            scope:       form.scope || undefined,
            quantity:    qty,
            unit:        form.unit || undefined,
            period:      form.period || undefined,
            source:      form.source || undefined,
          }),
        },
        accessToken,
      );
      setForm(EMPTY_FORM);
      await loadData();
    } catch (_) {
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }, [form, projectId, accessToken, loadData]);

  const handleDelete = useCallback(async (id) => {
    setDeleting(id);
    try {
      await apiFetch(
        `/api/projects/${projectId}/environmental-data/${id}`,
        { method: 'DELETE' },
        accessToken,
      );
      await loadData();
    } catch (_) { /* ignore */ }
    finally { setDeleting(null); }
  }, [projectId, accessToken, loadData]);

  const setField = (key) => (e, { value } = {}) => {
    const val = value !== undefined ? value : e?.target?.value ?? '';
    setForm((f) => ({ ...f, [key]: val }));
  };

  return (
    <div className={styles.tabPane}>
      {/* Add form */}
      <div className={styles.formSection}>
        <div className={styles.formTitle}>
          <Icon name="plus circle" />
          Agregar dato ambiental
        </div>
        <Form className={styles.form}>
          <Form.Group>
            <Form.Field width={3}>
              <label>Categoria</label>
              <Dropdown
                selection
                options={CATEGORY_OPTIONS}
                placeholder="Categoria"
                value={form.category}
                onChange={setField('category')}
                className={styles.dropdown}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>Subcategoria</label>
              <Input
                placeholder="Ej: Electricidad..."
                value={form.subcategory}
                onChange={setField('subcategory')}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>Alcance</label>
              <Dropdown
                selection
                options={SCOPE_OPTIONS}
                placeholder="Alcance"
                value={form.scope}
                onChange={setField('scope')}
                className={styles.dropdown}
              />
            </Form.Field>
            <Form.Field width={2}>
              <label>Cantidad</label>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0.0"
                value={form.quantity}
                onChange={setField('quantity')}
              />
            </Form.Field>
            <Form.Field width={2}>
              <label>Unidad</label>
              <Input
                placeholder="kWh, L, kg..."
                value={form.unit}
                onChange={setField('unit')}
              />
            </Form.Field>
          </Form.Group>
          <Form.Group>
            <Form.Field width={4}>
              <label>Periodo</label>
              <Input
                placeholder="Ej: Enero 2024, Q1 2024..."
                value={form.period}
                onChange={setField('period')}
              />
            </Form.Field>
            <Form.Field width={4}>
              <label>Fuente / Proveedor</label>
              <Input
                placeholder="Ej: Factura CFE, Pemex..."
                value={form.source}
                onChange={setField('source')}
              />
            </Form.Field>
            <Form.Field width={3} className={styles.submitField}>
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

        {!loading && data.length === 0 && (
          <div className={styles.empty}>
            <Icon name="leaf" size="huge" className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>Sin datos ambientales registrados</p>
            <p className={styles.emptyHint}>Agrega datos usando el formulario de arriba.</p>
          </div>
        )}

        {!loading && data.length > 0 && (
          <>
            <Table celled compact striped className={styles.table}>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Categoria</Table.HeaderCell>
                  <Table.HeaderCell>Subcategoria</Table.HeaderCell>
                  <Table.HeaderCell>Alcance</Table.HeaderCell>
                  <Table.HeaderCell textAlign="right">Cantidad</Table.HeaderCell>
                  <Table.HeaderCell>Unidad</Table.HeaderCell>
                  <Table.HeaderCell>Periodo</Table.HeaderCell>
                  <Table.HeaderCell>Fuente</Table.HeaderCell>
                  <Table.HeaderCell textAlign="center">Acciones</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.map((row) => (
                  <Table.Row key={row.id}>
                    <Table.Cell className={styles.categoryCell}>{row.category}</Table.Cell>
                    <Table.Cell>{row.subcategory || '--'}</Table.Cell>
                    <Table.Cell>{row.scope || '--'}</Table.Cell>
                    <Table.Cell textAlign="right" className={styles.qtyCell}>
                      {parseFloat(row.quantity || 0).toLocaleString('es-ES')}
                    </Table.Cell>
                    <Table.Cell>{row.unit || '--'}</Table.Cell>
                    <Table.Cell>{row.period || '--'}</Table.Cell>
                    <Table.Cell>{row.source || '--'}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        size="mini"
                        color="red"
                        basic
                        icon="trash"
                        loading={deleting === row.id}
                        disabled={deleting === row.id}
                        onClick={() => handleDelete(row.id)}
                        title="Eliminar"
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            <div className={styles.co2Notice}>
              <Icon name="info circle" />
              Aplica factor de emision para calcular el total de CO2e estimado
            </div>
          </>
        )}
      </div>
    </div>
  );
});

/* ─────────────────── Tab 2: Factores de Emision ─────────────────── */

const EmissionFactorsTab = React.memo(({ accessToken }) => {
  const [factors,  setFactors]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState('');

  const loadFactors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/emission-factors', {}, accessToken);
      setFactors(data.items || data || []);
    } catch (_) {
      setFactors([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { loadFactors(); }, [loadFactors]);

  const filtered = useMemo(() => {
    if (!search.trim()) return factors;
    const q = search.toLowerCase();
    return factors.filter((f) =>
      f.name?.toLowerCase().includes(q) ||
      f.category?.toLowerCase().includes(q) ||
      f.source?.toLowerCase().includes(q) ||
      f.country?.toLowerCase().includes(q),
    );
  }, [factors, search]);

  return (
    <div className={styles.tabPane}>
      <div className={styles.efToolbar}>
        <Input
          icon="search"
          placeholder="Buscar factor de emision..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
          size="small"
        />
        <Button
          size="small"
          icon="refresh"
          loading={loading}
          onClick={loadFactors}
          title="Actualizar"
        />
        <span className={styles.efCount}>{filtered.length} factor{filtered.length !== 1 ? 'es' : ''}</span>
      </div>

      <div className={styles.tableSection}>
        {loading && <Loader active inline="centered" className={styles.loader} />}

        {!loading && filtered.length === 0 && (
          <div className={styles.empty}>
            <Icon name="database" size="huge" className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>
              {search.trim() ? 'Sin resultados para la busqueda' : 'Sin factores de emision disponibles'}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <Table celled compact striped className={styles.table}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Nombre</Table.HeaderCell>
                <Table.HeaderCell>Categoria</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">Factor</Table.HeaderCell>
                <Table.HeaderCell>Unidad entrada</Table.HeaderCell>
                <Table.HeaderCell>kgCO2e</Table.HeaderCell>
                <Table.HeaderCell>Fuente</Table.HeaderCell>
                <Table.HeaderCell>Pais</Table.HeaderCell>
                <Table.HeaderCell>Ano</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.map((f) => (
                <Table.Row key={f.id}>
                  <Table.Cell className={styles.efNameCell}>{f.name}</Table.Cell>
                  <Table.Cell>{f.category || '--'}</Table.Cell>
                  <Table.Cell textAlign="right" className={styles.qtyCell}>
                    {f.factor != null ? parseFloat(f.factor).toFixed(4) : '--'}
                  </Table.Cell>
                  <Table.Cell>{f.inputUnit || f.unit || '--'}</Table.Cell>
                  <Table.Cell>{f.kgCO2e != null ? parseFloat(f.kgCO2e).toFixed(4) : '--'}</Table.Cell>
                  <Table.Cell>{f.source || '--'}</Table.Cell>
                  <Table.Cell>{f.country || '--'}</Table.Cell>
                  <Table.Cell>{f.year || f.ano || '--'}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
});

/* ─────────────────── EnvironmentalDataModal ─────────────────── */

const EnvironmentalDataModal = React.memo(() => {
  const dispatch    = useDispatch();
  const project     = useSelector(selectors.selectCurrentProject);
  const accessToken = useSelector(selectors.selectAccessToken);

  const handleClose = useCallback(() => dispatch(entryActions.closeModal()), [dispatch]);

  const panes = useMemo(() => [
    {
      menuItem: { key: 'client', icon: 'leaf', content: 'Datos del Cliente' },
      render: () => (
        <Tab.Pane className={styles.pane}>
          <ClientDataTab projectId={project?.id} accessToken={accessToken} />
        </Tab.Pane>
      ),
    },
    {
      menuItem: { key: 'factors', icon: 'database', content: 'Factores de Emision' },
      render: () => (
        <Tab.Pane className={styles.pane}>
          <EmissionFactorsTab accessToken={accessToken} />
        </Tab.Pane>
      ),
    },
  ], [project?.id, accessToken]);

  return (
    <Modal open closeIcon size="large" onClose={handleClose} className={styles.modal}>
      <Modal.Header className={styles.header}>
        <div className={styles.headerLeft}>
          <Icon name="leaf" className={styles.headerIcon} />
          <div>
            <div className={styles.headerTitle}>Datos Ambientales</div>
            <div className={styles.headerSub}>
              {project?.name}
              {project?.clientName && (
                <span className={styles.clientChip}>{project.clientName}</span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.esgBadge}>
            <Icon name="recycle" size="small" />
            Modulo ESG
          </span>
        </div>
      </Modal.Header>

      <Modal.Content className={styles.content}>
        <Tab
          panes={panes}
          className={styles.tabs}
          menu={{ secondary: true, pointing: true, className: styles.tabMenu }}
        />
      </Modal.Content>
    </Modal>
  );
});

export default EnvironmentalDataModal;
