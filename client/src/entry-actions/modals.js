/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';
import ModalTypes from '../constants/ModalTypes';

const openAdministrationModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.ADMINISTRATION,
  },
});

const openAboutModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.ABOUT,
  },
});

const openUserSettingsModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.USER_SETTINGS,
  },
});

const openAddProjectModal = (defaultProjectType) => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.ADD_PROJECT,
    params: {
      defaultType: defaultProjectType,
    },
  },
});

const openProjectSettingsModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.PROJECT_SETTINGS,
  },
});

const openBoardSettingsModal = (boardId) => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.BOARD_SETTINGS,
    params: {
      id: boardId,
    },
  },
});

const openBoardActivitiesModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.BOARD_ACTIVITIES,
  },
});

const openProjectInboxModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.PROJECT_INBOX,
  },
});

const openTimeEntriesModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.TIME_ENTRIES,
  },
});

const openDeliverablesModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.DELIVERABLES,
  },
});

const openEnvironmentalDataModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.ENVIRONMENTAL_DATA,
  },
});

const openReportGeneratorModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: { type: ModalTypes.REPORT_GENERATOR },
});

const closeModal = () => ({
  type: EntryActionTypes.MODAL_CLOSE,
  payload: {},
});

export default {
  openAdministrationModal,
  openAboutModal,
  openUserSettingsModal,
  openAddProjectModal,
  openProjectSettingsModal,
  openBoardSettingsModal,
  openBoardActivitiesModal,
  openProjectInboxModal,
  openTimeEntriesModal,
  openDeliverablesModal,
  openEnvironmentalDataModal,
  openReportGeneratorModal,
  closeModal,
};
