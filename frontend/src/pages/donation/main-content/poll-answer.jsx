import React from 'react';
import { UserService } from '../../../services/user/user.service';

const POLL_ANSWERS_VALUE_TO_LABEL = { YES: 'Oui', NO: 'Non', MAYBE: 'Peut-être' };

const PollAnswer = (props) => {

  const { pollAnswer, donationPollOnGoing } = props;

  return (
    <div className={donationPollOnGoing ? 'poll-answer text-center poll-on-going' : 'poll-answer text-center'}>
      <div>{UserService.getFullName(pollAnswer.author)}</div>
      {pollAnswer.answers.map((answer, index) => <div key={index}>{POLL_ANSWERS_VALUE_TO_LABEL[answer]}</div>)}
      {donationPollOnGoing ? <div>&nbsp;</div> : null}
    </div>
  );
}

export default PollAnswer;
