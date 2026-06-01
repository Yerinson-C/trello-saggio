/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const handleSocketDisconnect = () => ({
  type: EntryActionTypes.SOCKET_DISCONNECT_HANDLE,
  payload: {},
});

const handleSocketReconnect = () => ({
  type: EntryActionTypes.SOCKET_RECONNECT_HANDLE,
  payload: {},
});

export default {
  handleSocketDisconnect,
  handleSocketReconnect,
};
