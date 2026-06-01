/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = async function isAuthenticated(req, res, proceed) {
  if (!req.currentUser) {
    // TODO: provide separate error for API keys?
    return res.unauthorized('Access token is missing, invalid or expired');
  }

  return proceed();
};
