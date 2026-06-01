/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectBackgroundImageById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ BackgroundImage }, id) => {
      const backgroundImageModel = BackgroundImage.withId(id);

      if (!backgroundImageModel) {
        return backgroundImageModel;
      }

      return {
        ...backgroundImageModel.ref,
        isPersisted: !isLocalId(backgroundImageModel.id),
      };
    },
  );

export const selectBackgroundImageById = makeSelectBackgroundImageById();

export const selectIsBackgroundImageWithIdExists = createSelector(
  orm,
  (_, id) => id,
  ({ BackgroundImage }, id) => BackgroundImage.idExists(id),
);

export default {
  makeSelectBackgroundImageById,
  selectBackgroundImageById,
  selectIsBackgroundImageWithIdExists,
};
