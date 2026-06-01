/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { put } from 'redux-saga/effects';

import actions from '../../../actions';

export function* handleBootstrapUpdate(bootstrap) {
  yield put(actions.handleBootstrapUpdate(bootstrap));
}

export default {
  handleBootstrapUpdate,
};
