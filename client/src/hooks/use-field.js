/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { useCallback, useState } from 'react';

export default (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((_, { value: nextValue }) => {
    setValue(nextValue);
  }, []);

  return [value, handleChange, setValue];
};
