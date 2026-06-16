const { idInput } = require('../../../utils/inputs');

const Errors = {
  ENVIRONMENTAL_DATA_NOT_FOUND: {
    environmentalDataNotFound: 'Environmental data not found',
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
    environmentalDataNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const environmentalData = await EnvironmentalData.findOne({ id: inputs.id });

    if (!environmentalData) {
      throw Errors.ENVIRONMENTAL_DATA_NOT_FOUND;
    }

    if (environmentalData.recordedByUserId !== currentUser.id && currentUser.role !== User.Roles.ADMIN) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        environmentalData.projectId,
      );

      if (!isProjectManager) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const deletedEnvironmentalData = await EnvironmentalData.destroyOne({ id: inputs.id });

    if (!deletedEnvironmentalData) {
      throw Errors.ENVIRONMENTAL_DATA_NOT_FOUND;
    }

    return {
      item: deletedEnvironmentalData,
    };
  },
};
