/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { Button, Divider, Icon, Label, Modal, Form, Table, Input } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Paths from '../../../constants/Paths';
import UserAvatar from '../../users/UserAvatar';

import styles from './ProjectsPage.module.scss';

/* ── Create Modal ─────────────────────────────────────── */
const CreateProjectModal = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch(entryActions.createProject({ name: name.trim() }));
    onClose();
  }, [name, dispatch, onClose]);

  return (
    <Modal open size="tiny" closeIcon onClose={onClose}>
      <Modal.Header className={styles.modalHeader}>
        <Icon name="folder open" className={styles.modalIcon} />Crear Proyecto
      </Modal.Header>
      <Modal.Content>
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <label>Nombre del proyecto *</label>
            <input autoFocus placeholder="Ej: App Mobile" value={name}
              onChange={e => setName(e.target.value)} maxLength={128} />
          </Form.Field>
          <div className={styles.formActions}>
            <Button basic type="button" onClick={onClose}>Cancelar</Button>
            <Button primary disabled={!name.trim()}>
              <Icon name="plus" />Crear
            </Button>
          </div>
        </Form>
      </Modal.Content>
    </Modal>
  );
});

/* ── Edit Modal ───────────────────────────────────────── */
const EditProjectModal = React.memo(({ project, onClose }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState(project.name || '');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch(entryActions.updateProject(project.id, { name: name.trim() }));
    onClose();
  }, [name, project, dispatch, onClose]);

  return (
    <Modal open size="tiny" closeIcon onClose={onClose}>
      <Modal.Header className={styles.modalHeader}>
        <Icon name="pencil" className={styles.modalIcon} />Editar Proyecto
      </Modal.Header>
      <Modal.Content>
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <label>Nombre *</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} maxLength={128} />
          </Form.Field>
          <div className={styles.formActions}>
            <Button basic type="button" onClick={onClose}>Cancelar</Button>
            <Button primary disabled={!name.trim()}>
              <Icon name="save" />Guardar
            </Button>
          </div>
        </Form>
      </Modal.Content>
    </Modal>
  );
});

/* ── Delete Confirm ───────────────────────────────────── */
const ConfirmDeleteModal = React.memo(({ project, onConfirm, onClose }) => (
  <Modal open size="mini" closeIcon onClose={onClose}>
    <Modal.Header><Icon name="warning sign" color="red" />Eliminar Proyecto</Modal.Header>
    <Modal.Content>
      <p>¿Eliminar <strong>"{project.name}"</strong>?</p>
      <p className={styles.deleteWarning}>
        Se eliminarán todos los tableros, listas y tarjetas. Esta acción no se puede deshacer.
      </p>
    </Modal.Content>
    <Modal.Actions>
      <Button basic onClick={onClose}>Cancelar</Button>
      <Button negative onClick={onConfirm}><Icon name="trash" />Eliminar</Button>
    </Modal.Actions>
  </Modal>
));

/* ── Members/Managers Modal ───────────────────────────── */
const ManagersModal = React.memo(({ project, onClose }) => {
  const dispatch = useDispatch();
  const currentUserId = useSelector(selectors.selectCurrentUserId);
  const allUsers = useSelector(selectors.selectUsers);
  const [search, setSearch] = useState('');

  const { projectManagers } = useSelector(state => {
    const pms = [];
    try {
      const { orm } = state;
      if (orm && orm.ProjectManager) {
        Object.values(orm.ProjectManager.itemsById || {}).forEach(pm => {
          if (pm.projectId === project.id) pms.push(pm);
        });
      }
    } catch (e) { /* ignore */ }
    return { projectManagers: pms };
  });

  const managerIds = useMemo(() => new Set(projectManagers.map(pm => pm.userId)), [projectManagers]);

  const availableUsers = useMemo(() =>
    allUsers.filter(u => !u.isDeactivated && !managerIds.has(u.id) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
       u.email.toLowerCase().includes(search.toLowerCase()))).slice(0, 6),
    [allUsers, managerIds, search],
  );

  const managerUsers = useMemo(() =>
    projectManagers.map(pm => ({ pm, user: allUsers.find(u => u.id === pm.userId) }))
      .filter(x => x.user),
    [projectManagers, allUsers],
  );

  const handleRemove = useCallback((pmId) => {
    dispatch(entryActions.deleteProjectManager(pmId));
  }, [dispatch]);

  return (
    <Modal open size="small" closeIcon onClose={onClose}>
      <Modal.Header className={styles.modalHeader}>
        <Icon name="users" className={styles.modalIcon} />Managers — {project.name}
      </Modal.Header>
      <Modal.Content>
        <p className={styles.sectionLabel}>MANAGERS ACTUALES</p>
        {managerUsers.length === 0
          ? <p className={styles.emptyNote}>Sin managers asignados</p>
          : (
            <div className={styles.memberList}>
              {managerUsers.map(({ pm, user }) => (
                <div key={pm.id} className={styles.memberRow}>
                  <UserAvatar id={user.id} size="tiny" />
                  <div className={styles.memberMeta}>
                    <span className={styles.memberName}>{user.name}</span>
                    <span className={styles.memberEmail}>{user.email}</span>
                  </div>
                  {user.id !== currentUserId && (
                    <Button icon="minus" size="mini" negative basic
                      onClick={() => handleRemove(pm.id)} />
                  )}
                </div>
              ))}
            </div>
          )
        }
        <Divider />
        <p className={styles.sectionLabel}>AGREGAR MANAGER</p>
        <Input fluid placeholder="Buscar usuario..." icon="search" value={search}
          onChange={e => setSearch(e.target.value)} className={styles.searchInput} />
        <div className={styles.memberList}>
          {availableUsers.map(u => (
            <div key={u.id} className={styles.memberRow}>
              <UserAvatar id={u.id} size="tiny" />
              <div className={styles.memberMeta}>
                <span className={styles.memberName}>{u.name}</span>
                <span className={styles.memberEmail}>{u.email}</span>
              </div>
              <Button icon="plus" size="mini" positive basic
                onClick={() => dispatch(entryActions.createManagerInCurrentProject({ userId: u.id }))} />
            </div>
          ))}
          {!availableUsers.length && search && <p className={styles.emptyNote}>Sin resultados</p>}
        </div>
      </Modal.Content>
    </Modal>
  );
});

/* ── Project Row ──────────────────────────────────────── */
const ProjectRow = React.memo(({ id, onEdit, onDelete, onMembers }) => {
  const selectProjectById = useMemo(() => selectors.makeSelectProjectById(), []);
  const project = useSelector(state => selectProjectById(state, id));

  if (!project) return null;

  return (
    <Table.Row>
      <Table.Cell>
        <div className={styles.projectCell}>
          <div className={styles.projectBullet}
            style={{ background: project.backgroundType ? '#3182ce' : '#a0aec0' }}
          />
          <Link to={Paths.PROJECTS.replace(':id', id)} className={styles.projectName}>
            {project.name}
          </Link>
        </div>
      </Table.Cell>
      <Table.Cell>
        {project.backgroundType
          ? <Label size="tiny" color="blue">{project.backgroundType === 'image' ? 'Imagen' : 'Gradiente'}</Label>
          : <span style={{ color: '#aaa' }}>—</span>}
      </Table.Cell>
      <Table.Cell>
        <Label size="tiny" color="grey" basic>{project.notificationsCount ?? '—'}</Label>
      </Table.Cell>
      <Table.Cell>
        <div className={styles.rowActions}>
          <Button icon="pencil" size="mini" basic title="Editar" onClick={() => onEdit(project)} />
          <Button icon="users" size="mini" basic title="Managers" onClick={() => onMembers(project)} />
          <Link to={Paths.PROJECTS.replace(':id', id)}>
            <Button icon="arrow right" size="mini" primary basic as="span" />
          </Link>
          <Button icon="trash alternate outline" size="mini" basic negative
            title="Eliminar" onClick={() => onDelete(project)} />
        </div>
      </Table.Cell>
    </Table.Row>
  );
});

/* ── Main Page ────────────────────────────────────────── */
const ProjectsPage = React.memo(() => {
  const projectIds = useSelector(selectors.selectFilteredProjectIdsForCurrentUser);
  const dispatch = useDispatch();

  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [membersProject, setMembersProject] = useState(null);

  const handleDelete = useCallback(() => {
    if (!deleteProject) return;
    dispatch(entryActions.deleteProject(deleteProject.id));
    setDeleteProject(null);
  }, [deleteProject, dispatch]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <Link to={Paths.ROOT} className={styles.backLink}>
            <Icon name="arrow left" />Inicio
          </Link>
          <h1 className={styles.title}>
            <Icon name="folder" className={styles.titleIcon} />
            Módulo de Proyectos
          </h1>
        </div>
        <Button primary onClick={() => setShowCreate(true)}>
          <Icon name="plus" />Nuevo Proyecto
        </Button>
      </div>

      <Divider />

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <Icon name="folder" size="large" style={{ color: '#3182ce' }} />
          <div>
            <div className={styles.statValue}>{projectIds.length}</div>
            <div className={styles.statLabel}>Proyectos accesibles</div>
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <Table unstackable selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Proyecto</Table.HeaderCell>
              <Table.HeaderCell>Fondo</Table.HeaderCell>
              <Table.HeaderCell>Notif.</Table.HeaderCell>
              <Table.HeaderCell>Acciones</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projectIds.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4} textAlign="center" className={styles.emptyCell}>
                  <Icon name="folder open" />
                  No tienes proyectos. Crea uno con el botón de arriba.
                </Table.Cell>
              </Table.Row>
            ) : (
              projectIds.map(id => (
                <ProjectRow key={id} id={id}
                  onEdit={setEditProject}
                  onDelete={setDeleteProject}
                  onMembers={setMembersProject}
                />
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
      {editProject && <EditProjectModal project={editProject} onClose={() => setEditProject(null)} />}
      {deleteProject && (
        <ConfirmDeleteModal project={deleteProject}
          onConfirm={handleDelete} onClose={() => setDeleteProject(null)} />
      )}
      {membersProject && (
        <ManagersModal project={membersProject} onClose={() => setMembersProject(null)} />
      )}
    </div>
  );
});

export default ProjectsPage;
