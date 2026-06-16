/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

/**
 * Task.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - id
 *         - taskListId
 *         - linkedCardId
 *         - assigneeUserId
 *         - position
 *         - name
 *         - status
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the task
 *           example: "1357158568008091264"
 *         taskListId:
 *           type: string
 *           description: ID of the task list the task belongs to
 *           example: "1357158568008091265"
 *         linkedCardId:
 *           type: string
 *           nullable: true
 *           description: ID of the card linked to the task
 *           example: "1357158568008091266"
 *         assigneeUserId:
 *           type: string
 *           nullable: true
 *           description: ID of the user assigned to the task
 *           example: "1357158568008091267"
 *         position:
 *           type: number
 *           description: Position of the task within the task list
 *           example: 65536
 *         name:
 *           type: string
 *           description: Name/title of the task
 *           example: Write unit tests
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, pending_info, pending_client, internal_review, blocked, completed]
 *           default: not_started
 *           description: Current status of the task
 *           example: not_started
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the task was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the task was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

const Statuses = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PENDING_INFO: 'pending_info',
  PENDING_CLIENT: 'pending_client',
  INTERNAL_REVIEW: 'internal_review',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
};

module.exports = {
  Statuses,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    status: {
      type: 'string',
      isIn: Object.values(Statuses),
      defaultsTo: Statuses.NOT_STARTED,
      columnName: 'status',
    },
    startDate: {
      type: 'ref',
      columnName: 'start_date',
    },
    dueDate: {
      type: 'ref',
      columnName: 'due_date',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    taskListId: {
      model: 'TaskList',
      required: true,
      columnName: 'task_list_id',
    },
    linkedCardId: {
      model: 'Card',
      columnName: 'linked_card_id',
    },
    assigneeUserId: {
      model: 'User',
      columnName: 'assignee_user_id',
    },
  },
};
