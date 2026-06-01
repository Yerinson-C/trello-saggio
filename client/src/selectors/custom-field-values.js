/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectCustomFieldValueById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ CustomFieldValue }, id) => {
      const customFieldValueModel = CustomFieldValue.withId(id);

      if (!customFieldValueModel) {
        return customFieldValueModel;
      }

      return customFieldValueModel.ref;
    },
  );

export const selectCustomFieldValueById = makeSelectCustomFieldValueById();

export default {
  makeSelectCustomFieldValueById,
  selectCustomFieldValueById,
};
