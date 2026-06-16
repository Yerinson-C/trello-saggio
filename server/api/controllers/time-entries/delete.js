const { idInput } = require('../../../utils/inputs');

const Errors = {
  TIME_ENTRY_NOT_FOUND: {
    timeEntryNotFound: 'Time entry not found',
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
    timeEntryNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const timeEntry = await TimeEntry.findOne({ id: inputs.id });

    if (!timeEntry) {
      throw Errors.TIME_ENTRY_NOT_FOUND;
    }

    if (timeEntry.userId !== currentUser.id && currentUser.role !== User.Roles.ADMIN) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        timeEntry.projectId,
      );

      if (!isProjectManager) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const deletedTimeEntry = await TimeEntry.destroyOne({ id: inputs.id });

    if (!deletedTimeEntry) {
      throw Errors.TIME_ENTRY_NOT_FOUND;
    }

    return {
      item: deletedTimeEntry,
    };
  },
};
