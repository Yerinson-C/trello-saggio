/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

export default (url) => {
  const filename = url.split('/').pop().toLowerCase();

  let extension = filename.slice((Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1);
  extension = extension ? extension.toLowerCase() : null;

  return {
    filename,
    extension,
  };
};
