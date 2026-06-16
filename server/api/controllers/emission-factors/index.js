module.exports = {
  inputs: {},

  exits: {},

  async fn() {
    const emissionFactors = await EmissionFactor.find().sort('category ASC');

    return {
      items: emissionFactors,
    };
  },
};
