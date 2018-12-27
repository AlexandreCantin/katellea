import React from 'react';
import DonationEventDate from './event-date';

const DonationEventClosePoll = (props) => {

  const { event } = props;
  const author = event.author;

  return (
    <div className="event donation-comment-create">
      <p>
        Fermeture du sondage par {author.name}, <DonationEventDate date={event.date} />
      </p>
    </div>
  );
}

export default DonationEventClosePoll;
