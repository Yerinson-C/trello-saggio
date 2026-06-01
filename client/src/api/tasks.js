/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createTask = (taskListId, data, headers) =>
  socket.post(`/task-lists/${taskListId}/tasks`, data, headers);

const updateTask = (id, data, headers) => socket.patch(`/tasks/${id}`, data, headers);

const deleteTask = (id, headers) => socket.delete(`/tasks/${id}`, undefined, headers);

export default {
  createTask,
  updateTask,
  deleteTask,
};
