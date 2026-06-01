/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { Input as SemanticUIInput } from 'semantic-ui-react';

import InputPassword from './InputPassword';
import InputMask from './InputMask';

export default class Input extends SemanticUIInput {
  static Password = InputPassword;

  static Mask = InputMask;
}
