/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = async function isInternal(req, res, proceed) {
  if (req.currentUser.id !== User.INTERNAL.id) {
    return res.notFound(); // Forbidden
  }

  return proceed();
};
