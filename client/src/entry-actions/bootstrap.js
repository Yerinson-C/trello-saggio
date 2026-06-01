/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const handleBootstrapUpdate = (bootstrap) => ({
  type: EntryActionTypes.BOOTSTRAP_UPDATE_HANDLE,
  payload: {
    bootstrap,
  },
});

export default {
  handleBootstrapUpdate,
};
