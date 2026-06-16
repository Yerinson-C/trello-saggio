/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, Input, TextArea } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useForm, useNestedRef } from '../../../../hooks';
import { isModifierKeyPressed } from '../../../../utils/event-helpers';

import styles from './EditInformation.module.scss';

const EditInformation = React.memo(() => {
  const project = useSelector(selectors.selectCurrentProject);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      name: project.name,
      description: project.description,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    }),
    [project.name, project.description, project.startDate, project.endDate],
  );

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    ...defaultData,
    description: defaultData.description || '',
  }));

  const cleanData = useMemo(
    () => ({
      ...data,
      name: data.name.trim(),
      description: data.description.trim() || null,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
    }),
    [data],
  );

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const submit = useCallback(() => {
    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.updateCurrentProject(cleanData));
  }, [dispatch, cleanData, nameFieldRef]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleDescriptionKeyDown = useCallback(
    (event) => {
      if (isModifierKeyPressed(event) && event.key === 'Enter') {
        submit();
      }
    },
    [submit],
  );

  return (
    <Form onSubmit={handleSubmit}>
      <div className={styles.text}>{t('common.title')}</div>
      <Input
        fluid
        ref={handleNameFieldRef}
        name="name"
        value={data.name}
        maxLength={128}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <div className={styles.text}>{t('common.description')}</div>
      <TextArea
        as={TextareaAutosize}
        name="description"
        value={data.description}
        maxLength={1024}
        minRows={2}
        className={styles.field}
        onKeyDown={handleDescriptionKeyDown}
        onChange={handleFieldChange}
      />
      <div className={styles.dateRow}>
        <div className={styles.dateField}>
          <div className={styles.text}>Fecha de inicio</div>
          <input
            type="date"
            name="startDate"
            value={data.startDate}
            className={styles.dateInput}
            onChange={handleFieldChange}
          />
        </div>
        <div className={styles.dateField}>
          <div className={styles.text}>Fecha de fin</div>
          <input
            type="date"
            name="endDate"
            value={data.endDate}
            className={styles.dateInput}
            onChange={handleFieldChange}
          />
        </div>
      </div>
      <Button positive disabled={dequal(cleanData, defaultData)} content={t('action.save')} />
    </Form>
  );
});

export default EditInformation;
