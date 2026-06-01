/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const cardLabels = await CardLabel.qm.getByCardId(inputs.id);
    const labelIds = sails.helpers.utils.mapRecords(cardLabels, 'labelId');

    return Label.qm.getByIds(labelIds);
  },
};
