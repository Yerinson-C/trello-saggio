/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectCommentById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Comment }, id) => {
      const commentModel = Comment.withId(id);

      if (!commentModel) {
        return commentModel;
      }

      return {
        ...commentModel.ref,
        isPersisted: !isLocalId(commentModel.id),
      };
    },
  );

export const selectCommentById = makeSelectCommentById();

export const makeSelectReplyIdsForCommentId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Comment }, id) => {
      const commentModel = Comment.withId(id);

      if (!commentModel) {
        return [];
      }

      return commentModel.getRepliesModelArray().map((replyModel) => replyModel.id);
    },
  );

export const makeSelectAttachmentIdsForCommentId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Comment }, id) => {
      const commentModel = Comment.withId(id);

      if (!commentModel) {
        return [];
      }

      return commentModel.getAttachmentsModelArray().map((attachmentModel) => attachmentModel.id);
    },
  );

export default {
  makeSelectCommentById,
  selectCommentById,
  makeSelectReplyIdsForCommentId,
  makeSelectAttachmentIdsForCommentId,
};
