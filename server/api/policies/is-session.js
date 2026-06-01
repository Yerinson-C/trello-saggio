/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = async function isSession(req, res, proceed) {
  if (!req.currentSession) {
    return res.notFound(); // Forbidden
  }

  return proceed();
};
