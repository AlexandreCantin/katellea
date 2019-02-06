import React from 'react';
import DonationEventDate from './event-date';

const DonationResetPoll = ({ event }) => {
  const name = event.username || event.author.name;

  return (
    <div className="event donation-reset-poll">
      <p>
        Création d'un nouveau sondage par {name}, <DonationEventDate date={event.date} />
      </p>
    </div>
  );
}

export default DonationResetPoll;