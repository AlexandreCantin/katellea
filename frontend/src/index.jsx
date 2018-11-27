import React, { Component, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from "@reach/router";
import 'babel-polyfill'; // Mainly for 'fetch as Google'
import * as serviceWorker from './serviceWorker';
import * as Sentry from '@sentry/browser';

import store from './services/store';

import NotFound from './pages/404/not-found';
import Home from './pages/home/home';
import TokenRoute from './pages/token-route';
import Register from './pages/register/register';
import { CouldHaveUserRoute } from './generics/routes/could-have-user-route';
import { PrivateRoute } from './generics/routes/private-route';

// Config dayjs
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import Loader from './generics/loader/loader';
import ErrorBoundary from './generics/error-boundary';
import { environment } from './environment';
dayjs.locale('fr');
dayjs.extend(relativeTime);

// Lazy component
const LegalTerms = lazy(() => import('./pages/legal-terms/legal-terms'));
const OurMissionAndTeam = lazy(() => import('./pages/our-mission-and-team/our-mission-and-team'));
const ContactForm = lazy(() => import('./pages/contact-form/contact-form'));
const Dashboard = lazy(() => import('./pages/dashboard/dashboard'));
const Account = lazy(() => import('./pages/account/account'));
const CurrentDonation = lazy(() => import('./pages/donation/donation'));
const DonationHistory = lazy(() => import('./pages/history/donation-history'));

require('./styles/global.scss');

// Sentry
if (environment.SENTRY_CODE && environment.SENTRY_CODE !== '') {
  Sentry.init({ dsn: environment.SENTRY_CODE });
}

class App extends Component {


  /** IMPORTANT
   * => DO NOT FORGET TO UPDATE react-proxy-routes.js <=
   */
  render() {
    return (
      <Provider store={store}>
        <ErrorBoundary>
          <div id="app">
            <Suspense fallback={<Loader />}>
              <Router>
                <Home path="/" exact />
                <Register path="/creer-votre-compte" />
                <TokenRoute path="/token" />

                <CouldHaveUserRoute component={LegalTerms} path="/mentions-legales" />
                <CouldHaveUserRoute component={OurMissionAndTeam} path="/notre-mission-et-notre-equipe" />
                <CouldHaveUserRoute component={ContactForm} path="/nous-contacter" />

                <PrivateRoute component={Dashboard} path="/tableau-de-bord" />
                <PrivateRoute component={Account} path="/mon-compte" />
                <PrivateRoute component={CurrentDonation} path="/don-courant" />
                <PrivateRoute component={DonationHistory} path="/historique-des-dons" />

                <NotFound type="404" default />
              </Router>
            </Suspense>
          </div>
        </ErrorBoundary>
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));




// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
