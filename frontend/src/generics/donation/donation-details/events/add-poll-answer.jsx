import React from 'react';
import DonationEventDate from './event-date';

const DonationAddPollAnswer = ({ event }) => {
  const name = event.username || event.author.name;

  return (
    <div className="event donation-add-poll-answer">
      <p>
        {name} a répondu au sondage, <DonationEventDate date={event.date} />
      </p>
    </div>
  );
}


export default DonationAddPollAnswer;
