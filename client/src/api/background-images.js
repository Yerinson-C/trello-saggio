/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import http from './http';
import socket from './socket';

/* Actions */

const createBackgroundImage = (projectId, { file, ...data }, requestId, headers) =>
  http.post(
    `/projects/${projectId}/background-images?requestId=${requestId}`,
    {
      ...data,
      file,
    },
    headers,
  );

const deleteBackgroundImage = (id, headers) =>
  socket.delete(`/background-images/${id}`, undefined, headers);

export default {
  createBackgroundImage,
  deleteBackgroundImage,
};
