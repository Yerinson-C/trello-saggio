/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  isFetching: false,
  query: '',
  items: [],
  error: null,
};

const buildItems = (comments, users, cards) => {
  const usersById = Object.fromEntries(users.map((user) => [user.id, user]));
  const cardsById = Object.fromEntries(cards.map((card) => [card.id, card]));

  return comments.map((comment) => ({
    ...comment,
    user: usersById[comment.userId],
    card: cardsById[comment.cardId],
  }));
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.COMMENTS_SEARCH:
      return {
        ...state,
        isFetching: true,
        query: payload.query,
        error: null,
      };
    case ActionTypes.COMMENTS_SEARCH__SUCCESS:
      if (payload.query !== state.query) {
        return state;
      }

      return {
        ...state,
        isFetching: false,
        items: buildItems(payload.comments, payload.users, payload.cards),
        error: null,
      };
    case ActionTypes.COMMENTS_SEARCH__FAILURE:
      if (payload.query !== state.query) {
        return state;
      }

      return {
        ...state,
        isFetching: false,
        items: [],
        error: payload.error,
      };
    case ActionTypes.COMMENTS_SEARCH_CLEAR:
      return initialState;
    default:
      return state;
  }
};
