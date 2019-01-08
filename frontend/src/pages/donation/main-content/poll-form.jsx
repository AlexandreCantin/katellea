import React, { Component } from 'react';

import { POLL_ANSWERS } from '../../../enum';
import { DonationService } from '../../../services/donation/donation.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import store from '../../../services/store';

import Validators from '../../../services/forms/validators';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../../services/forms/validate';


export default class PollForm extends Component {

  constructor(props) {
    super(props);

    const user = store.getState().user;

    let userAnswers = this.props.donation.pollAnswers.filter(pollAnswer => +pollAnswer.author.id === +user.id);
    if (userAnswers.length) userAnswers = userAnswers[0].answers;

    // Will be initi
    this.localUserAnswers = {};
    this.formRules = {};
    this.generateFormDatas(userAnswers);

    this.state = {
      userHasAnswerPoll: userAnswers.length !== 0,
      user: user
    };
  }


  static getDerivedStateFromProps(nextProps, currentState) {
    let userAnswers = nextProps.donation.pollAnswers.filter(pollAnswer => +pollAnswer.author.id === +currentState.user.id);
    currentState.userHasAnswerPoll= (userAnswers.length !== 0);
    return currentState;
  }

  /**
   * Generate Form object based on poll content
   * */
  generateFormDatas(userAnswers) {
    this.formRules = {}
    this.localUserAnswers = {};

    this.props.donation.pollSuggestions.forEach((ps, index) => {
      let fieldName = this.generatePollSuggestionName(index);
      const isUnavailable = this.isUnavailableDate(ps.date);

      // Compute response
      let response = userAnswers[index] || POLL_ANSWERS.YES;
      if (isUnavailable) response = POLL_ANSWERS.NO;

      this.formRules[fieldName] = [Validators.required()];
      this.localUserAnswers[fieldName] = response;
    });
  }

  generatePollSuggestionName(index) {
    return ''.concat(index, '-suggestion');
  }

  isUnavailableDate(date) {
    return this.props.unavailablePollSuggestions.filter(upsDate => upsDate.date === date).length > 0;
  }

  savePollAnswer = (values) => {
    let pollAnswers = Object.values(values);
    DonationService.savePollAnswer(this.props.donation, pollAnswers, !this.state.userHasAnswerPoll)
      .then(() => {
        FlashMessageService.createSuccess('Vos choix ont été pris en compte.', 'current-donation');
      })
      .catch(() => {
        FlashMessageService.createError('Erreur lors de la sauvegarde de vos réponses. Veuillez réessayer ultérieurement', 'current-donation');
      });
  }

  render() {
    const { donation } = this.props;
    const { userHasAnswerPoll, user } = this.state;

    return (
      <Form
        onSubmit={this.savePollAnswer}
        initialValues={this.localUserAnswers}
        validate={values => validateForm(values, this.formRules)}
        render={({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit} className="poll-form text-center">
            <div>{user.name}</div>

            {
              donation.pollSuggestions.map((ps, index) => {

                let yesLabel = ''.concat('yes-', index);
                let noLabel = ''.concat('no-', index);
                let maybeLabel = ''.concat('maybe-', index);
                let name = this.generatePollSuggestionName(index);

                const isUnavailable = this.isUnavailableDate(ps.date);

                let cssClass = 'poll-answer-choices';
                if (isUnavailable) cssClass = cssClass.concat(' red');
                if (index === donation.pollSuggestions.length - 1) cssClass = cssClass.concat(' last');

                return (
                  <div key={index} className={cssClass}>
                    <Field name={name} type="radio" value={POLL_ANSWERS.YES}>
                      {({ input }) => (
                        <div>
                          <input {...input} id={yesLabel} name={name} type="radio" value={POLL_ANSWERS.YES} />
                          <label htmlFor={yesLabel}>Oui</label>
                        </div>
                      )}
                    </Field>

                    <Field name={name} type="radio" value={POLL_ANSWERS.NO}>
                      {({ input }) => (
                        <div>
                          <input {...input} id={noLabel} name={name} type="radio" value={POLL_ANSWERS.NO} />
                          <label htmlFor={noLabel}>Non</label>
                        </div>
                      )}
                    </Field>

                    <Field name={name} type="radio" value={POLL_ANSWERS.MAYBE}>
                      {({ input }) => (
                        <div>
                          <input {...input} id={maybeLabel} name={name} type="radio" value={POLL_ANSWERS.MAYBE} />
                          <label htmlFor={maybeLabel}>Peut-être</label>
                        </div>
                      )}
                    </Field>
                  </div>
                );
              })
            }
            <div className="text-center">
              <input className="btn" type="submit" value={userHasAnswerPoll ? 'Modifier' : 'Valider'} disabled={invalid} />
            </div>
          </form>
        )} />
    );
  }
}