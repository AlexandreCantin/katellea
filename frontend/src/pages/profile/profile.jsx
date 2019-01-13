import React, { Component } from 'react';
import Helmet from 'react-helmet';

import { GoogleAnalyticsService } from '../../services/google-analytics.service';

import Menu from '../../generics/menu/menu';
import FlashMessage from '../../generics/flash-message';

import HeaderUser from '../../generics/header/user/header-user';
import EscapeLinks from '../../generics/escape-links/escape-links';
import Breadcrumb from '../../generics/breadcrumb/breadcrumb';

import UpdateAccountForm from './account/update-account-form';
import DeleteAccountForm from './account/delete-account-form';
import ActivePlateletForm from './account/activate-platelet-form';
import GRPDExport from './grpd/grpd-export';
import Notification from './notification/notification';

import { computeTabAttributes, computeTabPanelAttributes } from '../../services/tab-helper';
import { getParameterByName } from '../../services/helper';

require('./profile.scss');

const ACCOUNT_TAB = 'mon-compte';
const GRPD_TAB = 'rgpd';
const NOTIFICATION_TAB = 'notifications';

export default class Profile extends Component {

  constructor(props) {
    super(props);

    const selectTab = getParameterByName('tab') || ACCOUNT_TAB;

    this.state = { selectTab }
  }

  componentDidMount() { GoogleAnalyticsService.sendPageView(); }


  cssClass = (tabName) => {
    let cssClasses = 'reset text-center';
    return this.state.selectTab === tabName ? cssClasses.concat(' selected') : cssClasses;
  }

  selectTab = (e) => {
    const target = e.target.id;
    GoogleAnalyticsService.sendEvent('dashboard-establishment-tab', target, 'Select ' + target);
    this.setState({ selectTab: target });
  }

  // RENDER
  renderAccount() {
    return (
      <div {...computeTabPanelAttributes(ACCOUNT_TAB, 'account')}>
        <FlashMessage scope="account" />

        <UpdateAccountForm />
        <ActivePlateletForm />
        <DeleteAccountForm />
      </div>
    );
  }
  renderGRPD() {
    return (
      <div {...computeTabPanelAttributes(GRPD_TAB)}><GRPDExport /></div>
    );
  }
  renderNotification() {
      return (
        <div {...computeTabPanelAttributes(NOTIFICATION_TAB, 'notification')}><Notification /></div>
    );
  }

  render() {
    const { selectTab } = this.state;

    return (
      <div id="profile-page" className="page default">
        <Helmet title="Mon profil" titleTemplate="%s | Katellea" />

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
              <h1>Mon profil</h1>
              <em className="subtitle">Gérer ici votre profil : informations personnelles, notifications etc.</em>
            </div>
            <Breadcrumb links={[{ href: '/mon-profil', text: 'Mon profil' }]} />
          </div>

          <div className="main-content">

            <div className="tabs" role="tablist">
              <button {...computeTabAttributes(ACCOUNT_TAB, selectTab, this.cssClass(ACCOUNT_TAB))} onClick={this.selectTab}>Mon compte</button>
              <button {...computeTabAttributes(NOTIFICATION_TAB, selectTab, this.cssClass(NOTIFICATION_TAB))} onClick={this.selectTab}>Notifications</button>
              <button {...computeTabAttributes(GRPD_TAB, selectTab, this.cssClass(GRPD_TAB))} onClick={this.selectTab}>RGPD</button>
            </div>

            {selectTab === ACCOUNT_TAB ? this.renderAccount() : null}
            {selectTab === NOTIFICATION_TAB ? this.renderNotification() : null}
            {selectTab === GRPD_TAB ? this.renderGRPD() : null}

          </div>
        </main>
      </div>
    );
  }
}