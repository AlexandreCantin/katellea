import React from 'react';
import DonationEventDate from './event-date';

const DonationEventCreation = (props) => {

  const { event } = props;
  const author = event.author;

  return (
    <div className="event donation-comment-create">
      <p>
        Sondage créé par {author.firstName} {author.lastName}, <DonationEventDate date={event.date} />
      </p>
    </div>
  );
}

export default DonationEventCreation;
