/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createWebhook = (data) => ({
  type: EntryActionTypes.WEBHOOK_CREATE,
  payload: {
    data,
  },
});

const handleWebhookCreate = (webhook) => ({
  type: EntryActionTypes.WEBHOOK_CREATE_HANDLE,
  payload: {
    webhook,
  },
});

const updateWebhook = (id, data) => ({
  type: EntryActionTypes.WEBHOOK_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleWebhookUpdate = (webhook) => ({
  type: EntryActionTypes.WEBHOOK_UPDATE_HANDLE,
  payload: {
    webhook,
  },
});

const deleteWebhook = (id) => ({
  type: EntryActionTypes.WEBHOOK_DELETE,
  payload: {
    id,
  },
});

const handleWebhookDelete = (webhook) => ({
  type: EntryActionTypes.WEBHOOK_DELETE_HANDLE,
  payload: {
    webhook,
  },
});

export default {
  createWebhook,
  handleWebhookCreate,
  updateWebhook,
  handleWebhookUpdate,
  deleteWebhook,
  handleWebhookDelete,
};
