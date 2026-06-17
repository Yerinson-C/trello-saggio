/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import Config from './Config';

const ROOT = `${Config.BASE_PATH}/`;
const LOGIN = `${Config.BASE_PATH}/login`;
const OIDC_CALLBACK = `${Config.BASE_PATH}/oidc-callback`;
const PROJECTS = `${Config.BASE_PATH}/projects/:id`;
const BOARDS = `${Config.BASE_PATH}/boards/:id`;
const CARDS = `${Config.BASE_PATH}/cards/:id`;
const ADMIN_USERS = `${Config.BASE_PATH}/admin/users`;
const ADMIN_PROJECTS = `${Config.BASE_PATH}/admin/projects`;
const CRM = `${Config.BASE_PATH}/crm`;
const DASHBOARD = `${Config.BASE_PATH}/dashboard`;
const CALCULADORA = Config.BASE_PATH + '/calculadora';
const REDUCCION = Config.BASE_PATH + '/reduccion';
const FACTURACION = Config.BASE_PATH + '/facturacion';
const PORTAL_CLIENTE = Config.BASE_PATH + '/portal/:projectId';
const EQUIPO = Config.BASE_PATH + '/equipo';

export default {
  ROOT,
  LOGIN,
  OIDC_CALLBACK,
  PROJECTS,
  BOARDS,
  CARDS,
  ADMIN_USERS,
  ADMIN_PROJECTS,
  CRM,
  DASHBOARD,
  CALCULADORA,
  REDUCCION,
  FACTURACION,
  PORTAL_CLIENTE,
  EQUIPO,
};
