/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import isEmail from 'validator/lib/isEmail';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { usePrevious } from '../../../lib/hooks';
import { Button, Form, Icon, Modal, Message } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { UserRoles } from '../../../constants/Enums';
import { isPassword, getPasswordError, isUsername } from '../../../utils/validator';

import styles from './CreateUserModal.module.scss';

const ROLES = [
  {
    value: UserRoles.ADMIN,
    icon: 'user secret',
    label: 'Administrador',
    description: 'Control total del sistema. Puede gestionar usuarios, proyectos y configuraciones.',
    color: '#e53e3e',
  },
  {
    value: UserRoles.PROJECT_OWNER,
    icon: 'building',
    label: 'Project Owner',
    description: 'Puede crear y gestionar sus propios proyectos e invitar miembros.',
    color: '#dd6b20',
  },
  {
    value: UserRoles.BOARD_USER,
    icon: 'columns',
    label: 'Usuario de Tablero',
    description: 'Puede ser invitado a trabajar en tableros de proyectos.',
    color: '#3182ce',
  },
];

const CreateUserModal = React.memo(({ onClose }) => {
  const { data: defaultData, isSubmitting, error } = useSelector(selectors.selectUserCreateForm);
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const wasSubmitting = usePrevious(isSubmitting);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    username: '',
    role: UserRoles.BOARD_USER,
    ...defaultData,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (wasSubmitting && !isSubmitting) {
      if (error) {
        if (error.message === 'Email already in use') {
          setApiError('Este correo ya está registrado');
        } else if (error.message === 'Username already in use') {
          setApiError('Este nombre de usuario ya está en uso');
        } else {
          setApiError('Error al crear el usuario. Verifica los datos.');
        }
      } else {
        onClose();
      }
    }
  }, [isSubmitting, wasSubmitting, error, onClose]);

  const handleChange = useCallback((field) => (e, { value } = {}) => {
    const val = value !== undefined ? value : (e?.target?.value ?? e);
    setForm((prev) => ({ ...prev, [field]: val }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setApiError(null);
  }, []);

  const handleRoleSelect = useCallback((role) => {
    setForm((prev) => ({ ...prev, role }));
  }, []);

  const errors = useMemo(() => {
    const e = {};
    if (touched.name && !form.name.trim()) e.name = 'El nombre es obligatorio';
    if (touched.email) {
      if (!isEmail(form.email.trim())) e.email = 'Correo electrónico inválido';
      else if (!form.email.trim().endsWith('@saggioesg.com')) e.email = 'Solo se permiten correos @saggioesg.com';
    }
    if (touched.password) {
      const passErr = getPasswordError(form.password);
      if (passErr) e.password = passErr;
    }
    if (touched.username && form.username && !isUsername(form.username)) {
      e.username = 'Username: 3-32 caracteres, solo letras, números, _ o .';
    }
    return e;
  }, [form, touched]);

  const isFormValid = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!isEmail(form.email.trim())) return false;
    if (!form.email.trim().endsWith('@saggioesg.com')) return false;
    if (!isPassword(form.password)) return false;
    if (form.username && !isUsername(form.username)) return false;
    return true;
  }, [form]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, username: true });
    if (!isFormValid) return;

    dispatch(entryActions.createUser({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      username: form.username.trim() || null,
      role: form.role,
    }));
  }, [dispatch, form, isFormValid]);

  return (
    <Modal open closeIcon size="small" onClose={onClose} className={styles.modal}>
      <Modal.Header className={styles.header}>
        <Icon name="add user" className={styles.headerIcon} />
        Crear Nuevo Usuario
      </Modal.Header>

      <Modal.Content className={styles.content}>
        {apiError && (
          <Message negative onDismiss={() => setApiError(null)}>
            <Icon name="warning circle" />
            {apiError}
          </Message>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Name */}
          <Form.Field error={!!errors.name}>
            <label className={styles.label}>
              <Icon name="user" size="small" />
              Nombre completo <span className={styles.required}>*</span>
            </label>
            <input
              placeholder="Ej: Juan García"
              value={form.name}
              maxLength={128}
              autoFocus
              onChange={handleChange('name')}
            />
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </Form.Field>

          {/* Email */}
          <Form.Field error={!!errors.email}>
            <label className={styles.label}>
              <Icon name="mail" size="small" />
              Correo electrónico <span className={styles.required}>*</span>
              <span className={styles.hint}>@saggioesg.com</span>
            </label>
            <input
              type="email"
              placeholder="usuario@saggioesg.com"
              value={form.email}
              maxLength={256}
              onChange={handleChange('email')}
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </Form.Field>

          {/* Password */}
          <Form.Field error={!!errors.password}>
            <label className={styles.label}>
              <Icon name="lock" size="small" />
              Contraseña <span className={styles.required}>*</span>
              <span className={styles.hint}>mín. 8 caracteres, 1 mayúscula</span>
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña segura"
                value={form.password}
                maxLength={256}
                onChange={handleChange('password')}
              />
              <button
                type="button"
                className={styles.showPassBtn}
                onClick={() => setShowPassword((v) => !v)}
              >
                <Icon name={showPassword ? 'eye slash' : 'eye'} />
              </button>
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            {/* Strength bar */}
            {form.password && (
              <div className={styles.strengthBar}>
                <div
                  className={styles.strengthFill}
                  style={{
                    width: `${Math.min(100, (form.password.length / 16) * 100)}%`,
                    backgroundColor:
                      form.password.length < 8 ? '#e53e3e'
                      : !isPassword(form.password) ? '#dd6b20'
                      : form.password.length >= 12 ? '#38a169'
                      : '#d69e2e',
                  }}
                />
              </div>
            )}
          </Form.Field>

          {/* Username */}
          <Form.Field error={!!errors.username}>
            <label className={styles.label}>
              <Icon name="at" size="small" />
              Nombre de usuario
              <span className={styles.hint}>opcional</span>
            </label>
            <input
              placeholder="ej: juan_garcia"
              value={form.username}
              maxLength={32}
              onChange={handleChange('username')}
            />
            {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
          </Form.Field>

          {/* Role selection */}
          <div className={styles.roleSection}>
            <label className={styles.label}>
              <Icon name="shield alternate" size="small" />
              Rol del usuario <span className={styles.required}>*</span>
            </label>
            <div className={styles.roleCards}>
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={`${styles.roleCard} ${form.role === role.value ? styles.roleCardActive : ''}`}
                  style={form.role === role.value ? { borderColor: role.color, backgroundColor: `${role.color}10` } : {}}
                  onClick={() => handleRoleSelect(role.value)}
                >
                  <div className={styles.roleCardHeader}>
                    <Icon name={role.icon} style={{ color: role.color }} />
                    <span className={styles.roleCardLabel} style={{ color: form.role === role.value ? role.color : undefined }}>
                      {role.label}
                    </span>
                    {form.role === role.value && (
                      <Icon name="check circle" className={styles.roleCheck} style={{ color: role.color }} />
                    )}
                  </div>
                  <p className={styles.roleCardDesc}>{role.description}</p>
                </button>
              ))}
            </div>
          </div>
        </Form>
      </Modal.Content>

      <Modal.Actions className={styles.actions}>
        <Button basic onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          primary
          loading={isSubmitting}
          disabled={isSubmitting || !isFormValid}
          onClick={handleSubmit}
        >
          <Icon name="add user" />
          Crear Usuario
        </Button>
      </Modal.Actions>
    </Modal>
  );
});

CreateUserModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default CreateUserModal;
