/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const openModal = (type, params = {}) => ({
  type: ActionTypes.MODAL_OPEN,
  payload: {
    type,
    params,
  },
});

const closeModal = () => ({
  type: ActionTypes.MODAL_CLOSE,
  payload: {},
});

export default {
  openModal,
  closeModal,
};
