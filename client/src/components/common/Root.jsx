/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router';
import { ThemeProvider, ToasterProvider } from '@gravity-ui/uikit';
// eslint-disable-next-line import/no-unresolved
import { toaster } from '@gravity-ui/uikit/toaster-singleton';
import { ReduxRouter } from '../../lib/redux-router';

import Paths from '../../constants/Paths';
import Login from './Login';
import Core from './Core';
import AdminUsersPage from './AdminUsersPage';
import ProjectsPage from './ProjectsPage';
import CrmPage from './CrmPage/CrmPage';
import DashboardPage from './DashboardPage';
import CalculadoraPage from './CalculadoraPage';
import PortalClientePage from './PortalClientePage';
import FacturacionPage from './FacturacionPage';
import ReduccionPage from './ReduccionPage';
import GhostError from './GhostError';

import 'react-datepicker/dist/react-datepicker.css';
import 'photoswipe/dist/photoswipe.css';
import '@gravity-ui/uikit/styles/styles.css';
import '../../lib/custom-ui/styles.css';

import '../../styles.module.scss';

function Root({ store, history }) {
  return (
    <Provider store={store}>
      <ReduxRouter history={history}>
        <ThemeProvider theme="light">
          <ToasterProvider toaster={toaster}>
            <Routes>
              <Route path={Paths.LOGIN} element={<Login />} />
              <Route path={Paths.OIDC_CALLBACK} element={<Login />} />
              <Route path={Paths.ROOT} element={<Core />} />
              <Route path={Paths.PROJECTS} element={<Core />} />
              <Route path={Paths.BOARDS} element={<Core />} />
              <Route path={Paths.CARDS} element={<Core />} />
              <Route path={Paths.ADMIN_USERS} element={<Core adminPage={<AdminUsersPage />} />} />
              <Route path={Paths.ADMIN_PROJECTS} element={<Core adminPage={<ProjectsPage />} />} />
              <Route path={Paths.CRM} element={<Core adminPage={<CrmPage />} />} />
              <Route path={Paths.DASHBOARD} element={<Core adminPage={<DashboardPage />} />} />
              <Route path={Paths.CALCULADORA} element={<Core adminPage={<CalculadoraPage />} />} />
              <Route path={Paths.REDUCCION} element={<Core adminPage={<ReduccionPage />} />} />
              <Route path={Paths.FACTURACION} element={<Core adminPage={<FacturacionPage />} />} />
              <Route path={Paths.PORTAL_CLIENTE} element={<PortalClientePage />} />
              <Route path="*" element={<GhostError />} />
            </Routes>
          </ToasterProvider>
        </ThemeProvider>
      </ReduxRouter>
    </Provider>
  );
}

Root.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
};

export default Root;
