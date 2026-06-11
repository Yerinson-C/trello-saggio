/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Comment, Icon } from 'semantic-ui-react';
import { useDidUpdate } from '../../../lib/hooks';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { usePopupInClosableContext } from '../../../hooks';
import { isListArchiveOrTrash, isUserStatic } from '../../../utils/record-helpers';
import { BoardMembershipRoles, AttachmentTypes } from '../../../constants/Enums';
import { ClosableContext } from '../../../contexts';
import Edit from './Edit';
import Add from './Add';
import TimeAgo from '../../common/TimeAgo';
import Markdown from '../../common/Markdown';
import ConfirmationStep from '../../common/ConfirmationStep';
import UserAvatar from '../../users/UserAvatar';

import styles from './Item.module.scss';

const AttachmentLink = React.memo(({ id }) => {
  const selectAttachmentById = useMemo(() => selectors.makeSelectAttachmentById(), []);
  const attachment = useSelector((state) => selectAttachmentById(state, id));

  if (!attachment) {
    return null;
  }

  return (
    <a href={attachment.data?.url} target="_blank" rel="noreferrer" className={styles.attachment}>
      <Icon fitted name="file outline" className={styles.attachmentIcon} />
      {attachment.name}
    </a>
  );
});

AttachmentLink.propTypes = {
  id: PropTypes.string.isRequired,
};

const Item = React.memo(({ id }) => {
  const selectCommentById = useMemo(() => selectors.makeSelectCommentById(), []);
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectReplyIdsForCommentId = useMemo(() => selectors.makeSelectReplyIdsForCommentId(), []);
  const selectAttachmentIdsForCommentId = useMemo(
    () => selectors.makeSelectAttachmentIdsForCommentId(),
    [],
  );

  const comment = useSelector((state) => selectCommentById(state, id));
  const user = useSelector((state) => selectUserById(state, comment.userId));
  const replyIds = useSelector((state) => selectReplyIdsForCommentId(state, id));
  const attachmentIds = useSelector((state) => selectAttachmentIdsForCommentId(state, id));

  const isCurrentUser = useSelector(
    (state) => comment.userId === selectors.selectCurrentUserId(state),
  );

  const { canEdit, canDelete, canReply } = useSelector((state) => {
    const { listId } = selectors.selectCurrentCard(state);
    const list = selectListById(state, listId);

    if (isListArchiveOrTrash(list)) {
      return {
        canEdit: false,
        canDelete: false,
        canReply: false,
      };
    }

    const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    let isMember = false;
    let isEditor = false;

    if (boardMembership) {
      isMember = true;
      isEditor = boardMembership.role === BoardMembershipRoles.EDITOR;
    }

    const canEditOrDeleteAsMember =
      isMember &&
      comment.userId === boardMembership.userId &&
      (isEditor || boardMembership.canComment);

    return {
      canEdit: canEditOrDeleteAsMember,
      canDelete: isManager || canEditOrDeleteAsMember,
      canReply: isEditor || (isMember && boardMembership.canComment),
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [isEditOpened, setIsEditOpened] = useState(false);
  const [isReplyOpened, setIsReplyOpened] = useState(false);
  const [, , setIsClosableActive] = useContext(ClosableContext);

  const fileInputRef = useRef(null);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteComment(id));
  }, [id, dispatch]);

  const handleEditClick = useCallback(() => {
    setIsEditOpened(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setIsEditOpened(false);
  }, []);

  const handleReplyClick = useCallback(() => {
    setIsReplyOpened((value) => !value);
  }, []);

  const handleReplySubmit = useCallback(() => {
    setIsReplyOpened(false);
  }, []);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  const handleFileInputChange = useCallback(() => {
    const { files } = fileInputRef.current;

    if (files.length > 0) {
      dispatch(
        entryActions.createCommentAttachmentInCurrentCard(id, {
          type: AttachmentTypes.FILE,
          file: files[0],
        }),
      );
    }

    fileInputRef.current.value = '';
  }, [id, dispatch]);

  useDidUpdate(() => {
    setIsClosableActive(isEditOpened);
  }, [isEditOpened]);

  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  return (
    <Comment>
      {!isCurrentUser && (
        <span className={styles.user}>
          <UserAvatar id={comment.userId} />
        </span>
      )}
      <div className={classNames(styles.content, isCurrentUser && styles.contentWithoutUser)}>
        {isEditOpened ? (
          <Edit commentId={id} onClose={handleEditClose} />
        ) : (
          <div className={classNames(styles.bubble, isCurrentUser && styles.bubbleRight)}>
            <div className={styles.header}>
              {isUserStatic(user)
                ? t(`common.${user.name}`, {
                    context: 'title',
                  })
                : user.name}
            </div>
            <Markdown>{comment.text}</Markdown>
            {attachmentIds.length > 0 && (
              <div className={styles.attachments}>
                {attachmentIds.map((attachmentId) => (
                  <AttachmentLink key={attachmentId} id={attachmentId} />
                ))}
              </div>
            )}
            <Comment.Actions className={styles.information}>
              <span className={styles.date}>
                <TimeAgo date={comment.createdAt} />
              </span>
              {(canEdit || canDelete || canReply) && (
                <span className={styles.actions}>
                  {canReply && comment.isPersisted && (
                    <>
                      <Comment.Action
                        as="button"
                        content={t('action.reply')}
                        onClick={handleReplyClick}
                      />
                      <Comment.Action
                        as="button"
                        content={t('action.attach')}
                        onClick={handleAttachClick}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        onChange={handleFileInputChange}
                      />
                    </>
                  )}
                  {canEdit && (
                    <Comment.Action
                      as="button"
                      content={t('action.edit')}
                      disabled={!comment.isPersisted}
                      onClick={handleEditClick}
                    />
                  )}
                  {canDelete && (
                    <ConfirmationPopup
                      title="common.deleteComment"
                      content="common.areYouSureYouWantToDeleteThisComment"
                      buttonContent="action.deleteComment"
                      onConfirm={handleDeleteConfirm}
                    >
                      <Comment.Action
                        as="button"
                        content={t('action.delete')}
                        disabled={!comment.isPersisted}
                      />
                    </ConfirmationPopup>
                  )}
                </span>
              )}
            </Comment.Actions>
          </div>
        )}
        {isReplyOpened && (
          <div className={styles.reply}>
            <Add parentCommentId={id} autoFocus onSubmit={handleReplySubmit} />
          </div>
        )}
        {replyIds.length > 0 && (
          <Comment.Group className={styles.replies}>
            {replyIds.map((replyId) => (
              <Item key={replyId} id={replyId} />
            ))}
          </Comment.Group>
        )}
      </div>
    </Comment>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Item;
