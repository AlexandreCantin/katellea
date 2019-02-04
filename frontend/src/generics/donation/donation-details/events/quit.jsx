import React from 'react';

import DonationEventDate from './event-date';

const DonationEventQuit = ({ event }) => {
  const name = event.username || event.author.name;

  return (
    <div className="event donation-quit">
      <p className="block">{name} a quitté la proposition de don.</p>
      {event.comment ? <p><em>Avec le message :</em> {event.comment}</p> : null }
      <p className="block"><DonationEventDate date={event.date} /></p>
    </div>
  );
}

export default DonationEventQuit;