/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { useCallback, useRef } from 'react';

export default (nestedRefName = 'ref') => {
  const ref = useRef(null);

  const handleRef = useCallback(
    (element) => {
      ref.current = element?.[nestedRefName].current;
    },
    [nestedRefName],
  );

  return [ref, handleRef];
};
