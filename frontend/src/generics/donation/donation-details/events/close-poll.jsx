import React from 'react';
import DonationEventDate from './event-date';

const DonationEventClosePoll = (props) => {

  const { event } = props;

  const name = event.username || event.author.name;

  return (
    <div className="event donation-comment-create">
      <p>
        Fermeture du sondage par {name}, <DonationEventDate date={event.date} />
      </p>
    </div>
  );
}

export default DonationEventClosePoll;
