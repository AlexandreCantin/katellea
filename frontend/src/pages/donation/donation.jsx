import React, { Component } from 'react';
import Helmet from 'react-helmet';

import store from '../../services/store';

import HeaderUser from '../../generics/header/user/header-user';
import Menu from '../../generics/menu/menu';
import FlashMessage from '../../generics/flash-message';
import Loader from '../../generics/loader/loader';
import DonationCreateFormModal from '../../generics/donation/donation-create-form/donation-create-form-modal';
import CurrentStep from './current-step';
import Breadcrumb from '../../generics/breadcrumb/breadcrumb';
import { extractKey, isEmpty } from '../../services/helper';

import { DonationService } from '../../services/donation/donation.service';
import DonationEvents from './donation-events';
import Poll from './main-content/poll';
import ShareDonation from './main-content/share-donation';
import DonationActions from './main-content/donation-actions';
import { connect } from 'react-redux';

import DonationDefinitiveDateForm from './main-content/donation-definitive-date-form';
import DonationDateConfirmed from './main-content/donation-date-confirmed';
import DonationDone from './main-content/donation-done';

require('./donation.scss');

class CurrentDonation extends Component {

  constructor(props) {
    super(props);

    this.user = store.getState().user;

    this.state = {
      loading: this.user.hasCurrentDonation(),
    };
  }

  componentDidMount() {
    // Get current donation
    if (this.user.hasCurrentDonation()) {
      DonationService.getCurrentDonation(this.user.currentDonation)
        .then(() => this.setState({ loading: false }))
        .catch(() => this.setState({ loading: false }));
    }
  }

  // RENDER
  renderDonation() {
    const donation = this.props.donation;

    return (
      <div>
        <CurrentStep donation={donation} isMobile={donation.isMobileCollect()} />

        <div className="main-content">
          <div className="actions">
            {donation.isPollEnded() ? <DonationDefinitiveDateForm donation={donation} /> : null}
            {donation.isScheduled() ? <DonationDateConfirmed donation={donation} /> : null}
            {donation.isDone() ? <DonationDone donation={donation} /> : null}
            {donation.isCancelled() ? <div className="alert danger">Ce don a été annulé.</div> : null}

            <DonationActions donation={donation} />
            {+this.user.id === +donation.createdBy.id && donation.isPollOnGoing() ? <ShareDonation donationToken={donation.donationToken} /> : null}
          </div>

          <Poll donation={donation} />
          <DonationEvents donation={donation} />
        </div>
      </div>
    );
  }

  render() {
    const { donation } = this.props;
    const { loading } = this.state;

    let showDonation = !loading && !isEmpty(donation);

    return (
      <div id="donation-page" className="page default">
        <Helmet title="Don en cours" titleTemplate="%s | Katellea" />

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

          {loading ? <Loader /> : null}
          {showDonation ? this.renderDonation() : <DonationCreateFormModal /> }
        </main>
      </div>
    );
  }
}
export default connect(state => extractKey(state, 'donation'))(CurrentDonation);