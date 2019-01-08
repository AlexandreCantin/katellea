import React from 'react';
import DonationEventDate from './event-date';


const DonationUpdatePollAnswer = (props) => {

  const { event } = props;
  const author = event.author;

  return (
    <div className="event donation-add-poll-answer">
      <p>
        {author.name} a modifié ses réponses au sondage, <DonationEventDate date={event.date} />
      </p>
    </div>
  );
}

export default DonationUpdatePollAnswer;
