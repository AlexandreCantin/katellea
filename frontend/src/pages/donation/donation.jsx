import React, { Component } from 'react';
import Helmet from 'react-helmet';
import cx from 'classnames';
import { connect } from 'react-redux';

import store from '../../services/store';

import HeaderUser from '../../generics/header/user/header-user';
import Menu from '../../generics/menu/menu';
import { extractKey, isEmpty, getParameterByName } from '../../services/helper';

import { GoogleAnalyticsService } from '../../services/google-analytics.service';
import HeaderHome from '../../generics/header/home/header-home';
import EscapeLinks from '../../generics/escape-links/escape-links';
import { DonationService } from '../../services/donation/donation.service';
import Loader from '../../generics/loader/loader';
import DonationDetails from '../../generics/donation/donation-details/donation-details';
import FlashMessage from '../../generics/flash-message';
import NoDonationFound from '../../generics/donation/donation-details/no-donation-found';

require('./donation.scss');

class Donation extends Component {

  constructor(props) {
    super(props);

    this.user = store.getState().user;

    this.state = {
      loadingDonation: true,
      loadingIsAdmin: true,

      adminToken: getParameterByName('admin'),
      isDonationAdmin: false,
      hasUser: !isEmpty(store.getState().user),
    };
  }

  componentDidUpdate() {
    // Check is user isAdmin
    if (!isEmpty(this.props.donation) && this.state.loadingIsAdmin) {
      // Is register user is admin
      if (this.props.donation.isCreator(this.user.id)) {
        this.setState({ isDonationAdmin: true, loadingIsAdmin: false});
        return;
      } else if (this.state.adminToken) {
        DonationService.isDonationAdmin(this.props.donationToken, this.state.adminToken)
          .then(() => this.setState({ isDonationAdmin: true, loadingIsAdmin: false }))
          .catch(() => this.setState({ isDonationAdmin: false, loadingIsAdmin: false }));
      } else {
        this.setState({ isDonationAdmin: false, loadingIsAdmin: false });
      }
    }
  }

  componentDidMount() {
    GoogleAnalyticsService.sendPageView(); // Google Analytics

    // Get current donation
    if (this.props.donationToken) {
      DonationService.getDonationByToken(this.props.donationToken)
        .then(() => this.setState({ loadingDonation: false }))
        .catch(() => this.setState({ loadingDonation: false, loadingIsAdmin: false }));
    }
  }

  // RENDER
  render() {
    const { donation } = this.props;
    const { loadingDonation, loadingIsAdmin, hasUser, isDonationAdmin, adminToken } = this.state;

    const loading = loadingDonation || loadingIsAdmin;


    let escapeLinks = [];
    escapeLinks.push({ href: '#header', text: 'En-tête de la page' });
    if (hasUser) escapeLinks.push({ href: '#menu', text: 'Menu' });
    escapeLinks.push({ href: '#main-content', text: 'Contenu principal' });

    return (
      <div id="donation-page" className={cx('page', { 'default': hasUser })}>
        <Helmet title="Proposition de don" titleTemplate="%s | Katellea" />

        <EscapeLinks links={escapeLinks} />

        <div id="header" className="sr-only">&nbsp;</div>
        {hasUser ? <HeaderUser /> : <HeaderHome />}

        {hasUser ? <div id="menu" className="sr-only">&nbsp;</div> : null}
        {hasUser ? <Menu /> : null}


        <div id="main-content" className="sr-only">&nbsp;</div>
        <main className={cx('main-content' , { 'no-user': !hasUser })}>
          <FlashMessage scope="donation" doScroll />

          {loading ? <Loader /> : null}
          {!loading && isEmpty(donation) ? <NoDonationFound /> : null}
          {!loading && !isEmpty(donation) ? <DonationDetails donation={donation} isAdmin={isDonationAdmin} adminToken={adminToken} showTitle /> : null}
        </main>
      </div>
    );
  }
}

export default connect(state => extractKey(state, 'donation'))(Donation);