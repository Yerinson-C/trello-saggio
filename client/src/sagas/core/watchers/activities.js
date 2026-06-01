/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* activitiesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.ACTIVITIES_IN_CURRENT_BOARD_FETCH, () =>
      services.fetchActivitiesInCurrentBoard(),
    ),
    takeEvery(EntryActionTypes.ACTIVITIES_IN_CURRENT_CARD_FETCH, () =>
      services.fetchActivitiesInCurrentCard(),
    ),
    takeEvery(EntryActionTypes.ACTIVITY_CREATE_HANDLE, ({ payload: { activity } }) =>
      services.handleActivityCreate(activity),
    ),
  ]);
}
