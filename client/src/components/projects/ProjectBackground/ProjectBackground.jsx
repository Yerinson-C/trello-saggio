/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import { ProjectBackgroundTypes } from '../../../constants/Enums';

import styles from './ProjectBackground.module.scss';
import globalStyles from '../../../styles.module.scss';

// Default background: Earth from space at night photo
const DEFAULT_BACKGROUND = `url("/board-bg.jpg") center / cover no-repeat`;

const ProjectBackground = React.memo(() => {
  const selectBackgroundImageById = useMemo(() => selectors.makeSelectBackgroundImageById(), []);

  const project = useSelector(selectors.selectCurrentProject);

  const backgroundType = project?.backgroundType ?? null;
  const backgroundGradient = project?.backgroundGradient ?? null;
  const backgroundImageId = project?.backgroundImageId ?? null;

  const backgroundImageUrl = useSelector((state) => {
    if (!backgroundType || backgroundType !== ProjectBackgroundTypes.IMAGE) {
      return null;
    }

    const backgroundImage = selectBackgroundImageById(state, backgroundImageId);

    if (!backgroundImage) {
      return null;
    }

    return backgroundImage.url;
  });

  const hasCustomBackground = !!backgroundType;

  return (
    <div
      className={classNames(
        styles.wrapper,
        !hasCustomBackground && styles.wrapperDefault,
        backgroundType === ProjectBackgroundTypes.GRADIENT &&
          globalStyles[`background${upperFirst(camelCase(backgroundGradient))}`],
      )}
      style={{
        background: backgroundImageUrl
          ? `url("${backgroundImageUrl}") center / cover`
          : !hasCustomBackground
          ? DEFAULT_BACKGROUND
          : undefined,
      }}
    />
  );
});

export default ProjectBackground;
