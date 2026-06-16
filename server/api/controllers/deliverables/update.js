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
    name: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
    },
    description: {
      type: 'string',
      allowNull: true,
    },
    status: {
      type: 'string',
      maxLength: 32,
      allowNull: true,
    },
    dueDate: {
      type: 'string',
      allowNull: true,
    },
    fileUrl: {
      type: 'string',
      maxLength: 1024,
      allowNull: true,
    },
    fileName: {
      type: 'string',
      maxLength: 256,
      allowNull: true,
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

    const values = _.omitBy(
      _.pick(inputs, ['name', 'description', 'status', 'dueDate', 'fileUrl', 'fileName']),
      _.isUndefined,
    );

    const updatedDeliverables = await Deliverable.update({ id: inputs.id }, values).fetch();
    const updatedDeliverable = updatedDeliverables[0];

    if (!updatedDeliverable) {
      throw Errors.DELIVERABLE_NOT_FOUND;
    }

    return {
      item: updatedDeliverable,
    };
  },
};
