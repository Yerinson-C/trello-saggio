/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { useCallback, useState } from 'react';

// TODO: rename?
export default (initialParams) => {
  const [modal, setModal] = useState(() => initialParams);

  const open = useCallback((params) => {
    setModal(params);
  }, []);

  const handleClose = useCallback(() => {
    setModal(null);
  }, []);

  return [modal, open, handleClose];
};
