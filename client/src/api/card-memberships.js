/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createCardMembership = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/card-memberships`, data, headers);

const deleteCardMembership = (cardId, userId, headers) =>
  socket.delete(`/cards/${cardId}/card-memberships/userId:${userId}`, undefined, headers);

export default {
  createCardMembership,
  deleteCardMembership,
};
