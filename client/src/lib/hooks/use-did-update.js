/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { useEffect, useRef } from 'react';

export default (callback, dependencies) => {
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (isMountedRef.current) {
      callback();
    } else {
      isMountedRef.current = true;
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};
