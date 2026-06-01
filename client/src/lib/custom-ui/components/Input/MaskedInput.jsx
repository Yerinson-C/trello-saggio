/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import InputMask from 'react-input-mask';

export default class MaskedInput extends InputMask {
  focus(options) {
    this.getInputDOMNode().focus(options);
  }

  select() {
    this.getInputDOMNode().select();
  }
}
