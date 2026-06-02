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

// Default background shown when project has no custom background configured
const DEFAULT_BACKGROUND = `
  linear-gradient(135deg,
    rgba(15, 32, 65, 0.97) 0%,
    rgba(10, 61, 98, 0.95) 30%,
    rgba(5, 90, 120, 0.93) 60%,
    rgba(20, 110, 140, 0.92) 100%
  ),
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")
`.trim();

const ProjectBackground = React.memo(() => {
  const selectBackgroundImageById = useMemo(() => selectors.makeSelectBackgroundImageById(), []);

  const { backgroundImageId, backgroundType, backgroundGradient } = useSelector(
    selectors.selectCurrentProject,
  );

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
