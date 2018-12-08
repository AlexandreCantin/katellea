import React, { Component } from 'react';
import Helmet from 'react-helmet';

import { GoogleAnalyticsService } from '../../services/google-analytics.service';

import Menu from '../../generics/menu/menu';
import FlashMessage from '../../generics/flash-message';

import UpdateAccountForm from './update-account-form';
import DeleteAccountForm from './delete-account-form';
import ActivePlateletForm from './activate-platelet-form';
import HeaderUser from '../../generics/header/user/header-user';
import Breadcrumb from '../../generics/breadcrumb/breadcrumb';
import EscapeLinks from '../../generics/escape-links/escape-links';

require('./account.scss');

export default class Account extends Component {

  componentDidMount() { GoogleAnalyticsService.sendPageView(); }

  render() {
    return (
      <div id="account-page" className="page default">
        <Helmet title="Modifier votre compte" titleTemplate="%s | Katellea" />

        <EscapeLinks links={[
          { href: '#menu', text: 'Menu' },
          { href: '#header', text: 'En-tête de la page' },
          { href: '#main-content', text: 'Contenu principal' },
        ]} />

        <div id="menu" className="sr-only">&nbsp;</div>
        <Menu />

        <main>
          <div id="header" className="sr-only" >&nbsp;</div>
          <HeaderUser />

          <div id="main-content" className="page-title">
            <div className="title">
              <h1>Votre compte</h1>
              <em className="subtitle">Gérer ici votre compte : informations personnelles, notifications etc.</em>
            </div>
            <Breadcrumb links={[{ href: '/votre-compte', text: 'Votre compte' }]} />
          </div>

          <FlashMessage scope="account" />

          <div className="main-content">
            <UpdateAccountForm />
            <ActivePlateletForm />
            <DeleteAccountForm />
          </div>
        </main>
      </div>
    );
  }
}