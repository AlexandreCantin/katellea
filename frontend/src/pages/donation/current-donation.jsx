import React, { Component } from 'react';
import Helmet from 'react-helmet';

import store from '../../services/store';

import HeaderUser from '../../generics/header/user/header-user';
import Menu from '../../generics/menu/menu';
import FlashMessage from '../../generics/flash-message';
import Loader from '../../generics/loader/loader';
import Breadcrumb from '../../generics/breadcrumb/breadcrumb';
import { extractKey, isEmpty } from '../../services/helper';

import { GoogleAnalyticsService } from '../../services/google-analytics.service';

import { DonationService } from '../../services/donation/donation.service';
import { connect } from 'react-redux';

import EscapeLinks from '../../generics/escape-links/escape-links';
import DonationDetails from '../../generics/donation/donation-details/donation-details';
import NoDonationFound from '../../generics/donation/donation-details/no-donation-found';
import DonationCreateFormModal from '../../generics/donation/donation-create-form/donation-create-form-modal';

require('./donation.scss');

class CurrentDonation extends Component {

  constructor(props) {
    super(props);

    this.user = store.getState().user;

    this.state = {
      loading: this.user.hasCurrentDonation()
    };
  }

  componentDidMount() {
    GoogleAnalyticsService.sendPageView(); // Google Analytics

    // Get current donation
    if (this.user.hasCurrentDonation()) {
      DonationService.getCurrentDonation(this.user.currentDonation)
        .then(() => this.setState({ loading: false }))
        .catch(() => this.setState({ loading: false }));
    }
  }

  isAdmin(donation) {
    if(!donation.createdBy) return false;
    return +this.user.id === +donation.createdBy.id
  }

  // RENDER
  renderUserNewDonation() {
    return (
      <div className="main-content">
        <div className="new-donation block-base text-center">
          <p className="block">Vous n'avez aucune proposition de don en cours.</p>
          <DonationCreateFormModal modalUrl="/don-courant/nouveau-don"/>
        </div>
      </div>
    );
  }
  render() {
    const { donation } = this.props;
    const { loading } = this.state;

    return (
      <div id="donation-page" className="page default">
        <Helmet title="Don en cours" titleTemplate="%s | Katellea" />

        <EscapeLinks links={[
          { href: '#menu', text: 'Menu' },
          { href: '#header', text: 'En-tête de la page' },
          { href: '#main-content', text: 'Contenu principal' },
        ]} />

        <Menu />

        <main>
          <HeaderUser />

          <div className="page-title">
            <div className="title">
              <h1>Proposition de don en cours</h1>
              <Breadcrumb links={[{ href: '/don-courant', text: 'Proposition de don en cours' }]} />
            </div>
          </div>

          <FlashMessage scope="current-donation" doScroll />

          {loading ? <Loader /> : null }
          {!loading && isEmpty(donation) ? (isEmpty(this.user) ?<NoDonationFound /> : this.renderUserNewDonation()) : null }
          {!loading && !isEmpty(donation) ? <DonationDetails donation={donation} isAdmin={this.isAdmin(donation)} /> : null }
        </main>
      </div>
    );
  }
}
export default connect(state => extractKey(state, 'donation'))(CurrentDonation);