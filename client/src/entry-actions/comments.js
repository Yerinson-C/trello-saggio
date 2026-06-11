/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const fetchCommentsInCurrentCard = () => ({
  type: EntryActionTypes.COMMENTS_IN_CURRENT_CARD_FETCH,
  payload: {},
});

const createCommentInCurrentCard = (data) => ({
  type: EntryActionTypes.COMMENT_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

const handleCommentCreate = (comment, users) => ({
  type: EntryActionTypes.COMMENT_CREATE_HANDLE,
  payload: {
    comment,
    users,
  },
});

const updateComment = (id, data) => ({
  type: EntryActionTypes.COMMENT_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleCommentUpdate = (comment) => ({
  type: EntryActionTypes.COMMENT_UPDATE_HANDLE,
  payload: {
    comment,
  },
});

const deleteComment = (id) => ({
  type: EntryActionTypes.COMMENT_DELETE,
  payload: {
    id,
  },
});

const handleCommentDelete = (comment) => ({
  type: EntryActionTypes.COMMENT_DELETE_HANDLE,
  payload: {
    comment,
  },
});

const createCommentAttachmentInCurrentCard = (commentId, data) => ({
  type: EntryActionTypes.COMMENT_ATTACHMENT_IN_CURRENT_CARD_CREATE,
  payload: {
    commentId,
    data,
  },
});

const searchCommentsInCurrentBoard = (query) => ({
  type: EntryActionTypes.COMMENTS_SEARCH_IN_CURRENT_BOARD,
  payload: {
    query,
  },
});

const clearCommentSearch = () => ({
  type: EntryActionTypes.COMMENTS_SEARCH_CLEAR,
  payload: {},
});

export default {
  fetchCommentsInCurrentCard,
  createCommentInCurrentCard,
  handleCommentCreate,
  updateComment,
  handleCommentUpdate,
  deleteComment,
  handleCommentDelete,
  createCommentAttachmentInCurrentCard,
  searchCommentsInCurrentBoard,
  clearCommentSearch,
};
