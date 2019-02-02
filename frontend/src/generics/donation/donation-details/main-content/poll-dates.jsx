import React from 'react';
import PollSuggestionDate from '../../../../generics/poll-suggestion-date';

const PollDates = ({ donation, removeTrimDiv }) => {

  const donationPollOnGoing = donation.isPollOnGoing();
  const nbPollSuggestions = donation.pollSuggestions.length;
  const isMultipleDay = donation.isMultipleDay();

  return (
    <div className="poll-header">
      { removeTrimDiv ? null : <div>&nbsp;</div> }
      {
        donation.pollSuggestions.map(
          (pollSuggestion, index) => <PollSuggestionDate key={index} isMultipleDay={isMultipleDay} pollSuggestion={pollSuggestion} index={index} nbPollSuggestions={nbPollSuggestions} />
        )
      }
      { removeTrimDiv ? null : (donationPollOnGoing ? <div>&nbsp;</div> : null) }
    </div>
  );
}

export default PollDates;
