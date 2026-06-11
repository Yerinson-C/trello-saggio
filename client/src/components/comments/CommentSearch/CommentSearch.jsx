/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';

import CommentSearchStep from './CommentSearchStep';

import styles from './CommentSearch.module.scss';

const CommentSearch = React.memo(() => {
  const [t] = useTranslation();

  const CommentSearchPopup = usePopup(CommentSearchStep);

  return (
    <CommentSearchPopup>
      <button
        type="button"
        title={t('common.searchConversations', { context: 'title' })}
        className={styles.button}
      >
        <Icon fitted name="search" />
      </button>
    </CommentSearchPopup>
  );
});

export default CommentSearch;
