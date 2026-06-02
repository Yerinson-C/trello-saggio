/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useSteps } from '../../../../hooks';
import ConfirmationStep from '../../../common/ConfirmationStep';

import styles from './ActionsStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
  DUE_DATE: 'DUE_DATE',
};

const ActionsStep = React.memo(({ taskId, onNameEdit, onClose }) => {
  const selectTaskById = useMemo(() => selectors.makeSelectTaskById(), []);

  const task = useSelector((state) => selectTaskById(state, taskId));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const [dueDateInput, setDueDateInput] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
  );

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteTask(taskId));
  }, [taskId, dispatch]);

  const handleEditNameClick = useCallback(() => {
    onNameEdit();
    onClose();
  }, [onNameEdit, onClose]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  const handleDueDateClick = useCallback(() => {
    openStep(StepTypes.DUE_DATE);
  }, [openStep]);

  const handleDueDateSave = useCallback(() => {
    dispatch(
      entryActions.updateTask(taskId, {
        dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : null,
      }),
    );
    onClose();
  }, [taskId, dueDateInput, dispatch, onClose]);

  const handleDueDateRemove = useCallback(() => {
    dispatch(entryActions.updateTask(taskId, { dueDate: null }));
    onClose();
  }, [taskId, dispatch, onClose]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <ConfirmationStep
        title="common.deleteTask"
        content="common.areYouSureYouWantToDeleteThisTask"
        buttonContent="action.deleteTask"
        onConfirm={handleDeleteConfirm}
        onBack={handleBack}
      />
    );
  }

  if (step && step.type === StepTypes.DUE_DATE) {
    return (
      <>
        <Popup.Header onBack={handleBack}>
          {t('common.dueDate', { context: 'title', defaultValue: 'Fecha de vencimiento' })}
        </Popup.Header>
        <Popup.Content>
          <div className={styles.dueDateForm}>
            <input
              type="date"
              className={styles.dueDateInput}
              value={dueDateInput}
              onChange={(e) => setDueDateInput(e.target.value)}
            />
            <div className={styles.dueDateActions}>
              <button type="button" className={styles.dueDateSave} onClick={handleDueDateSave}>
                {t('action.save', { defaultValue: 'Guardar' })}
              </button>
              {task.dueDate && (
                <button type="button" className={styles.dueDateRemove} onClick={handleDueDateRemove}>
                  {t('action.remove', { defaultValue: 'Eliminar' })}
                </button>
              )}
            </div>
          </div>
        </Popup.Content>
      </>
    );
  }

  return (
    <>
      <Popup.Header>
        {t('common.taskActions', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          {!task.linkedCardId && (
            <Menu.Item className={styles.menuItem} onClick={handleEditNameClick}>
              <Icon name="align left" className={styles.menuItemIcon} />
              {t('action.editDescription', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          <Menu.Item className={styles.menuItem} onClick={handleDueDateClick}>
            <Icon name="calendar outline" className={styles.menuItemIcon} />
            {t('action.dueDate', { defaultValue: 'Fecha de vencimiento' })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
            <Icon name="trash alternate outline" className={styles.menuItemIcon} />
            {t('action.deleteTask', {
              context: 'title',
            })}
          </Menu.Item>
        </Menu>
      </Popup.Content>
    </>
  );
});

ActionsStep.propTypes = {
  taskId: PropTypes.string.isRequired,
  onNameEdit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ActionsStep;
