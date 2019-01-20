import React, { Component } from 'react';
import Helmet from 'react-helmet';

import HeaderUser from '../../generics/header/user/header-user';
import FlashMessage from '../../generics/flash-message';
import Menu from '../../generics/menu/menu';

import FirstVisitForm from './first-visit-form/first-visit-form';

import AboutContainer from './about/about-container';
import EmailVerified from './email-verified';
import DonationContainer from './donation/donation-container';
import EstablishmentContainer from './establishment/establishment-container';
import PromotionContainer from './promotion/promotion-container';
import StatisticsContainer from './statistics/statistics-container';
import Breadcrumb from '../../generics/breadcrumb/breadcrumb';
import EscapeLinks from '../../generics/escape-links/escape-links';

import { GoogleAnalyticsService } from '../../services/google-analytics.service';

require('./dashboard.scss');

export default class Dashboard extends Component {

  componentDidMount() { GoogleAnalyticsService.sendPageView(); }

  render() {
    return (
      <div id="dashboard" className="page default">
        <Helmet title="Votre tableau de bord" titleTemplate="%s | Katellea" />

        <EscapeLinks links={[
          { href: '#menu', text: 'Menu' },
          { href: '#header', text: 'En-tête de la page' },
          { href: '#main-content', text: 'Contenu principal' },
        ]} />

        <div id="menu" className="sr-only">&nbsp;</div>
        <Menu />

        <main>
          <div id="header" className="sr-only">&nbsp;</div>
          <HeaderUser />

          <div id="main-content" className="sr-only">&nbsp;</div>
          <div className="page-title">
            <div className="title">
              <h1>Tableau de bord</h1>
              <Breadcrumb />
            </div>
          </div>


          <div className="main-content dashboard-items">
            <FlashMessage scope="dashboard" />

            <FirstVisitForm />

            <EmailVerified />

            <DonationContainer />
            <StatisticsContainer />
            <PromotionContainer />
            <AboutContainer />
            <EstablishmentContainer />
          </div>
        </main>

      </div>
    );
  }
}