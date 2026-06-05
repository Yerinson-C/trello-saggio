/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import ModalTypes from '../../../constants/ModalTypes';
import { BoardContexts, BoardViews } from '../../../constants/Enums';
import KanbanContent from './KanbanContent';
import FiniteContent from './FiniteContent';
import EndlessContent from './EndlessContent';
import TableView from './TableView';
import CalendarView from './CalendarView';
import TimelineView from './TimelineView';
import MapView from './MapView';
import ShortcutsProvider from './ShortcutsProvider';
import CardModal from '../../cards/CardModal';
import BoardActivitiesModal from '../../activities/BoardActivitiesModal';

const Board = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const modal = useSelector(selectors.selectCurrentModal);
  const isCardModalOpened = useSelector((state) => !!selectors.selectPath(state).cardId);

  // Custom views that bypass ShortcutsProvider
  if (board.view === BoardViews.TABLE) {
    return <TableView />;
  }
  if (board.view === BoardViews.CALENDAR) {
    return <CalendarView />;
  }
  if (board.view === BoardViews.TIMELINE) {
    return <TimelineView />;
  }
  if (board.view === BoardViews.MAP) {
    return <MapView />;
  }

  let Content;
  if (board.view === BoardViews.KANBAN) {
    Content = KanbanContent;
  } else {
    switch (board.context) {
      case BoardContexts.BOARD:
        Content = FiniteContent;

        break;
      case BoardContexts.ARCHIVE:
      case BoardContexts.TRASH:
        Content = EndlessContent;

        break;
      default:
    }
  }

  let modalNode = null;
  if (isCardModalOpened) {
    modalNode = <CardModal />;
  } else if (modal) {
    switch (modal.type) {
      case ModalTypes.BOARD_ACTIVITIES:
        modalNode = <BoardActivitiesModal />;

        break;
      default:
    }
  }

  return (
    <>
      <ShortcutsProvider>
        <Content />
      </ShortcutsProvider>
      {modalNode}
    </>
  );
});

export default Board;
