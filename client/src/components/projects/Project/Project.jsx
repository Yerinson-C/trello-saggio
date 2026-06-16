/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import ModalTypes from '../../../constants/ModalTypes';
import ProjectSettingsModal from '../ProjectSettingsModal';
import ProjectInboxModal from '../ProjectInboxModal/ProjectInboxModal';
import TimeEntriesModal from '../TimeEntriesModal/TimeEntriesModal';
import DeliverablesModal from '../DeliverablesModal/DeliverablesModal';
import EnvironmentalDataModal from '../EnvironmentalDataModal/EnvironmentalDataModal';
import ReportGeneratorModal from '../ReportGeneratorModal/ReportGeneratorModal';
import Boards from '../../boards/Boards';
import BoardSettingsModal from '../../boards/BoardSettingsModal';

import styles from './Project.module.scss';

const Project = React.memo(() => {
  const dispatch = useDispatch();
  const modal    = useSelector(selectors.selectCurrentModal);

  const handleOpenTimeEntries     = useCallback(() => dispatch(entryActions.openTimeEntriesModal()),     [dispatch]);
  const handleOpenDeliverables    = useCallback(() => dispatch(entryActions.openDeliverablesModal()),    [dispatch]);
  const handleOpenEnvironmental   = useCallback(() => dispatch(entryActions.openEnvironmentalDataModal()), [dispatch]);
  const handleOpenReportGenerator = useCallback(() => dispatch(entryActions.openReportGeneratorModal()), [dispatch]);

  let modalNode = null;
  if (modal) {
    switch (modal.type) {
      case ModalTypes.PROJECT_SETTINGS:
        modalNode = <ProjectSettingsModal />;
        break;
      case ModalTypes.BOARD_SETTINGS:
        modalNode = <BoardSettingsModal />;
        break;
      case ModalTypes.PROJECT_INBOX:
        modalNode = <ProjectInboxModal />;
        break;
      case ModalTypes.TIME_ENTRIES:
        modalNode = <TimeEntriesModal />;
        break;
      case ModalTypes.DELIVERABLES:
        modalNode = <DeliverablesModal />;
        break;
      case ModalTypes.ENVIRONMENTAL_DATA:
        modalNode = <EnvironmentalDataModal />;
        break;
      case ModalTypes.REPORT_GENERATOR:
        modalNode = <ReportGeneratorModal onClose={() => dispatch(entryActions.closeModal())} />;
        break;
      default:
    }
  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.projectActions}>
          <Button
            size="small"
            className={styles.actionBtn}
            onClick={handleOpenTimeEntries}
            title="Horas"
          >
            <Icon name="clock outline" />
            Horas
          </Button>
          <Button
            size="small"
            className={styles.actionBtn}
            onClick={handleOpenDeliverables}
            title="Entregables"
          >
            <Icon name="tasks" />
            Entregables
          </Button>
          <Button
            size="small"
            className={styles.actionBtn}
            onClick={handleOpenEnvironmental}
            title="Datos Ambientales"
          >
            <Icon name="leaf" />
            Datos Ambientales
          </Button>
          <Button
            size="small"
            className={styles.actionBtn}
            onClick={handleOpenReportGenerator}
            title="Generar Informe"
          >
            <Icon name="file pdf outline" />
            Informe
          </Button>
        </div>
        <Boards />
      </div>
      {modalNode}
    </>
  );
});

export default Project;
