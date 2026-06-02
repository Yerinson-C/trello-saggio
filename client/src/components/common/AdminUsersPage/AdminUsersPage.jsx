/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button, Divider, Icon, Table, Label } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useField, usePopupInClosableContext, useEventCallback } from '../../../hooks';
import { UserRoles } from '../../../constants/Enums';
import { UserRoleIcons } from '../../../constants/Icons';
import Paths from '../../../constants/Paths';
import UserAvatar from '../../users/UserAvatar';
import ActionsStep from '../AdministrationModal/UsersPane/ActionsStep';
import { ClosableContext } from '../../../contexts';
import CreateUserModal from './CreateUserModal';

import styles from './AdminUsersPage.module.scss';

const AdminUsersPage = React.memo(() => {
  const activeUsersLimit = useSelector(selectors.selectActiveUsersLimit);
  const activeUsersTotal = useSelector(selectors.selectActiveUsersTotal);
  const users = useSelector(selectors.selectUsers);
  const currentUserId = useSelector(selectors.selectCurrentUserId);
  const currentUser = useSelector(selectors.selectCurrentUser);

  const canAdd = useSelector((state) => {
    const oidcBootstrap = selectors.selectOidcBootstrap(state);
    return !oidcBootstrap || !oidcBootstrap.isEnforced;
  });

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const [isDeactivatedVisible, setIsDeactivatedVisible] = useState(false);
  const [closableActive, setClosableActive] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        if (isDeactivatedVisible) {
          if (!user.isDeactivated) return false;
        } else if (user.isDeactivated) {
          return false;
        }
        if (!cleanSearch) return true;
        return (
          user.email.includes(cleanSearch) ||
          user.name.toLowerCase().includes(cleanSearch) ||
          (user.username && user.username.includes(cleanSearch)) ||
          (user.organization && user.organization.toLowerCase().includes(cleanSearch))
        );
      }),
    [users, isDeactivatedVisible, cleanSearch],
  );

  const handleToggleDeactivatedClick = useCallback(() => {
    setIsDeactivatedVisible((v) => !v);
  }, []);

  if (currentUser.role !== UserRoles.ADMIN) {
    return (
      <div className={styles.forbidden}>
        <Icon name="lock" size="huge" className={styles.forbiddenIcon} />
        <p>{t('common.noPermissionsError')}</p>
        <Link to={Paths.ROOT}>
          <Button primary>{t('action.backToHome', { defaultValue: 'Volver al inicio' })}</Button>
        </Link>
      </div>
    );
  }

  return (
    <ClosableContext.Provider value={[closableActive, () => setClosableActive(true), setClosableActive]}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link to={Paths.ROOT} className={styles.backLink}>
              <Icon name="arrow left" />
              {t('common.home', { defaultValue: 'Inicio' })}
            </Link>
            <h1 className={styles.title}>
              <Icon name="users" className={styles.titleIcon} />
              {t('common.userManagement', { defaultValue: 'Gestión de Usuarios' })}
            </h1>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.counter}>
              {activeUsersTotal}
              {activeUsersLimit !== null && `/${activeUsersLimit}`}
              {' '}{t('common.activeUsers', { defaultValue: 'usuarios activos' })}
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <Input
            fluid
            value={search}
            placeholder={t('common.searchUsers', { defaultValue: 'Buscar usuarios...' })}
            maxLength={256}
            icon="search"
            className={styles.searchInput}
            onChange={handleSearchChange}
          />
          <div className={styles.toolbarActions}>
            <Button
              basic
              size="small"
              onClick={handleToggleDeactivatedClick}
              className={styles.toggleBtn}
            >
              <Icon name={isDeactivatedVisible ? 'user' : 'user times'} />
              {isDeactivatedVisible
                ? t('action.showActive', { defaultValue: 'Ver activos' })
                : t('action.showDeactivated', { defaultValue: 'Ver desactivados' })}
            </Button>
            {canAdd && (
              <Button
                primary
                size="small"
                disabled={activeUsersLimit !== null && activeUsersTotal >= activeUsersLimit}
                onClick={() => setShowCreateModal(true)}
                className={styles.addBtn}
              >
                <Icon name="add user" />
                Crear Usuario
              </Button>
            )}
          </div>
        </div>

        <Divider />

        {/* Stats Cards */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <Icon name="users" size="large" className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{users.filter(u => !u.isDeactivated).length}</span>
              <span className={styles.statLabel}>{t('common.activeUsers', { defaultValue: 'Usuarios activos' })}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Icon name="user times" size="large" className={styles.statIcon} style={{ color: '#e74c3c' }} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{users.filter(u => u.isDeactivated).length}</span>
              <span className={styles.statLabel}>{t('common.deactivatedUsers', { defaultValue: 'Desactivados' })}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Icon name="shield" size="large" className={styles.statIcon} style={{ color: '#e67e22' }} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{users.filter(u => u.role === UserRoles.ADMIN).length}</span>
              <span className={styles.statLabel}>{t('common.admin', { defaultValue: 'Administradores' })}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Icon name="key" size="large" className={styles.statIcon} style={{ color: '#27ae60' }} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{users.filter(u => u.apiKeyPrefix).length}</span>
              <span className={styles.statLabel}>{t('common.withApiKey', { defaultValue: 'Con API key' })}</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className={styles.tableWrapper}>
          <Table unstackable selectable className={styles.table}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={4}>{t('common.user', { defaultValue: 'Usuario' })}</Table.HeaderCell>
                <Table.HeaderCell width={4}>{t('common.contact', { defaultValue: 'Contacto' })}</Table.HeaderCell>
                <Table.HeaderCell width={3}>{t('common.information', { defaultValue: 'Información' })}</Table.HeaderCell>
                <Table.HeaderCell width={2}>{t('common.role', { defaultValue: 'Rol' })}</Table.HeaderCell>
                <Table.HeaderCell width={2}>{t('common.status', { defaultValue: 'Estado' })}</Table.HeaderCell>
                <Table.HeaderCell width={1} textAlign="center">{t('common.actions', { defaultValue: 'Acciones' })}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredUsers.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" className={styles.emptyCell}>
                    <Icon name="search" />
                    {t('common.noUsersFound', { defaultValue: 'No se encontraron usuarios' })}
                  </Table.Cell>
                </Table.Row>
              ) : (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    id={user.id}
                    isCurrentUser={user.id === currentUserId}
                  />
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} />
      )}
    </ClosableContext.Provider>
  );
});

/* ── Sub-components ─────────────────────────────────────── */

const UserRow = React.memo(({ id, isCurrentUser }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);
  const user = useSelector((state) => selectUserById(state, id));
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [closableActive, setClosableActive] = useState(false);

  const handleActionsClose = useCallback(() => {
    if (user.apiKeyState?.value) {
      dispatch(entryActions.clearUserApiKeyValue(id));
    }
  }, [id, user.apiKeyState?.value, dispatch]);

  const ActionsPopup = usePopupInClosableContext(ActionsStep, { onClose: handleActionsClose });

  const roleColor = {
    [UserRoles.ADMIN]: 'red',
    [UserRoles.PROJECT_OWNER]: 'orange',
    [UserRoles.BOARD_USER]: 'blue',
  };

  const handleRoleChange = useCallback((e) => {
    const newRole = e.target.value;
    if (newRole !== user.role) {
      dispatch(entryActions.updateUser(id, { role: newRole }));
    }
  }, [id, user.role, dispatch]);

  return (
    <ClosableContext.Provider value={[closableActive, () => setClosableActive(true), setClosableActive]}>
      <Table.Row className={user.isDeactivated ? styles.deactivatedRow : ''}>
        <Table.Cell>
          <div className={styles.userCell}>
            <UserAvatar id={id} size="small" />
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              {isCurrentUser && (
                <span className={styles.currentUserBadge}>
                  <Icon name="check circle" />
                  {t('common.you', { defaultValue: 'Tú' })}
                </span>
              )}
            </div>
          </div>
        </Table.Cell>
        <Table.Cell>
          <div className={styles.contactCell}>
            <div className={styles.contactRow}>
              <Icon name="mail" size="small" className={styles.contactIcon} />
              <span>{user.email}</span>
            </div>
            {user.username && (
              <div className={styles.contactRow}>
                <Icon name="at" size="small" className={styles.contactIcon} />
                <span className={styles.username}>{user.username}</span>
              </div>
            )}
          </div>
        </Table.Cell>
        <Table.Cell>
          <div className={styles.infoCell}>
            {user.phone && (
              <div className={styles.infoRow}>
                <Icon name="phone" size="small" className={styles.infoIcon} />
                <span>{user.phone}</span>
              </div>
            )}
            {user.organization && (
              <div className={styles.infoRow}>
                <Icon name="building" size="small" className={styles.infoIcon} />
                <span>{user.organization}</span>
              </div>
            )}
            {user.apiKeyPrefix && (
              <div className={styles.infoRow}>
                <Icon name="key" size="small" className={styles.infoIcon} />
                <span className={styles.apiKey}>{user.apiKeyPrefix}_***</span>
              </div>
            )}
          </div>
        </Table.Cell>
        <Table.Cell>
          {isCurrentUser || user.isDeactivated ? (
            <Label size="tiny" color={roleColor[user.role] || 'grey'} className={styles.roleLabel}>
              <Icon name={UserRoleIcons[user.role]} />
              {t(`common.${user.role}`, { defaultValue: user.role })}
            </Label>
          ) : (
            <select
              className={styles.roleSelect}
              value={user.role}
              onChange={handleRoleChange}
              style={{ borderColor: roleColor[user.role] === 'red' ? '#e53e3e' : roleColor[user.role] === 'orange' ? '#dd6b20' : '#3182ce' }}
            >
              <option value={UserRoles.ADMIN}>👑 Administrador</option>
              <option value={UserRoles.PROJECT_OWNER}>🏢 Project Owner</option>
              <option value={UserRoles.BOARD_USER}>👤 Usuario</option>
            </select>
          )}
        </Table.Cell>
        <Table.Cell>
          {user.isDeactivated ? (
            <Label size="tiny" color="red" basic>
              <Icon name="ban" />
              {t('common.deactivated', { defaultValue: 'Desactivado' })}
            </Label>
          ) : (
            <Label size="tiny" color="green" basic>
              <Icon name="check" />
              {t('common.active', { defaultValue: 'Activo' })}
            </Label>
          )}
        </Table.Cell>
        <Table.Cell textAlign="center">
          <ActionsPopup userId={id}>
            <Button icon size="mini" className={styles.actionsBtn}>
              <Icon name="ellipsis vertical" />
            </Button>
          </ActionsPopup>
        </Table.Cell>
      </Table.Row>
    </ClosableContext.Provider>
  );
});

export default AdminUsersPage;
