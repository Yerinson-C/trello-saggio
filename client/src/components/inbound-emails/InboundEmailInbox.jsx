/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Button, Dropdown, Icon, Label, Loader } from 'semantic-ui-react';

import selectors from '../../selectors';

import styles from './InboundEmailInbox.module.scss';

const V2_BASE = window.V2_API_BASE || '';

async function apiFetch(url, options = {}, token) {
  const fullUrl = url.startsWith('http') ? url : `${V2_BASE}${url}`;
  const res = await fetch(fullUrl, {
    ...options,

    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const CONVERT_OPTIONS = [
  { key: 'task', value: 'task', text: '✅ Convertir en tarea' },
  { key: 'comment', value: 'comment', text: '💬 Convertir en comentario' },
  { key: 'evidence', value: 'evidence', text: '📎 Convertir en evidencia' },
];

const EmailItem = React.memo(({ email, onConvert }) => {
  const [expanded, setExpanded] = useState(false);
  const [converting, setConverting] = useState(false);

  const handleConvert = useCallback(async (_e, { value }) => {
    setConverting(true);
    try {
      await onConvert(email.id, value);
    } finally {
      setConverting(false);
    }
  }, [email.id, onConvert]);

  const fromLabel = email.fromName ? `${email.fromName} <${email.fromEmail}>` : email.fromEmail;
  const date = email.receivedAt ? new Date(email.receivedAt).toLocaleString('es-ES') : '';

  return (
    <div className={classNames(styles.emailItem, email.isProcessed && styles.emailProcessed)}>
      <div className={styles.emailHeader} onClick={() => setExpanded((v) => !v)}>
        <Icon name={expanded ? 'chevron down' : 'chevron right'} size="small" />
        <span className={styles.emailFrom}>{fromLabel}</span>
        <span className={styles.emailSubject}>{email.subject}</span>
        <span className={styles.emailDate}>{date}</span>
        {email.isProcessed && (
          <Label size="tiny" color="teal">{email.processedAs}</Label>
        )}
        {email.attachments?.length > 0 && (
          <Icon name="paperclip" size="small" className={styles.attachIcon} />
        )}
      </div>

      {expanded && (
        <div className={styles.emailBody}>
          <pre className={styles.emailText}>{email.bodyText || '(sin contenido de texto)'}</pre>

          {email.attachments?.length > 0 && (
            <div className={styles.attachments}>
              <strong>Adjuntos:</strong>
              {email.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.attachLink}
                >
                  <Icon name="file outline" size="small" />
                  {att.filename}
                </a>
              ))}
            </div>
          )}

          {!email.isProcessed && (
            <div className={styles.emailActions}>
              <Dropdown
                button
                className={styles.convertBtn}
                text={converting ? 'Procesando...' : 'Convertir en...'}
                options={CONVERT_OPTIONS}
                disabled={converting}
                onChange={handleConvert}
                selectOnBlur={false}
                value={null}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

EmailItem.propTypes = {
  email: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onConvert: PropTypes.func.isRequired,
};

const InboundEmailInbox = React.memo(({ projectId, cardId, projectCode, activityCode }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const accessToken = useSelector(selectors.selectAccessToken);

  const prefix = window.EMAIL_TOKEN_PREFIX || 'SGG';
  const projectToken = projectCode ? `[${prefix}-PROY-${projectCode}]` : null;
  const activityToken =
    projectCode && activityCode ? `[${prefix}-PROY-${projectCode}-ACT-${activityCode}]` : null;
  const inboundEmail = window.INBOUND_EMAIL || 'inbound@saggioesg.com';

  const loadEmails = useCallback(async () => {
    setLoading(true);
    try {
      const url = cardId
        ? `/api/cards/${cardId}/inbound-emails?projectId=${projectId}`
        : `/api/projects/${projectId}/inbound-emails`;
      const data = await apiFetch(url, {}, accessToken);
      setEmails(data.items || []);
    } catch (e) {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [projectId, cardId, accessToken]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  const handleConvert = useCallback(async (emailId, convertTo) => {
    try {
      await apiFetch(
        `/api/inbound-emails/${emailId}/convert`,
        { method: 'POST', body: JSON.stringify({ convertTo, cardId }) },
        accessToken,
      );
      await loadEmails();
    } catch (e) {
      // silently fail
    }
  }, [cardId, loadEmails, accessToken]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Icon name="mail outline" className={styles.headerIcon} />
        <span className={styles.headerTitle}>Correos del proyecto</span>
        <Button
          size="mini"
          icon="info circle"
          className={styles.infoBtn}
          onClick={() => setShowTokenInfo((v) => !v)}
        />
        <Button
          size="mini"
          icon="refresh"
          className={styles.refreshBtn}
          loading={loading}
          onClick={loadEmails}
        />
      </div>

      {showTokenInfo && (
        <div className={styles.tokenInfo}>
          <p>
            Para asociar correos a este proyecto, incluye el siguiente token en el <strong>asunto</strong> del correo y envíalo a:
          </p>
          <div className={styles.inboundEmail}>
            <Icon name="envelope" />
            <strong>{inboundEmail}</strong>
          </div>
          {activityToken && (
            <div className={styles.tokenBox}>
              <Icon name="tag" />
              <code>{activityToken}</code>
              <span className={styles.tokenLabel}>→ Asocia a esta actividad</span>
            </div>
          )}
          {projectToken && (
            <div className={styles.tokenBox}>
              <Icon name="tag" />
              <code>{projectToken}</code>
              <span className={styles.tokenLabel}>→ Solo asocia al proyecto</span>
            </div>
          )}
          <p className={styles.tokenExample}>
            Ejemplo de asunto: <em>Actualización de entregables {activityToken || projectToken}</em>
          </p>
        </div>
      )}

      {loading && <Loader active inline="centered" size="small" />}

      {!loading && emails.length === 0 && (
        <div className={styles.empty}>
          <Icon name="inbox" size="large" className={styles.emptyIcon} />
          <p>No hay correos asociados todavía.</p>
        </div>
      )}

      {emails.map((email) => (
        <EmailItem key={email.id} email={email} onConvert={handleConvert} />
      ))}
    </div>
  );
});

InboundEmailInbox.propTypes = {
  projectId: PropTypes.string.isRequired,
  cardId: PropTypes.string,
  projectCode: PropTypes.number,
  activityCode: PropTypes.number,
};

InboundEmailInbox.defaultProps = {
  cardId: undefined,
  projectCode: undefined,
  activityCode: undefined,
};

export default InboundEmailInbox;
