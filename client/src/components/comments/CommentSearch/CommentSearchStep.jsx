/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import debounce from 'lodash/debounce';
import truncate from 'lodash/truncate';
import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader, Menu } from 'semantic-ui-react';
import { Input, Popup } from '../../../lib/custom-ui';
import { push } from '../../../lib/redux-router';
import { closePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useField, useNestedRef } from '../../../hooks';
import { mentionMarkupToText } from '../../../utils/mentions';
import Paths from '../../../constants/Paths';
import TimeAgo from '../../common/TimeAgo';
import UserAvatar from '../../users/UserAvatar';

import styles from './CommentSearchStep.module.scss';

const CommentSearchStep = React.memo(({ onBack }) => {
  const { isFetching, query, items } = useSelector(selectors.selectCommentSearchState);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [search, handleSearchChange] = useField('');

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const debouncedSearch = useMemo(
    () =>
      debounce((nextQuery) => {
        dispatch(entryActions.searchCommentsInCurrentBoard(nextQuery.trim()));
      }, 400),
    [dispatch],
  );

  const handleChange = useCallback(
    (event, { value: nextValue }) => {
      handleSearchChange(event, { value: nextValue });
      debouncedSearch(nextValue);
    },
    [handleSearchChange, debouncedSearch],
  );

  const handleItemClick = useCallback(
    (cardId) => {
      closePopup();
      dispatch(push(Paths.CARDS.replace(':id', cardId)));
    },
    [dispatch],
  );

  useEffect(() => {
    searchFieldRef.current.focus({
      preventScroll: true,
    });

    return () => {
      dispatch(entryActions.clearCommentSearch());
      debouncedSearch.cancel();
    };
  }, [searchFieldRef, dispatch, debouncedSearch]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.searchConversations', { context: 'title' })}
      </Popup.Header>
      <Popup.Content>
        <Input
          fluid
          ref={handleSearchFieldRef}
          value={search}
          placeholder={t('common.searchComments')}
          maxLength={256}
          icon="search"
          onChange={handleChange}
        />
        {isFetching && (
          <div className={styles.loaderWrapper}>
            <Loader active inverted inline="centered" size="small" />
          </div>
        )}
        {!isFetching && query && (
          <Menu secondary vertical className={styles.menu}>
            {items.length === 0 && (
              <div className={styles.empty}>{t('common.noCommentsFound')}</div>
            )}
            {items.map((item) => (
              <Menu.Item
                key={item.id}
                className={styles.item}
                onClick={() => handleItemClick(item.cardId)}
              >
                <div className={styles.itemHeader}>
                  {item.user && <UserAvatar id={item.user.id} size="tiny" />}
                  <span className={styles.itemUser}>{item.user && item.user.name}</span>
                  <span className={styles.itemDate}>
                    <TimeAgo date={item.createdAt} />
                  </span>
                </div>
                {item.card && <div className={styles.itemCard}>{item.card.name}</div>}
                <div className={styles.itemText}>
                  {truncate(mentionMarkupToText(item.text), {
                    length: 160,
                  })}
                </div>
              </Menu.Item>
            ))}
          </Menu>
        )}
      </Popup.Content>
    </>
  );
});

CommentSearchStep.propTypes = {
  onBack: PropTypes.func,
};

CommentSearchStep.defaultProps = {
  onBack: undefined,
};

export default CommentSearchStep;
