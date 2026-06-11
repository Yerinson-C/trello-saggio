/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import omit from 'lodash/omit';
import truncate from 'lodash/truncate';
import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';
import { AttachmentTypes } from '../../../constants/Enums';

export function* fetchComments(cardId) {
  const { lastCommentId } = yield select(selectors.selectCardById, cardId);

  yield put(actions.fetchComments(cardId));

  let comments;
  let users;

  try {
    ({
      items: comments,
      included: { users },
    } = yield call(request, api.getComments, cardId, {
      beforeId: lastCommentId || undefined,
    }));
  } catch (error) {
    yield put(actions.fetchComments.failure(cardId, error));
    return;
  }

  yield put(actions.fetchComments.success(cardId, comments, users));
}

export function* fetchCommentsInCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(fetchComments, cardId);
}

export function* createComment(cardId, data) {
  const localId = yield call(createLocalId);
  const currentUser = yield select(selectors.selectCurrentUser);

  yield put(
    actions.createComment({
      ...data,
      cardId,
      id: localId,
      userId: currentUser.id,
    }),
  );

  let comment;
  try {
    ({ item: comment } = yield call(request, api.createComment, cardId, data));
  } catch (error) {
    yield put(actions.createComment.failure(localId, error));
    return;
  }

  yield put(actions.createComment.success(localId, comment));
}

export function* createCommentInCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(createComment, cardId, data);
}

export function* handleCommentCreate(comment, users) {
  yield put(actions.handleCommentCreate(comment, users));
}

export function* updateComment(id, data) {
  yield put(actions.updateComment(id, data));

  let comment;
  try {
    ({ item: comment } = yield call(request, api.updateComment, id, data));
  } catch (error) {
    yield put(actions.updateComment.failure(id, error));
    return;
  }

  yield put(actions.updateComment.success(comment));
}

export function* handleCommentUpdate(comment) {
  yield put(actions.handleCommentUpdate(comment));
}

export function* deleteComment(id) {
  yield put(actions.deleteComment(id));

  let comment;
  try {
    ({ item: comment } = yield call(request, api.deleteComment, id));
  } catch (error) {
    yield put(actions.deleteComment.failure(id, error));
    return;
  }

  yield put(actions.deleteComment.success(comment));
}

export function* handleCommentDelete(comment) {
  yield put(actions.handleCommentDelete(comment));
}

export function* createCommentAttachment(commentId, data) {
  const localId = yield call(createLocalId);
  const currentUserId = yield select(selectors.selectCurrentUserId);
  const { cardId } = yield select(selectors.selectPath);

  const nextData = {
    ...data,
    name: truncate(data.name, {
      length: 128,
    }),
  };

  yield put(
    actions.createAttachment({
      ...omit(nextData, ['file']),
      type: AttachmentTypes.FILE,
      cardId,
      commentId,
      id: localId,
      creatorUserId: currentUserId,
    }),
  );

  let attachment;
  try {
    ({ item: attachment } = yield call(
      request,
      api.createCommentAttachment,
      commentId,
      nextData,
      localId,
    ));
  } catch (error) {
    yield put(actions.createAttachment.failure(localId, error));
    return;
  }

  yield put(actions.createAttachment.success(localId, attachment));
}

export function* createCommentAttachmentInCurrentCard(commentId, data) {
  yield call(createCommentAttachment, commentId, data);
}

export function* searchCommentsInCurrentBoard(query) {
  const { boardId } = yield select(selectors.selectPath);

  yield put(actions.searchComments(query));

  if (!query) {
    yield put(actions.searchComments.success(query, [], [], []));
    return;
  }

  let comments;
  let users;
  let cards;
  try {
    ({
      items: comments,
      included: { users, cards },
    } = yield call(request, api.searchCommentsInBoard, boardId, {
      q: query,
    }));
  } catch (error) {
    yield put(actions.searchComments.failure(query, error));
    return;
  }

  yield put(actions.searchComments.success(query, comments, users, cards));
}

export function* clearCommentSearch() {
  yield put(actions.clearCommentSearch());
}

export default {
  fetchComments,
  fetchCommentsInCurrentCard,
  createComment,
  createCommentInCurrentCard,
  handleCommentCreate,
  updateComment,
  handleCommentUpdate,
  deleteComment,
  handleCommentDelete,
  createCommentAttachment,
  createCommentAttachmentInCurrentCard,
  searchCommentsInCurrentBoard,
  clearCommentSearch,
};
