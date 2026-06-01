/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import deletedUserAvatar from '../assets/images/deleted-user.png';

export const StaticUserIds = {
  DELETED: null,
};

const DELETED = {
  id: StaticUserIds.DELETED,
  name: 'deletedUser',
  avatar: {
    thumbnailUrls: {
      cover180: deletedUserAvatar,
    },
  },
};

export const STATIC_USER_BY_ID = {
  [StaticUserIds.DELETED]: DELETED,
};

export default {
  DELETED,
};
