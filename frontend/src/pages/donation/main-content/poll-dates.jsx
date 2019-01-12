import React from 'react';
import PollSuggestionDate from '../../../generics/poll-suggestion-date';

const PollDates = (props) => {

  const { donation, donationPollOnGoing } = props;

  const nbPollSuggestions = donation.pollSuggestions.length;
  const isMultipleDay = donation.isMultipleDay();

  return (
    <div className="poll-header">
      <div>&nbsp;</div>
      {
        donation.pollSuggestions.map(
          (pollSuggestion, index) => <PollSuggestionDate key={index} isMultipleDay={isMultipleDay} pollSuggestion={pollSuggestion} index={index} nbPollSuggestions={nbPollSuggestions} />
        )
      }
      {donationPollOnGoing ? <div>&nbsp;</div> : null}
    </div>
  );
}

export default PollDates;
