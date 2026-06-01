/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectCustomFieldById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ CustomField }, id) => {
      const customFieldModel = CustomField.withId(id);

      if (!customFieldModel) {
        return customFieldModel;
      }

      return {
        ...customFieldModel.ref,
        isPersisted: !isLocalId(customFieldModel.id),
      };
    },
  );

export const selectCustomFieldById = makeSelectCustomFieldById();

export default {
  makeSelectCustomFieldById,
  selectCustomFieldById,
};
