/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { Popup as SemanticUIPopup } from 'semantic-ui-react';

import PopupHeader from './PopupHeader';

export default class Popup extends SemanticUIPopup {
  static Header = PopupHeader;
}
