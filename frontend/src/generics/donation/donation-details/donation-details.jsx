import React, { Component } from 'react';

import CurrentStep from './current-step';
import DonationEvents from './donation-events';
import Poll from './main-content/poll';
import ShareDonation from './main-content/share-donation';
import DonationActions from './main-content/donation-actions';

import DonationDefinitiveDateForm from './main-content/donation-definitive-date-form';
import DonationDateConfirmed from './main-content/donation-date-confirmed';
import DonationDone from './main-content/donation-done';
import DonationConditions from './donation-conditions';


export default class DonationDetails extends Component {
  static defaultProps = { showTitle: false }

  render() {
    const { donation, isAdmin, adminToken } = this.props;
    const name = donation.getCreatorName();

    return (
      <div>
        {this.props.showTitle ? <h1>Proposition de don de {name}</h1> : null }

        <CurrentStep donation={donation} isMobile={donation.isMobileCollect()} />

        <div className="main-content">
          <div className="actions">
            {donation.isPollEnded() ? <DonationDefinitiveDateForm donation={donation} isAdmin={isAdmin} adminToken={adminToken} /> : null}
            {donation.isScheduled() ? <DonationDateConfirmed donation={donation} isAdmin={isAdmin} adminToken={adminToken} /> : null}
            {donation.isDone() ? <DonationDone donation={donation} isAdmin={isAdmin} adminToken={adminToken} /> : null}
            {donation.isCancelled() ? <div className="alert danger">Ce don a été annulé.</div> : null}

            <DonationActions donation={donation} isAdmin={isAdmin} adminToken={adminToken} />
            {isAdmin && donation.isPollOnGoing() ? <ShareDonation donationToken={donation.donationToken} /> : null}
          </div>

          { console.log(donation) }
          { donation.isPublicDonation ? <DonationConditions /> : null }

          <Poll donation={donation} />
          <DonationEvents donation={donation} />
        </div>
      </div>
    );
  }
}
