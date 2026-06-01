/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* bootstrapWatchers() {
  yield all([
    takeEvery(EntryActionTypes.BOOTSTRAP_UPDATE_HANDLE, ({ payload: { bootstrap } }) =>
      services.handleBootstrapUpdate(bootstrap),
    ),
  ]);
}
