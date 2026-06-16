/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import Paths from '../../../constants/Paths';

import styles from './DashboardPage.module.scss';

/* ── Palette for avatars ─────────────────────────── */
const AVATAR_COLORS = [
  '#0079bf', '#61bd4f', '#eb5a46', '#f2d600',
  '#ff9f1a', '#c377e0', '#0052cc', '#00c2e0',
];

function avatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ── Status badge ────────────────────────────────── */
function derivedStatus(project) {
  if (project.status) return project.status;
  if (project.isHidden) return 'paused';
  if (project.endDate && new Date(project.endDate) < new Date()) return 'completed';
  return 'active';
}

const STATUS_META = {
  active:    { label: 'Activo',     cls: 'badgeActive' },
  at_risk:   { label: 'En riesgo',  cls: 'badgeAtRisk' },
  completed: { label: 'Completado', cls: 'badgeCompleted' },
  paused:    { label: 'Pausado',    cls: 'badgePaused' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.active;
  return (
    <span className={`${styles.badge} ${styles[meta.cls]}`}>
      <span className={styles.badgeDot} />
      {meta.label}
    </span>
  );
}

/* ── Date formatting ─────────────────────────────── */
function fmtDate(d) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}

function dueDateClass(dueDate) {
  if (!dueDate) return styles.upcomingDateOk;
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = (due - now) / 86400000;
  if (diffDays < 0)   return styles.upcomingDateOverdue;
  if (diffDays <= 7)  return styles.upcomingDateSoon;
  return styles.upcomingDateOk;
}

/* ── Main component ──────────────────────────────── */
const DashboardPage = React.memo(() => {
  const currentUser = useSelector(selectors.selectCurrentUser);
  const users       = useSelector(selectors.selectUsers);

  /* Collect all project IDs visible to current user */
  const projectIds  = useSelector(selectors.selectProjectIdsForCurrentUser);

  /* Build project list using per-id selector factory */
  const selectProjectById = useMemo(() => selectors.makeSelectProjectById(), []);

  /* We need all projects – iterate projectIds through redux state snapshot */
  const projects = useSelector((state) =>
    (projectIds || []).map((id) => selectProjectById(state, id)).filter(Boolean),
  );

  /* ── Derived stats ─────────────────────────────── */
  const stats = useMemo(() => {
    const statuses = projects.map(derivedStatus);
    const activeCount    = statuses.filter((s) => s === 'active').length;
    const atRiskCount    = statuses.filter((s) => s === 'at_risk').length;
    const now            = new Date();

    /* Unique clients: projects may have a `description` used as client name
       or a custom field; fall back to counting unique project names as proxy */
    const clientSet = new Set(
      projects
        .map((p) => p.client || p.organization || null)
        .filter(Boolean),
    );

    /* Overdue tasks: approximate from project endDates in the past */
    const overdueProjects = projects.filter((p) => {
      const end = p.endDate ? new Date(p.endDate) : null;
      return end && end < now && derivedStatus(p) !== 'completed';
    }).length;

    return {
      activeCount,
      atRiskCount,
      clientCount: clientSet.size,
      overdueProjects,
      total: projects.length,
    };
  }, [projects]);

  /* ── Upcoming items (next 5 by endDate) ─────────── */
  const upcomingItems = useMemo(() => {
    const now = new Date();
    return [...projects]
      .filter((p) => p.endDate)
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.name,
        project: p.client || p.organization || 'Proyecto',
        dueDate: p.endDate,
        overdue: new Date(p.endDate) < now,
      }));
  }, [projects]);

  /* ── Team: active users with project count ───────── */
  const teamMembers = useMemo(() => {
    const activeUsers = users.filter((u) => !u.isDeactivated);
    return activeUsers
      .map((u) => ({
        ...u,
        projectCount: projects.filter((p) =>
          p.ownerProjectManagerId === u.id || p.userId === u.id,
        ).length,
      }))
      .sort((a, b) => b.projectCount - a.projectCount)
      .slice(0, 8);
  }, [users, projects]);

  /* ── Today string ────────────────────────────────── */
  const todayStr = useMemo(
    () =>
      new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  );

  return (
    <div className={styles.wrapper}>
      {/* ── Page header ─────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link to={Paths.ROOT} className={styles.backLink}>
            <Icon name="arrow left" />
            Inicio
          </Link>
          <h1 className={styles.pageTitle}>
            <Icon name="chart bar" className={styles.pageTitleIcon} />
            Dashboard Ejecutivo
          </h1>
          <p className={styles.pageSubtitle}>
            Bienvenido, {currentUser ? currentUser.name : 'Usuario'} &mdash; {todayStr}
          </p>
        </div>
        <span className={styles.headerBadge}>
          {stats.total} proyecto{stats.total !== 1 ? 's' : ''} en total
        </span>
      </div>

      {/* ── Stats cards ─────────────────────────────── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrap} ${styles.statIconWrapBlue}`}>
            <Icon name="folder open" size="large" style={{ color: '#0079bf', margin: 0 }} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.activeCount}</span>
            <span className={styles.statLabel}>Proyectos activos</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconWrap} ${styles.statIconWrapRed}`}>
            <Icon name="warning sign" size="large" style={{ color: '#e74c3c', margin: 0 }} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.atRiskCount}</span>
            <span className={styles.statLabel}>En riesgo</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconWrap} ${styles.statIconWrapGreen}`}>
            <Icon name="building" size="large" style={{ color: '#27ae60', margin: 0 }} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.clientCount || stats.total}</span>
            <span className={styles.statLabel}>Clientes activos</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconWrap} ${styles.statIconWrapOrange}`}>
            <Icon name="clock" size="large" style={{ color: '#e67e22', margin: 0 }} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.overdueProjects}</span>
            <span className={styles.statLabel}>Con fecha vencida</span>
          </div>
        </div>
      </div>

      {/* ── Main grid: projects table + team ─────────── */}
      <div className={styles.mainGrid}>
        {/* Projects table */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Icon name="list" className={styles.panelTitleIcon} />
              Proyectos
            </h2>
            <span className={styles.panelCount}>{projects.length}</span>
          </div>
          <table className={styles.projectsTable}>
            <thead className={styles.projectsTableHead}>
              <tr>
                <th>Nombre / Cliente</th>
                <th>Tipo de servicio</th>
                <th>Estado</th>
                <th>Fechas</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyTableCell}>
                    <Icon name="folder outline" />
                    &nbsp;No hay proyectos disponibles
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const status = derivedStatus(project);
                  const startStr = fmtDate(project.startDate);
                  const endStr   = fmtDate(project.endDate);
                  return (
                    <tr key={project.id} className={styles.projectsTableRow}>
                      <td>
                        <div className={styles.projectName}>{project.name}</div>
                        {(project.client || project.organization) && (
                          <div className={styles.projectClient}>
                            {project.client || project.organization}
                          </div>
                        )}
                      </td>
                      <td>
                        {project.serviceType ? (
                          <span className={styles.serviceTag}>{project.serviceType}</span>
                        ) : (
                          <span style={{ color: '#aaa', fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={status} />
                      </td>
                      <td className={styles.dateRange}>
                        {startStr && endStr
                          ? `${startStr} — ${endStr}`
                          : startStr || endStr || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Team section */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Icon name="users" className={styles.panelTitleIcon} />
              Equipo
            </h2>
            <span className={styles.panelCount}>{teamMembers.length}</span>
          </div>
          {teamMembers.length === 0 ? (
            <div className={styles.emptyState}>No hay usuarios activos</div>
          ) : (
            <ul className={styles.teamList}>
              {teamMembers.map((u) => (
                <li key={u.id} className={styles.teamItem}>
                  <div
                    className={styles.teamAvatar}
                    style={{ backgroundColor: avatarColor(u.name) }}
                    title={u.name}
                  >
                    {initials(u.name)}
                  </div>
                  <div className={styles.teamInfo}>
                    <div className={styles.teamName}>{u.name}</div>
                    <div className={styles.teamEmail}>{u.email}</div>
                  </div>
                  <span className={styles.teamProjectCount} title="Proyectos">
                    {u.projectCount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Bottom grid: upcoming ────────────────────── */}
      <div className={styles.bottomGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Icon name="calendar alternate" className={styles.panelTitleIcon} />
              Proximos vencimientos
            </h2>
            <span className={styles.panelCount}>{upcomingItems.length}</span>
          </div>
          {upcomingItems.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="check circle outline" />
              &nbsp;Sin vencimientos proximos
            </div>
          ) : (
            <ul className={styles.upcomingList}>
              {upcomingItems.map((item) => (
                <li key={item.id} className={styles.upcomingItem}>
                  <div className={styles.upcomingIconWrap}>
                    <Icon
                      name={item.overdue ? 'exclamation' : 'clock outline'}
                      style={{ color: item.overdue ? '#c0392b' : '#0079bf', margin: 0 }}
                    />
                  </div>
                  <div className={styles.upcomingInfo}>
                    <div className={styles.upcomingTitle}>{item.title}</div>
                    <div className={styles.upcomingProject}>{item.project}</div>
                  </div>
                  <span className={`${styles.upcomingDate} ${dueDateClass(item.dueDate)}`}>
                    {fmtDate(item.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Summary panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Icon name="pie chart" className={styles.panelTitleIcon} />
              Resumen de estados
            </h2>
          </div>
          <div style={{ padding: '16px 18px' }}>
            {[
              { label: 'Activos',     count: stats.activeCount,   color: '#27ae60', bg: '#e6f4ea' },
              { label: 'En riesgo',   count: stats.atRiskCount,   color: '#e67e22', bg: '#fef3e2' },
              {
                label: 'Completados',
                count: projects.filter((p) => derivedStatus(p) === 'completed').length,
                color: '#0052cc',
                bg: '#e8f0fe',
              },
              {
                label: 'Pausados',
                count: projects.filter((p) => derivedStatus(p) === 'paused').length,
                color: '#5e6c84',
                bg: '#f0f0f0',
              },
            ].map((row) => {
              const pct = stats.total > 0 ? Math.round((row.count / stats.total) * 100) : 0;
              return (
                <div key={row.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#5e6c84', fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: 12, color: '#17394d', fontWeight: 700 }}>
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ background: '#f0f2f5', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: row.color,
                        borderRadius: 6,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <div style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid #f0f2f5',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#17394d' }}>{users.filter((u) => !u.isDeactivated).length}</div>
                <div style={{ fontSize: 11, color: '#6b808c' }}>Usuarios activos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#17394d' }}>{stats.total}</div>
                <div style={{ fontSize: 11, color: '#6b808c' }}>Total proyectos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DashboardPage;
