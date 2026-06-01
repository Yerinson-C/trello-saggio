/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { takeEvery } from 'redux-saga/effects';
import { LOCATION_CHANGE_HANDLE } from '../../../lib/redux-router';

import services from '../services';

export default function* routerWatchers() {
  yield takeEvery(LOCATION_CHANGE_HANDLE, () => services.handleLocationChange());
}
