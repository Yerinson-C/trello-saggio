/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Dropdown, Form, Header, Icon } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useClosableModal, useForm, useNestedRef } from '../../../hooks';
import { isModifierKeyPressed } from '../../../utils/event-helpers';
import { ProjectTypes } from '../../../constants/Enums';
import { ProjectTypeIcons } from '../../../constants/Icons';
import SelectTypeStep from './SelectTypeStep';

import styles from './AddProjectModal.module.scss';

const PROJECT_STATUS_OPTIONS = [
  { key: 'on_track', value: 'on_track', text: '🟢 En curso' },
  { key: 'at_risk', value: 'at_risk', text: '🟡 En riesgo' },
  { key: 'on_hold', value: 'on_hold', text: '🔴 Detenido' },
  { key: 'completed', value: 'completed', text: '✅ Completado' },
];

const AddProjectModal = React.memo(() => {
  const defaultType = useSelector(
    (state) => selectors.selectCurrentModal(state).params.defaultType,
  );

  const { data: defaultData, isSubmitting } = useSelector(selectors.selectProjectCreateForm);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm(() => ({
    name: '',
    description: '',
    type: ProjectTypes.PRIVATE,
    clientName: '',
    serviceType: '',
    serviceDescription: '',
    scope: '',
    objectives: '',
    projectStatus: 'on_track',
    ...defaultData,
    ...(defaultType && {
      type: defaultType,
    }),
  }));

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
      description: data.description.trim() || null,
      clientName: data.clientName.trim() || null,
      serviceType: data.serviceType.trim() || null,
      serviceDescription: data.serviceDescription.trim() || null,
      scope: data.scope.trim() || null,
      objectives: data.objectives.trim() || null,
    };

    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.createProject(cleanData));
  }, [dispatch, data, nameFieldRef]);

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleKeyDown = useCallback(
    (event) => {
      if (isModifierKeyPressed(event) && event.key === 'Enter') {
        submit();
      }
    },
    [submit],
  );

  const handleStatusChange = useCallback(
    (_e, { value }) => {
      setData((prev) => ({ ...prev, projectStatus: value }));
    },
    [setData],
  );

  const handleTypeSelect = useCallback(
    (type) => {
      setData((prevData) => ({
        ...prevData,
        type,
      }));
    },
    [setData],
  );

  const [ClosableModal, , activateClosable, deactivateClosable] = useClosableModal();

  const handleSelectTypeClose = useCallback(() => {
    deactivateClosable();
    nameFieldRef.current.focus();
  }, [deactivateClosable, nameFieldRef]);

  useEffect(() => {
    nameFieldRef.current.focus();
  }, [nameFieldRef]);

  const SelectTypePopup = usePopup(SelectTypeStep, {
    onOpen: activateClosable,
    onClose: handleSelectTypeClose,
  });

  return (
    <ClosableModal basic closeIcon size="small" onClose={handleClose}>
      <ClosableModal.Content>
        <Header inverted size="huge">
          {t('common.createProject', { context: 'title' })}
        </Header>
        <Form onSubmit={handleSubmit}>

          {/* Nombre */}
          <div className={styles.text}>{t('common.title')}</div>
          <Input
            fluid
            inverted
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={128}
            readOnly={isSubmitting}
            className={styles.field}
            onChange={handleFieldChange}
          />

          {/* Cliente */}
          <div className={styles.text}>Cliente</div>
          <Input
            fluid
            inverted
            name="clientName"
            value={data.clientName}
            maxLength={256}
            placeholder="Nombre del cliente"
            readOnly={isSubmitting}
            className={styles.field}
            onChange={handleFieldChange}
          />

          {/* Servicio */}
          <div className={styles.text}>Tipo de servicio</div>
          <Input
            fluid
            inverted
            name="serviceType"
            value={data.serviceType}
            maxLength={256}
            placeholder="Ej: Consultoría, Desarrollo, Auditoría..."
            readOnly={isSubmitting}
            className={styles.field}
            onChange={handleFieldChange}
          />

          {/* Descripción del servicio */}
          <div className={styles.text}>Descripción del servicio</div>
          <TextareaAutosize
            name="serviceDescription"
            value={data.serviceDescription}
            maxLength={2048}
            minRows={2}
            placeholder="Describe el servicio que se prestará..."
            className={styles.textarea}
            onKeyDown={handleKeyDown}
            onChange={handleFieldChange}
          />

          {/* Alcance */}
          <div className={styles.text}>Alcance del proyecto</div>
          <TextareaAutosize
            name="scope"
            value={data.scope}
            maxLength={4096}
            minRows={2}
            placeholder="¿Qué incluye y qué no incluye este proyecto?"
            className={styles.textarea}
            onKeyDown={handleKeyDown}
            onChange={handleFieldChange}
          />

          {/* Objetivos */}
          <div className={styles.text}>Objetivos</div>
          <TextareaAutosize
            name="objectives"
            value={data.objectives}
            maxLength={4096}
            minRows={2}
            placeholder="¿Cuáles son los objetivos principales?"
            className={styles.textarea}
            onKeyDown={handleKeyDown}
            onChange={handleFieldChange}
          />

          {/* Descripción general */}
          <div className={styles.text}>{t('common.description')}</div>
          <TextareaAutosize
            name="description"
            value={data.description}
            maxLength={1024}
            minRows={2}
            className={styles.textarea}
            onKeyDown={handleKeyDown}
            onChange={handleFieldChange}
          />

          {/* Estado del proyecto */}
          <div className={styles.text}>Estado del proyecto</div>
          <Dropdown
            fluid
            selection
            options={PROJECT_STATUS_OPTIONS}
            value={data.projectStatus}
            className={styles.field}
            onChange={handleStatusChange}
          />

          <div className={styles.actions}>
            <Button
              inverted
              color="green"
              icon="checkmark"
              content={t('action.createProject')}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
            <SelectTypePopup value={data.type} onSelect={handleTypeSelect}>
              <Button type="button" className={styles.selectTypeButton}>
                <Icon name={ProjectTypeIcons[data.type]} className={styles.selectTypeButtonIcon} />
                {t(`common.${data.type}`)}
              </Button>
            </SelectTypePopup>
          </div>
        </Form>
      </ClosableModal.Content>
    </ClosableModal>
  );
});

export default AddProjectModal;
