/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createLabel = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/labels`, data, headers);

const updateLabel = (id, data, headers) => socket.patch(`/labels/${id}`, data, headers);

const deleteLabel = (id, headers) => socket.delete(`/labels/${id}`, undefined, headers);

export default {
  createLabel,
  updateLabel,
  deleteLabel,
};
