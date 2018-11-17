import React, { Component } from 'react';

import store from '../../../services/store';
import PollSuggestionDate from '../../../generics/poll-suggestion-date';
import { UserService } from '../../../services/user/user.service';
import { dateFormatShortDayDayMonthYear } from '../../../services/date-helper';


export default class DonationToSubscribe extends Component {

  constructor(props) {
    super(props);
    this.userHasCurrentDonation = store.getState().user.hasCurrentDonation();
  }

  subscribeToDonation = (e) => {
    let donationId = +e.target.attributes['data-donation-id'].value;
    UserService.updateUser({ currentDonation: donationId });
  }

  render() {
    const { donation } = this.props;
    const nbPollSuggestions = donation.pollSuggestions.length;
    const isEstablishmentDonation = donation.establishment !== undefined;

    return (
      <div className="donation-to-subscribe">
        <div>
          <div><span className="bold">Créé par</span> : {UserService.getFullName(donation.createdBy)}, le {dateFormatShortDayDayMonthYear(donation.createdAt)}</div>
          <div><span className="bold">Lieu</span>  : {isEstablishmentDonation ? `${donation.establishment.name}, ${donation.establishment.address}` : donation.mobileCollect}</div>
          <div className="dates">
            <div className="label"><span className="bold">Dates proposées</span> :</div>
            {
              donation.pollSuggestions.map(
                (pollSuggest, index) => <PollSuggestionDate key={index} isEstablishmentDonation={isEstablishmentDonation} pollSuggestion={pollSuggest} index={index} nbPollSuggestions={nbPollSuggestions} />
              )
            }
          </div>
        </div>
        <button className="btn" data-donation-id={donation._id} onClick={this.subscribeToDonation}>Rejoindre</button>
      </div>
    );
  }
}