/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { ListTypes, ListTypeStates } from './Enums';

export default {
  [ListTypes.ACTIVE]: ListTypeStates.OPENED,
  [ListTypes.CLOSED]: ListTypeStates.CLOSED,
};
