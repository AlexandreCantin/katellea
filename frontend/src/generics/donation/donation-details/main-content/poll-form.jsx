import React, { Component } from 'react';
import cx from 'classnames';

import { POLL_ANSWERS } from '../../../../enum';
import { DonationService } from '../../../../services/donation/donation.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import store from '../../../../services/store';

import Validators from '../../../../services/forms/validators';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../../../services/forms/validate';
import { isEmpty, getLocalStorageValue, saveToLocalStorage } from '../../../../services/helper';


export default class PollForm extends Component {

  constructor(props) {
    super(props);

    this.user = store.getState().user;

    let userAnswers = [];
    if(!isEmpty(this.user)) {
      let userAnswers = this.props.donation.pollAnswers.filter(pollAnswer => pollAnswer.author ? +pollAnswer.author.id === +this.user.id : false);
      if (userAnswers.length) userAnswers = userAnswers[0].answers;
    }

    this.localUserAnswers = {};
    this.formRules = {};
    this.generateFormDatas(userAnswers);

    this.state = {
      userHasAnswerPoll: userAnswers.length !== 0,
      user: this.user
    };
  }


  static getDerivedStateFromProps(nextProps, currentState) {
    if(isEmpty(currentState.user)) return currentState;

    let userAnswers = nextProps.donation.pollAnswers.filter(pollAnswer => pollAnswer.author ? +pollAnswer.author.id === +currentState.user.id : false);
    currentState.userHasAnswerPoll= (userAnswers.length !== 0);
    return currentState;
  }

  /**
   * Generate Form object based on poll content
   * */
  generateFormDatas(userAnswers) {
    this.formRules = {}
    this.localUserAnswers = {};

    // Add name field if user is not logged
    if(isEmpty(this.user)) {
      this.formRules['name'] = [Validators.required(), Validators.minLength(3), Validators.maxLength(150), Validators.alphaDash()];
      this.localUserAnswers['name'] = getLocalStorageValue('name');
    }

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
    const isUpdate = !this.state.userHasAnswerPoll;

    // Guest username
    let username;
    if(!this.user.id) {
      username = values.name.trim();
      delete values.name;
      if(username) saveToLocalStorage({ name: username });

      // Check if the username is already in use
      const usedUsername = this.props.donation.pollAnswers.map(pa => pa.username.toUpperCase() || pa.author.name.toUpperCase());
      if(usedUsername.includes(username.toUpperCase())) {
        FlashMessageService.createError('Ce nom est déjà utilisée.', 'donation');
        return;
      }
    }

    let pollAnswers = Object.values(values);
    const data = username ? { answers: pollAnswers, username } : { answers: pollAnswers };

    DonationService.savePollAnswer(this.props.donation, data, isUpdate, username ? false : true)
      .then(() => FlashMessageService.createSuccess('Vos choix ont été pris en compte.', 'donation'))
      .catch(() => FlashMessageService.createError('Erreur lors de la sauvegarde de vos réponses. Veuillez réessayer ultérieurement', 'donation'));
  }

  renderNameField() {
    return (
      <div className="name-field">
        <Field name="name">
          {({ input, meta }) => (
            <>
              <label htmlFor="name">Votre nom :</label>
              <input {...input} id="name" />

              { meta.error && meta.touched ?
                <span className="alert error">
                  {meta.error === 'required' ? <span>Le champ 'Nom' est obligatoire. Veuillez renseigner ce champs.</span> : null}
                  {meta.error === 'minLength' ? <span>Le champ 'Nom' doit comporter minimum 3 caractères.</span> : null}
                  {meta.error === 'maxLength' ? <span>Le champ 'Nom' ne doit pas dépasser 150 caractères.</span> : null}
                  {meta.error === 'alphaDash' ? <span>Seuls les lettres sont autorisées.</span> : null}
                </span> : null}
            </>
          )}
        </Field>
      </div>
    )
  }
  render() {
    const { donation } = this.props;
    const { userHasAnswerPoll, user } = this.state;

    const hasUser = !isEmpty(user);

    return (
      <Form
        onSubmit={this.savePollAnswer}
        initialValues={this.localUserAnswers}
        validate={values => validateForm(values, this.formRules)}
        render={({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit} className="poll-form text-center">
            { hasUser ? <div>{user.name}</div> : this.renderNameField() }

            {
              donation.pollSuggestions.map((ps, index) => {

                let yesLabel = ''.concat('yes-', index);
                let noLabel = ''.concat('no-', index);
                let maybeLabel = ''.concat('maybe-', index);
                let name = this.generatePollSuggestionName(index);

                const isUnavailable = this.isUnavailableDate(ps.date);

                return (
                  <div key={name} className={cx('poll-answer-choices', { 'red': isUnavailable }, { 'last': index === donation.pollSuggestions.length - 1 })}>
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
              <input className="btn" type="submit" value={hasUser && userHasAnswerPoll ? 'Modifier' : 'Valider'} disabled={invalid} />
            </div>
          </form>
        )} />
    );
  }
}