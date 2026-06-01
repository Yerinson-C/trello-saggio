/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

const SEARCH_PARTS_REGEX = /[ ,;]+/; // TODO: move to utils

export default (search) =>
  search.split(SEARCH_PARTS_REGEX).flatMap((searchPart) => {
    if (!searchPart) {
      return [];
    }

    return searchPart.toLowerCase();
  });
