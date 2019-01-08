import React from 'react';

const POLL_ANSWERS_VALUE_TO_LABEL = { YES: 'Oui', NO: 'Non', MAYBE: 'Peut-être' };

const PollAnswer = (props) => {

  const { pollAnswer, donationPollOnGoing } = props;

  return (
    <div className={donationPollOnGoing ? 'poll-answer text-center poll-on-going' : 'poll-answer text-center'}>
      <div>{pollAnswer.author.name}</div>
      {pollAnswer.answers.map((answer, index) => <div key={index}>{POLL_ANSWERS_VALUE_TO_LABEL[answer]}</div>)}
      {donationPollOnGoing ? <div>&nbsp;</div> : null}
    </div>
  );
}

export default PollAnswer;
