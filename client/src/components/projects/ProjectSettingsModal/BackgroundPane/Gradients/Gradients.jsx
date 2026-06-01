/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React from 'react';

import BACKGROUND_GRADIENTS from '../../../../../constants/BackgroundGradients';
import Item from './Item';

import styles from './Gradients.module.scss';

const Gradients = React.memo(() => (
  <div className={styles.wrapper}>
    {BACKGROUND_GRADIENTS.map((backgroundGradient) => (
      <Item key={backgroundGradient} name={backgroundGradient} />
    ))}
  </div>
));

export default Gradients;
