/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

/**
 * GET /api/projects/:id/members
 * Returns all members (managers + board members) of a project.
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.id);
    if (!project) {
      throw { projectNotFound: 'Project not found' };
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      project.id,
    );

    if (currentUser.role !== User.Roles.ADMIN && !isProjectManager) {
      const boardMemberships = await BoardMembership.qm.getByUserId(currentUser.id);
      const boards = await Board.qm.getByProjectId(project.id);
      const boardIds = sails.helpers.utils.mapRecords(boards);
      const isBoardMember = boardMemberships.some((bm) => boardIds.includes(bm.boardId));
      if (!isBoardMember) {
        throw { projectNotFound: 'Project not found' };
      }
    }

    const projectManagers = await ProjectManager.qm.getByProjectId(project.id);
    const managerUserIds = sails.helpers.utils.mapRecords(projectManagers, 'userId', true);

    const boards = await Board.qm.getByProjectId(project.id);
    const boardIds = sails.helpers.utils.mapRecords(boards);
    const boardMemberships = await BoardMembership.qm.getByBoardIds(boardIds);
    const memberUserIds = sails.helpers.utils.mapRecords(boardMemberships, 'userId', true);

    const allUserIds = [...new Set([...managerUserIds, ...memberUserIds])];
    const users = await User.qm.getByIds(allUserIds);

    return {
      items: sails.helpers.users.presentMany(users, currentUser),
      included: {
        projectManagers,
        boardMemberships,
      },
    };
  },
};
