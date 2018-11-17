import React from 'react';
import PollSuggestionDate from '../../../generics/poll-suggestion-date';

const PollDates = (props) => {

  const { donation, donationPollOnGoing } = props;

  const nbPollSuggestions = donation.pollSuggestions.length;
  const isEstablishmentDonation = donation.isEstablishmentDonation();

  return (
    <div className="poll-header">
      <div>&nbsp;</div>
      {
        donation.pollSuggestions.map(
          (pollSuggestion, index) => <PollSuggestionDate key={index} isEstablishmentDonation={isEstablishmentDonation} pollSuggestion={pollSuggestion} index={index} nbPollSuggestions={nbPollSuggestions} />
        )
      }
      {donationPollOnGoing ? <div>&nbsp;</div> : null}
    </div>
  );
}

export default PollDates;
