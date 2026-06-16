const { idInput } = require('../../../utils/inputs');

const Errors = {
  DELIVERABLE_NOT_FOUND: {
    deliverableNotFound: 'Deliverable not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    deliverableNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const deliverable = await Deliverable.findOne({ id: inputs.id });

    if (!deliverable) {
      throw Errors.DELIVERABLE_NOT_FOUND;
    }

    if (deliverable.createdByUserId !== currentUser.id && currentUser.role !== User.Roles.ADMIN) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        deliverable.projectId,
      );

      if (!isProjectManager) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const deletedDeliverable = await Deliverable.destroyOne({ id: inputs.id });

    if (!deletedDeliverable) {
      throw Errors.DELIVERABLE_NOT_FOUND;
    }

    return {
      item: deletedDeliverable,
    };
  },
};
