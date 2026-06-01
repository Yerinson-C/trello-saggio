/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

/* Query methods */

const createOne = (values) => Webhook.create({ ...values }).fetch();

const getAll = () => Webhook.find().sort('id');

const getOneById = (id) => Webhook.findOne(id);

const updateOne = (criteria, values) => Webhook.updateOne(criteria).set({ ...values });

const deleteOne = (criteria) => Webhook.destroyOne(criteria);

module.exports = {
  createOne,
  getAll,
  getOneById,
  updateOne,
  deleteOne,
};
