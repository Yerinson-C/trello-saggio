/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const getConfig = (headers) => socket.get('/config', undefined, headers);

const updateConfig = (data, headers) => socket.patch('/config', data, headers);

const testSmtpConfig = (headers) => socket.post('/config/test-smtp', undefined, headers);

export default {
  getConfig,
  updateConfig,
  testSmtpConfig,
};
