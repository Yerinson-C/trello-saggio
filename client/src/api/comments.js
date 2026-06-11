/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import http from './http';
import socket from './socket';
import { transformAttachment } from './attachments';

/* Transformers */

export const transformComment = (comment) => ({
  ...comment,
  ...(comment.createdAt && {
    createdAt: new Date(comment.createdAt),
  }),
});

/* Actions */

const getComments = (cardId, data, headers) =>
  socket.get(`/cards/${cardId}/comments`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformComment),
  }));

const createComment = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/comments`, data, headers).then((body) => ({
    ...body,
    item: transformComment(body.item),
  }));

const createCommentAttachment = (commentId, { file, ...data }, requestId, headers) =>
  http
    .post(
      `/comments/${commentId}/attachments?requestId=${requestId}`,
      {
        ...data,
        file,
      },
      headers,
    )
    .then((body) => ({
      ...body,
      item: transformAttachment(body.item),
    }));

const searchCommentsInBoard = (boardId, data, headers) =>
  socket.get(`/boards/${boardId}/comments/search`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformComment),
  }));

const updateComment = (id, data, headers) =>
  socket.patch(`/comments/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformComment(body.item),
  }));

const deleteComment = (id, headers) =>
  socket.delete(`/comments/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformComment(body.item),
  }));

/* Event handlers */

const makeHandleCommentCreate = (next) => (body) => {
  next({
    ...body,
    item: transformComment(body.item),
  });
};

const makeHandleCommentUpdate = makeHandleCommentCreate;

const makeHandleCommentDelete = makeHandleCommentUpdate;

export default {
  getComments,
  createComment,
  createCommentAttachment,
  searchCommentsInBoard,
  updateComment,
  deleteComment,
  makeHandleCommentCreate,
  makeHandleCommentUpdate,
  makeHandleCommentDelete,
};
