/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { Draggable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Paths from '../../../constants/Paths';

import styles from './Item.module.scss';

// Vibrant colors that contrast well against the dark space background
const BOARD_COLORS = [
  '#ff6b6b', // coral red
  '#ffd93d', // golden yellow
  '#6bcb77', // fresh green
  '#4d96ff', // electric blue
  '#ff922b', // vivid orange
  '#cc5de8', // bright purple
  '#20c997', // turquoise
  '#f06595', // hot pink
  '#74c0fc', // sky blue
  '#a9e34b', // lime green
];

const Item = React.memo(({ id, index }) => {
  const boardColor = BOARD_COLORS[index % BOARD_COLORS.length];
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const selectNotificationsTotalByBoardId = useMemo(
    () => selectors.makeSelectNotificationsTotalByBoardId(),
    [],
  );

  const board = useSelector((state) => selectBoardById(state, id));
  const notificationsTotal = useSelector((state) => selectNotificationsTotalByBoardId(state, id));
  const isActive = useSelector((state) => id === selectors.selectPath(state).boardId);

  const canEdit = useSelector((state) => {
    const isEditModeEnabled = selectors.selectIsEditModeEnabled(state); // TODO: move out?

    if (!isEditModeEnabled) {
      return isEditModeEnabled;
    }

    return selectors.selectIsCurrentUserManagerForCurrentProject(state);
  });

  const dispatch = useDispatch();

  const handleEditClick = useCallback(() => {
    dispatch(entryActions.openBoardSettingsModal(id));
  }, [id, dispatch]);

  return (
    <Draggable draggableId={id} index={index} isDragDisabled={!board.isPersisted || !canEdit}>
      {({ innerRef, draggableProps, dragHandleProps }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div {...draggableProps} {...dragHandleProps} ref={innerRef} className={styles.wrapper}>
          <div
            className={classNames(styles.tab, isActive && styles.tabActive)}
            style={{
              borderBottom: `3px solid ${boardColor}`,
              boxShadow: isActive ? `0 -2px 8px ${boardColor}55` : 'none',
            }}
          >
            {board.isPersisted ? (
              <>
                <Link
                  to={Paths.BOARDS.replace(':id', id)}
                  title={board.name}
                  className={styles.link}
                >
                  {notificationsTotal > 0 && (
                    <span className={styles.notifications}>{notificationsTotal}</span>
                  )}
                  <span
                    className={styles.name}
                    style={{ color: isActive ? boardColor : undefined }}
                  >
                    {board.name}
                  </span>
                </Link>
                {canEdit && (
                  <Button className={styles.editButton} onClick={handleEditClick}>
                    <Icon fitted name="pencil" size="small" />
                  </Button>
                )}
              </>
            ) : (
              <span className={classNames(styles.name, styles.link)}>{board.name}</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default Item;
