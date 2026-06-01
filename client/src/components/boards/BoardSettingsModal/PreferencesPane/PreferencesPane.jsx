/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, Header, Tab } from 'semantic-ui-react';

import DefaultView from './DefaultView';
import DefaultCardType from './DefaultCardType';
import Others from './Others';

import styles from './PreferencesPane.module.scss';

const PreferencesPane = React.memo(() => {
  const [t] = useTranslation();

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Divider horizontal className={styles.firstDivider}>
        <Header as="h4">
          {t('common.defaultView', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <DefaultView />
      <Divider horizontal>
        <Header as="h4">
          {t('common.defaultCardType', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <DefaultCardType />
      <Divider horizontal>
        <Header as="h4">
          {t('common.others', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <Others />
    </Tab.Pane>
  );
});

export default PreferencesPane;
