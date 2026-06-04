/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

/**
 * DELETE /api/projects/:projectId/managers/:userId
 * Remove a manager from a project by userId (instead of projectManagerId).
 */

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      required: true,
    },
    userId: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    projectManagerNotFound: {
      responseType: 'notFound',
    },
    mustNotBeLast: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.projectId);
    if (!project) {
      throw { projectManagerNotFound: 'Project not found' };
    }

    if (currentUser.role !== User.Roles.ADMIN) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );
      if (!isProjectManager) {
        throw { projectManagerNotFound: 'Not found' };
      }
    }

    if (project.ownerProjectManagerId) {
      throw { notEnoughRights: 'Not enough rights' };
    }

    let projectManager = await ProjectManager.qm.getOneByProjectIdAndUserId(
      inputs.projectId,
      inputs.userId,
    );

    if (!projectManager) {
      throw { projectManagerNotFound: 'Project manager not found' };
    }

    const user = await User.qm.getOneById(projectManager.userId);

    projectManager = await sails.helpers.projectManagers.deleteOne
      .with({
        user,
        project,
        record: projectManager,
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('mustNotBeLast', () => ({ mustNotBeLast: 'Must not be last manager' }));

    if (!projectManager) {
      throw { projectManagerNotFound: 'Project manager not found' };
    }

    return {
      item: projectManager,
    };
  },
};
