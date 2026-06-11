/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/comments/search:
 *   get:
 *     summary: Search comments in board
 *     description: Searches comment text across all cards of a board. Requires access to the board.
 *     tags:
 *       - Comments
 *     operationId: searchCommentsInBoard
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 256
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *                 - included
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 included:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     cards:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Card'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    boardId: {
      ...idInput,
      required: true,
    },
    q: {
      type: 'string',
      minLength: 1,
      maxLength: 256,
      required: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getPathToProjectById(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          board.id,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.BOARD_NOT_FOUND; // Forbidden
        }
      }
    }

    const cards = await Card.qm.getByBoardId(board.id);
    const cardIds = sails.helpers.utils.mapRecords(cards);

    const comments = cardIds.length > 0 ? await Comment.qm.searchByCardIds(cardIds, inputs.q) : [];

    const userIds = sails.helpers.utils.mapRecords(comments, 'userId', true, true);
    const users = await User.qm.getByIds(userIds);

    const commentCardIds = sails.helpers.utils.mapRecords(comments, 'cardId', true, true);
    const commentCards = cards.filter((card) => commentCardIds.includes(card.id));

    return {
      items: comments,
      included: {
        users: sails.helpers.users.presentMany(users, currentUser),
        cards: commentCards,
      },
    };
  },
};
