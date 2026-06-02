/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import isURL from 'validator/lib/isURL';

const USERNAME_REGEX = /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/;

export const isUrl = (string) =>
  isURL(string, {
    protocols: ['http', 'https'],
    require_tld: false,
    require_protocol: true,
    max_allowed_length: 2048,
  });

/**
 * Password policy: min 8 chars + at least one uppercase letter.
 */
export const isPassword = (string) =>
  typeof string === 'string' &&
  string.length >= 8 &&
  /[A-Z]/.test(string);

export const getPasswordError = (string) => {
  if (!string || string.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(string)) return 'Debe contener al menos una letra mayúscula';
  return null;
};

export const isUsername = (string) =>
  string.length >= 3 && string.length <= 32 && USERNAME_REGEX.test(string);
