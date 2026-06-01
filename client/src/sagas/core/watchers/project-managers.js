/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* projectManagersWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MANAGER_IN_CURRENT_PROJECT_CREATE, ({ payload: { data } }) =>
      services.createManagerInCurrentProject(data),
    ),
    takeEvery(
      EntryActionTypes.PROJECT_MANAGER_CREATE_HANDLE,
      ({ payload: { projectManager, users } }) =>
        services.handleProjectManagerCreate(projectManager, users),
    ),
    takeEvery(EntryActionTypes.PROJECT_MANAGER_DELETE, ({ payload: { id } }) =>
      services.deleteProjectManager(id),
    ),
    takeEvery(EntryActionTypes.PROJECT_MANAGER_DELETE_HANDLE, ({ payload: { projectManager } }) =>
      services.handleProjectManagerDelete(projectManager),
    ),
  ]);
}
