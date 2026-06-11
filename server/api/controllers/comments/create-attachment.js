/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /comments/{commentId}/attachments:
 *   post:
 *     summary: Create comment attachment
 *     description: Uploads a file and attaches it to a comment. Requires board editor permissions or comment permissions.
 *     tags:
 *       - Attachments
 *     operationId: createCommentAttachment
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         description: ID of the comment to attach the file to
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the attachment
 *     responses:
 *       200:
 *         description: Attachment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Attachment'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         description: Upload error
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  COMMENT_NOT_FOUND: {
    commentNotFound: 'Comment not found',
  },
  NO_FILE_WAS_UPLOADED: {
    noFileWasUploaded: 'No file was uploaded',
  },
};

module.exports = {
  inputs: {
    commentId: {
      ...idInput,
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 128,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    commentNotFound: {
      responseType: 'notFound',
    },
    noFileWasUploaded: {
      responseType: 'unprocessableEntity',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const comment = await Comment.qm.getOneById(inputs.commentId);

    if (!comment) {
      throw Errors.COMMENT_NOT_FOUND;
    }

    const { card, list, board, project } = await sails.helpers.cards
      .getPathToProjectById(comment.cardId)
      .intercept('pathNotFound', () => Errors.COMMENT_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.COMMENT_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      if (!boardMembership.canComment) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    let files;
    try {
      files = await sails.helpers.utils.receiveFile(this.req.file('file'));
    } catch (error) {
      return exits.uploadError(error.message);
    }

    if (files.length === 0) {
      throw Errors.NO_FILE_WAS_UPLOADED;
    }

    const file = _.last(files);
    const data = await sails.helpers.attachments.processUploadedFile(file);

    const attachment = await sails.helpers.attachments.createOne.with({
      project,
      board,
      list,
      values: {
        type: Attachment.Types.FILE,
        name: inputs.name || file.filename,
        data,
        commentId: comment.id,
        card,
        creatorUser: currentUser,
      },
      request: this.req,
    });

    return exits.success({
      item: sails.helpers.attachments.presentOne(attachment),
    });
  },
};
