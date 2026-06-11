/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Comment';

  static fields = {
    id: attr(),
    text: attr(),
    createdAt: attr({
      getDefault: () => new Date(),
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'comments',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'comments',
    }),
    parentCommentId: fk({
      to: 'Comment',
      as: 'parentComment',
      relatedName: 'replies',
    }),
  };

  getRepliesQuerySet() {
    return this.replies.orderBy(['id.length', 'id'], ['asc', 'asc']);
  }

  getRepliesModelArray() {
    return this.getRepliesQuerySet().toModelArray();
  }

  getAttachmentsQuerySet() {
    return this.attachments.orderBy(['id.length', 'id'], ['asc', 'asc']);
  }

  getAttachmentsModelArray() {
    return this.getAttachmentsQuerySet().toModelArray();
  }

  deleteWithRelated() {
    this.getRepliesModelArray().forEach((replyModel) => replyModel.deleteWithRelated());
    this.attachments.delete();
    this.delete();
  }

  static reducer({ type, payload }, Comment) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Comment.all().delete();

        break;
      case ActionTypes.COMMENTS_FETCH__SUCCESS:
        payload.comments.forEach((comment) => {
          Comment.upsert(comment);
        });

        break;
      case ActionTypes.COMMENT_CREATE:
      case ActionTypes.COMMENT_CREATE_HANDLE:
      case ActionTypes.COMMENT_UPDATE__SUCCESS:
      case ActionTypes.COMMENT_UPDATE_HANDLE:
        Comment.upsert(payload.comment);

        break;
      case ActionTypes.COMMENT_CREATE__SUCCESS:
        Comment.withId(payload.localId).delete();
        Comment.upsert(payload.comment);

        break;
      case ActionTypes.COMMENT_CREATE__FAILURE: {
        const commentModel = Comment.withId(payload.localId);
        commentModel.delete();

        if (commentModel.card) {
          commentModel.card.commentsTotal -= 1;
        }

        break;
      }
      case ActionTypes.COMMENT_UPDATE:
        Comment.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.COMMENT_DELETE: {
        const commentModel = Comment.withId(payload.id);
        commentModel.card.commentsTotal -= 1;
        commentModel.deleteWithRelated();

        break;
      }
      case ActionTypes.COMMENT_DELETE__SUCCESS:
      case ActionTypes.COMMENT_DELETE_HANDLE: {
        const commentModel = Comment.withId(payload.comment.id);

        if (commentModel) {
          commentModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }
}
