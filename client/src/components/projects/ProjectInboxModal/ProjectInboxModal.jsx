/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, Icon, Input, Label, Loader, Modal } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './ProjectInboxModal.module.scss';

/* ─────────────────── helpers ─────────────────── */

// V2 server base - in production this would be the same origin.
// During dev/demo the v2 server runs on a different port.
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

const CONVERT_OPTIONS = [
  { key: 'task',     value: 'task',     text: '✅  Tarea' },
  { key: 'comment',  value: 'comment',  text: '💬  Comentario' },
  { key: 'evidence', value: 'evidence', text: '📎  Evidencia' },
];

const PRIORITY_COLORS = { urgent: '#eb5a46', high: '#ff9f1a', normal: '#0079bf', low: '#b3bac5' };

const STATUS_CONFIG = {
  on_track:  { label: 'En curso',    color: '#61bd4f' },
  at_risk:   { label: 'En riesgo',   color: '#f2d600' },
  on_hold:   { label: 'Detenido',    color: '#eb5a46' },
  completed: { label: 'Completado',  color: '#0079bf' },
};

/* ─────────────────── EmailRow ─────────────────── */

const EmailRow = React.memo(({ email, cards, onConvert, onAssignCard, accessToken }) => {
  const [open, setOpen]         = useState(false);
  const [converting, setConv]   = useState(false);
  const [assigning, setAssign]  = useState(false);
  const [selectedCard, setSCard] = useState(email.cardId || '');

  const fromLabel = email.fromName
    ? `${email.fromName} <${email.fromEmail}>`
    : email.fromEmail;

  const dateStr = email.receivedAt
    ? new Date(email.receivedAt).toLocaleString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '';

  const handleConvert = useCallback(async (_e, { value }) => {
    setConv(true);
    try { await onConvert(email.id, value, selectedCard || undefined); }
    finally { setConv(false); }
  }, [email.id, selectedCard, onConvert]);

  const handleAssignCard = useCallback(async (_e, { value }) => {
    setSCard(value);
    setAssign(true);
    try { await onAssignCard(email.id, value); }
    finally { setAssign(false); }
  }, [email.id, onAssignCard]);

  const cardOptions = useMemo(() => [
    { key: '', value: '', text: '— Solo al proyecto —' },
    ...cards.map(c => ({ key: c.id, value: c.id, text: `${c.activityCode ? `ACT-${c.activityCode}` : c.id.slice(-4)} — ${c.name}` })),
  ], [cards]);

  const linkedCard = cards.find(c => c.id === email.cardId);

  return (
    <div className={classNames(styles.row, email.isProcessed && styles.rowProcessed, open && styles.rowOpen)}>
      {/* Header bar */}
      <div className={styles.rowHeader} onClick={() => setOpen(v => !v)}>
        <Icon name={open ? 'chevron down' : 'chevron right'} size="small" className={styles.chevron} />

        <div className={styles.rowMeta}>
          <span className={styles.rowFrom}>{fromLabel}</span>
          <span className={styles.rowSubject}>{email.subject}</span>
        </div>

        <div className={styles.rowRight}>
          {email.token && (
            <code className={styles.token}>{email.token}</code>
          )}
          {linkedCard && (
            <span className={styles.cardBadge}>
              <Icon name="columns" size="small" />
              {linkedCard.name.slice(0, 20)}
            </span>
          )}
          {email.inReplyTo && (
            <Icon name="reply" size="small" className={styles.replyIcon} title="Respuesta de hilo" />
          )}
          {email.attachments?.length > 0 && (
            <Icon name="paperclip" size="small" className={styles.attachIcon} />
          )}
          {email.isProcessed
            ? <Label size="mini" color="teal" className={styles.processedLabel}>{email.processedAs}</Label>
            : <Label size="mini" color="orange" className={styles.processedLabel}>Pendiente</Label>
          }
          <span className={styles.rowDate}>{dateStr}</span>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div className={styles.rowBody}>
          {/* Thread indicator */}
          {email.inReplyTo && (
            <div className={styles.threadBadge}>
              <Icon name="comments outline" size="small" />
              Respuesta en hilo — Message-ID: <code>{email.inReplyTo.slice(0, 40)}…</code>
            </div>
          )}

          {/* Email body */}
          <pre className={styles.bodyText}>
            {email.bodyText || '(sin contenido de texto)'}
          </pre>

          {/* Attachments */}
          {email.attachments?.length > 0 && (
            <div className={styles.attList}>
              <span className={styles.attTitle}><Icon name="paperclip" />Adjuntos ({email.attachments.length})</span>
              {email.attachments.map(a => (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.attLink}
                >
                  <Icon name="file outline" size="small" />
                  {a.filename}
                  {a.size && <span className={styles.attSize}>({Math.round(a.size / 1024)} KB)</span>}
                </a>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className={styles.rowActions}>
            {/* Assign to card */}
            <div className={styles.actionGroup}>
              <span className={styles.actionLabel}>Asociar a tarjeta:</span>
              <Dropdown
                selection
                search
                options={cardOptions}
                value={selectedCard}
                onChange={handleAssignCard}
                loading={assigning}
                disabled={assigning || email.isProcessed}
                className={styles.cardDropdown}
                placeholder="Seleccionar tarjeta..."
                selectOnBlur={false}
              />
            </div>

            {/* Convert */}
            {!email.isProcessed && (
              <div className={styles.actionGroup}>
                <span className={styles.actionLabel}>Convertir en:</span>
                <Dropdown
                  button
                  options={CONVERT_OPTIONS}
                  text={converting ? 'Procesando…' : 'Convertir'}
                  disabled={converting}
                  onChange={handleConvert}
                  selectOnBlur={false}
                  value={null}
                  className={styles.convertBtn}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

/* ─────────────────── ProjectInboxModal ─────────────────── */

const ProjectInboxModal = React.memo(() => {
  const dispatch    = useDispatch();
  const project     = useSelector(selectors.selectCurrentProject);
  const accessToken = useSelector(selectors.selectAccessToken);

  const [emails,   setEmails]   = useState([]);
  const [cards,    setCards]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all'); // all | unprocessed | processed
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const PER_PAGE = 20;

  const handleClose = useCallback(() => dispatch(entryActions.closeModal()), [dispatch]);

  /* ── load emails ── */
  const loadEmails = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, perPage: PER_PAGE });
      const data = await apiFetch(
        `/api/projects/${project.id}/inbound-emails?${params}`,
        {}, accessToken,
      );
      setEmails(data.items || []);
      setTotal(data.total || 0);
    } catch (_) { /* ignore */ }
    finally { setLoading(false); }
  }, [project?.id, accessToken, page]);

  /* ── load cards for assign dropdown ── */
  const loadCards = useCallback(async () => {
    if (!project?.id) return;
    try {
      // Fetch all boards then their cards via existing API
      const projectData = await apiFetch(`/api/projects/${project.id}`, {}, accessToken);
      const boardIds = (projectData.included?.boards || []).map(b => b.id);
      const allCards = [];
      for (const boardId of boardIds.slice(0, 5)) {
        try {
          const bd = await apiFetch(`/api/boards/${boardId}`, {}, accessToken);
          (bd.included?.cards || []).forEach(c => allCards.push(c));
        } catch (_) {}
      }
      setCards(allCards);
    } catch (_) {}
  }, [project?.id, accessToken]);

  useEffect(() => { loadEmails(); }, [loadEmails]);
  useEffect(() => { loadCards(); },  [loadCards]);

  const handleConvert = useCallback(async (emailId, convertTo, cardId) => {
    try {
      await apiFetch(`/api/inbound-emails/${emailId}/convert`, {
        method: 'POST',
        body: JSON.stringify({ convertTo, cardId }),
      }, accessToken);
      await loadEmails();
    } catch (_) {}
  }, [accessToken, loadEmails]);

  const handleAssignCard = useCallback(async (emailId, cardId) => {
    // For now update via direct DB patch - use the convert endpoint with no convertTo
    // We expose a simple PATCH endpoint behavior by just reloading after optimistic update
    setEmails(prev => prev.map(e =>
      e.id === emailId ? { ...e, cardId: cardId || null } : e,
    ));
    // TODO: call PATCH /api/inbound-emails/:id when that endpoint is built
  }, []);

  /* ── filtered emails ── */
  const filtered = useMemo(() => {
    let list = emails;
    if (filter === 'unprocessed') list = list.filter(e => !e.isProcessed);
    if (filter === 'processed')   list = list.filter(e => e.isProcessed);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.subject?.toLowerCase().includes(q) ||
        e.fromEmail?.toLowerCase().includes(q) ||
        e.fromName?.toLowerCase().includes(q) ||
        e.bodyText?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [emails, filter, search]);

  const unprocessedCount = useMemo(() => emails.filter(e => !e.isProcessed).length, [emails]);

  const statusCfg = project?.projectStatus ? STATUS_CONFIG[project.projectStatus] : null;
  const inboundEmail = 'inbound@saggioesg.com';
  const projectToken = project?.projectCode ? `[SGG-PROY-${project.projectCode}]` : null;

  return (
    <Modal open closeIcon size="large" onClose={handleClose} className={styles.modal}>
      <Modal.Header className={styles.header}>
        <div className={styles.headerLeft}>
          <Icon name="mail" className={styles.headerIcon} />
          <div>
            <div className={styles.headerTitle}>Bandeja de Correos del Proyecto</div>
            <div className={styles.headerSub}>
              {project?.name}
              {project?.clientName && <span className={styles.clientChip}>{project.clientName}</span>}
              {statusCfg && (
                <span
                  className={styles.statusChip}
                  style={{ backgroundColor: statusCfg.color }}
                >
                  {statusCfg.label}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          {projectToken && (
            <div className={styles.tokenInfo}>
              <Icon name="tag" size="small" />
              Enviar a <strong>{inboundEmail}</strong> con token <code>{projectToken}</code>
            </div>
          )}
        </div>
      </Modal.Header>

      <Modal.Content className={styles.content}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <Input
              icon="search"
              placeholder="Buscar correos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
              size="small"
            />
            <Button.Group size="small" className={styles.filterGroup}>
              <Button
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                Todos <Label size="mini" circular>{total}</Label>
              </Button>
              <Button
                active={filter === 'unprocessed'}
                color={unprocessedCount > 0 ? 'orange' : undefined}
                onClick={() => setFilter('unprocessed')}
              >
                Pendientes <Label size="mini" circular>{unprocessedCount}</Label>
              </Button>
              <Button
                active={filter === 'processed'}
                onClick={() => setFilter('processed')}
              >
                Procesados <Label size="mini" circular>{total - unprocessedCount}</Label>
              </Button>
            </Button.Group>
          </div>
          <div className={styles.toolbarRight}>
            <Button
              size="small"
              icon="refresh"
              loading={loading}
              onClick={loadEmails}
              title="Actualizar"
            />
          </div>
        </div>

        {/* Stats bar */}
        {total > 0 && (
          <div className={styles.statsBar}>
            <span className={styles.statItem}>
              <Icon name="mail" size="small" />
              {total} correo{total !== 1 ? 's' : ''}
            </span>
            <span className={styles.statItem}>
              <Icon name="clock outline" size="small" />
              {unprocessedCount} pendiente{unprocessedCount !== 1 ? 's' : ''}
            </span>
            <span className={styles.statItem}>
              <Icon name="checkmark" size="small" />
              {total - unprocessedCount} procesado{(total - unprocessedCount) !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Email list */}
        {loading && <Loader active inline="centered" className={styles.loader} />}

        {!loading && filtered.length === 0 && (
          <div className={styles.empty}>
            <Icon name="inbox" size="huge" className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>Sin correos{filter !== 'all' ? ' en esta categoría' : ''}</p>
            {filter === 'all' && projectToken && (
              <p className={styles.emptyHint}>
                Envía correos a <strong>{inboundEmail}</strong> con <code>{projectToken}</code> en el asunto
              </p>
            )}
          </div>
        )}

        <div className={styles.emailList}>
          {filtered.map(email => (
            <EmailRow
              key={email.id}
              email={email}
              cards={cards}
              onConvert={handleConvert}
              onAssignCard={handleAssignCard}
              accessToken={accessToken}
            />
          ))}
        </div>

        {/* Pagination */}
        {total > PER_PAGE && (
          <div className={styles.pagination}>
            <Button
              size="small"
              icon="chevron left"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            />
            <span className={styles.pageInfo}>Página {page} de {Math.ceil(total / PER_PAGE)}</span>
            <Button
              size="small"
              icon="chevron right"
              disabled={page >= Math.ceil(total / PER_PAGE)}
              onClick={() => setPage(p => p + 1)}
            />
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
});

export default ProjectInboxModal;
