import React, { useState, useEffect } from 'react';
import { Icon } from 'semantic-ui-react';
import { Link, useParams } from 'react-router';

import styles from './PortalClientePage.module.scss';

const MOCK_PROJECT = {
  name: 'Inventario GEI 2024 — Cementos del Valle',
  client: 'Cementos del Valle S.A.',
  service: 'Inventario GEI (Alcances 1, 2 y 3)',
  standard: 'GHG Protocol Corporate Standard',
  status: 'En progreso',
  startDate: '2025-02-01',
  endDate: '2025-07-31',
  progress: 68,
  consultora: 'Saggio ESG Consultores',
  manager: 'Valentina Torres',
};

const MOCK_MILESTONES = [
  { id: 1, name: 'Kickoff y recopilación de datos', status: 'completado', date: '2025-02-15' },
  { id: 2, name: 'Definición de alcance y límites operacionales', status: 'completado', date: '2025-03-01' },
  { id: 3, name: 'Inventario Alcance 1 y 2', status: 'completado', date: '2025-04-15' },
  { id: 4, name: 'Inventario Alcance 3', status: 'en_progreso', date: '2025-05-30' },
  { id: 5, name: 'Revisión interna y validación', status: 'pendiente', date: '2025-06-30' },
  { id: 6, name: 'Entrega de informe final', status: 'pendiente', date: '2025-07-31' },
];

const MOCK_DELIVERABLES = [
  { id: 1, name: 'Plan de trabajo y cronograma', status: 'aprobado', date: '2025-02-20' },
  { id: 2, name: 'Informe de alcance y metodología', status: 'aprobado', date: '2025-03-10' },
  { id: 3, name: 'Base de datos de actividades (Alcance 1 y 2)', status: 'revision_cliente', date: '2025-04-20' },
  { id: 4, name: 'Borrador Informe Preliminar', status: 'borrador', date: '2025-06-01' },
  { id: 5, name: 'Informe Final certificado', status: 'pendiente', date: '2025-07-31' },
];

const MOCK_RESULTS = {
  total: '142.5 tCO₂e',
  scope1: '45.2 tCO₂e',
  scope2: '38.1 tCO₂e',
  scope3: '59.2 tCO₂e',
  year: '2024',
};

const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
};

const getDotClass = (status) => {
  if (status === 'completado') return styles.dotCompleted;
  if (status === 'en_progreso') return styles.dotInProgress;
  return styles.dotPending;
};

const getStatusBadge = (status) => {
  const map = {
    aprobado: { label: 'Aprobado', cls: styles.badgeAprobado },
    revision_cliente: { label: 'En revisión', cls: styles.badgeRevision },
    borrador: { label: 'Borrador', cls: styles.badgeBorrador },
    pendiente: { label: 'Pendiente', cls: styles.badgePendiente },
  };
  const entry = map[status] || { label: status, cls: styles.badgePendiente };
  return <span className={`${styles.statusBadge} ${entry.cls}`}>{entry.label}</span>;
};

const ProgressCircle = ({ percent }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={styles.progressCircle}>
      <svg width="130" height="130" className={styles.progressSvg}>
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="#dfe1e6"
          strokeWidth="10"
        />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="#2d9c6e"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.progressNumber}>{percent}%</div>
      <div className={styles.progressLabel}>del proyecto completado</div>
    </div>
  );
};

const PortalClientePage = () => {
  const { projectId } = useParams();
  const [project] = useState(MOCK_PROJECT);
  const [milestones] = useState(MOCK_MILESTONES);
  const [deliverables] = useState(MOCK_DELIVERABLES);
  const [results] = useState(MOCK_RESULTS);

  const nextMilestone = milestones.find((m) => m.status !== 'completado');

  return (
    <div className={styles.page}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <span className={styles.logo}>SAGGIO ESG</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#5e6c84', fontWeight: 500 }}>{project.name}</span>
          <span className={styles.clientBadge}>Área privada del cliente</span>
        </div>
      </div>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroTitle}>Portal del Cliente</div>
        <div className={styles.heroProject}>{project.name}</div>
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.main}>
        {/* LEFT COLUMN */}
        <div>
          {/* Card: Información del proyecto */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <Icon name="info circle" style={{ color: '#2d9c6e' }} />
              Información del proyecto
            </div>
            <table className={styles.infoTable}>
              <tbody>
                <tr>
                  <td>Cliente</td>
                  <td>{project.client}</td>
                </tr>
                <tr>
                  <td>Servicio</td>
                  <td>{project.service}</td>
                </tr>
                <tr>
                  <td>Norma aplicada</td>
                  <td>{project.standard}</td>
                </tr>
                <tr>
                  <td>Consultor responsable</td>
                  <td>{project.manager} — {project.consultora}</td>
                </tr>
                <tr>
                  <td>Período</td>
                  <td>{formatDate(project.startDate)} – {formatDate(project.endDate)}</td>
                </tr>
                <tr>
                  <td>Estado</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles.badgeRevision}`}>{project.status}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Card: Hitos del proyecto */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <Icon name="flag" style={{ color: '#2d9c6e' }} />
              Hitos del proyecto
            </div>
            <div className={styles.timeline}>
              {milestones.map((milestone) => (
                <div key={milestone.id} className={styles.timelineItem}>
                  <span className={`${styles.timelineDot} ${getDotClass(milestone.status)}`} />
                  <div>
                    <div className={styles.timelineName}>{milestone.name}</div>
                    <div className={styles.timelineDate}>{formatDate(milestone.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Entregables */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <Icon name="file alternate outline" style={{ color: '#2d9c6e' }} />
              Entregables
            </div>
            <table className={styles.infoTable}>
              <thead>
                <tr>
                  <td style={{ color: '#6b808c', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre</td>
                  <td style={{ color: '#6b808c', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</td>
                  <td style={{ color: '#6b808c', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha</td>
                </tr>
              </thead>
              <tbody>
                {deliverables.map((d) => (
                  <tr key={d.id}>
                    <td style={{ color: '#172b4d', fontWeight: 500 }}>{d.name}</td>
                    <td>{getStatusBadge(d.status)}</td>
                    <td style={{ color: '#6b808c' }}>{formatDate(d.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Card: Progreso general */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <Icon name="chart pie" style={{ color: '#2d9c6e' }} />
              Progreso general
            </div>
            <ProgressCircle percent={project.progress} />
          </div>

          {/* Card: Resultados preliminares */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <Icon name="leaf" style={{ color: '#2d9c6e' }} />
              Resultados preliminares
            </div>
            <div style={{ fontSize: '11px', color: '#6b808c', marginBottom: '12px' }}>Año de reporte: {results.year}</div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>
                <span className={styles.resultDot} style={{ background: '#172b4d' }} />
                Total emisiones
              </span>
              <span className={styles.resultValue}>{results.total}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>
                <span className={styles.resultDot} style={{ background: '#e55722' }} />
                Alcance 1
              </span>
              <span className={styles.resultValue}>{results.scope1}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>
                <span className={styles.resultDot} style={{ background: '#f0a500' }} />
                Alcance 2
              </span>
              <span className={styles.resultValue}>{results.scope2}</span>
            </div>
            <div className={styles.resultRow} style={{ borderBottom: 'none' }}>
              <span className={styles.resultLabel}>
                <span className={styles.resultDot} style={{ background: '#2d9c6e' }} />
                Alcance 3
              </span>
              <span className={styles.resultValue}>{results.scope3}</span>
            </div>
          </div>

          {/* Card: Próximo hito */}
          {nextMilestone && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <Icon name="clock outline" style={{ color: '#0079bf' }} />
                Próximo hito
              </div>
              <div className={styles.nextMilestone}>
                <div className={styles.nextName}>{nextMilestone.name}</div>
                <div className={styles.nextDate}>{formatDate(nextMilestone.date)}</div>
                <div className={styles.nextCountdown}>Vence en 45 días</div>
              </div>
            </div>
          )}

          {/* Card: Preguntas */}
          <div className={`${styles.card} ${styles.contactCard}`}>
            <div className={styles.cardTitle} style={{ justifyContent: 'center' }}>
              <Icon name="question circle outline" style={{ color: '#2d9c6e' }} />
              ¿Preguntas?
            </div>
            <p style={{ fontSize: '13px', color: '#5e6c84', margin: '0 0 8px' }}>
              Contacta a tu consultor Saggio
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Icon name="mail outline" style={{ color: '#0079bf' }} />
              <span className={styles.contactEmail}>valentina.torres@saggio.co</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        Saggio ESG Consultores — Todos los derechos reservados 2025
      </div>
    </div>
  );
};

export default PortalClientePage;
