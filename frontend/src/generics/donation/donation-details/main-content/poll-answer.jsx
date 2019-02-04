import React from 'react';
import EditPollAnswer from './edit-poll-answer';
import cx from 'classnames';

const POLL_ANSWERS_VALUE_TO_LABEL = { YES: 'Oui', NO: 'Non', MAYBE: 'Peut-être' };

const PollAnswer = ({ donation, pollAnswer }) => {

  const donationPollOnGoing = donation.isPollOnGoing();
  const canBeEdited = pollAnswer.username && donationPollOnGoing;
  const name = pollAnswer.username || pollAnswer.author.name;
  const isRegisteredUser = pollAnswer.author;

  return (
    <div className={cx('poll-answer text-center', { 'poll-on-going' : donationPollOnGoing })}>
      <div>
        { isRegisteredUser ?  <img src="/icons/user.svg" alt="Utilisateur enregistré" title="Utilisateur enregistré" /> : null }
        {name}
        { canBeEdited ? <EditPollAnswer donation={donation} pollAnswer={pollAnswer} /> : null }
      </div>
      {pollAnswer.answers.map(answer => <div key={pollAnswer._id}>{POLL_ANSWERS_VALUE_TO_LABEL[answer]}</div>)}
      {donationPollOnGoing ? <div>&nbsp;</div> : null}
    </div>
  );
}

export default PollAnswer;
