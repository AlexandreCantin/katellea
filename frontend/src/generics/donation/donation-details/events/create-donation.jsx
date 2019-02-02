import React from 'react';
import DonationEventDate from './event-date';

const DonationEventCreation = (props) => {

  const { event } = props;
  const name = event.username || event.author.name;

  return (
    <div className="event donation-comment-create">
      <p>
        Sondage créé par {name}, <DonationEventDate date={event.date} />
      </p>
    </div>
  );
}

export default DonationEventCreation;
