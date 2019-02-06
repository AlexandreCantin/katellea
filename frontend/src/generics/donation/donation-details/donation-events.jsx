import React, { Component } from 'react';
import { Form, Field } from 'react-final-form';

import DonationEventCreation from './events/create-donation';
import DonationAddPollAnswer from './events/add-poll-answer';
import DonationUpdatePollAnswer from './events/update-poll-answer';
import { DonationService } from '../../../services/donation/donation.service';

import DonationEventComment from './events/comment-event';
import DonationEventClosePoll from './events/close-poll';
import DonationEventQuit from './events/quit';
import DonationEventDone from './events/done';
import DonationResetPoll from './events/reset-poll';

import DonationEventDefinitiveDate from './events/date-confirmed';
import { DONATION_EVENTS } from '../../../enum';

import { validateForm } from '../../../services/forms/validate';
import Validators from '../../../services/forms/validators';
import { isEnter, saveToLocalStorage, getLocalStorageValue } from '../../../services/helper';
import store from '../../../services/store';


export default class DonationEvents extends Component {

  constructor(props) {
    super(props);

    const user = store.getState().user;
    const hasUser = user.id;

    // Form data and rules
    this.initialValues = {};
    this.formRules = { comment: [Validators.required()] }
    if(!hasUser) {
      this.initialValues = { username: getLocalStorageValue('name') };
      this.formRules['username'] = [Validators.required(), Validators.minLength(3), Validators.maxLength(150), Validators.alphaDash()]
    }

    this.state = { user, hasUser }
  }

  sendComment = (values, form) => {
    let isCreation = true;

    // Update (if needed) and save
    if(!this.state.hasUser) {
      this.initialValues = { username: values.username };
      saveToLocalStorage({ name: values.username });
    }

    DonationService.saveComment(this.props.donation, values, isCreation, values.username ? false : true)
      .then(() => {
        form.reset();
        document.getElementById('comment').value = ''; // FIXME: use a preact way
      });
  }

  renderUsernameField() {
    return (
      <div className="name-field">
        <Field name="username">
          {({ input, meta }) => (
            <>
              <label htmlFor="username">Votre nom :</label>
              <input {...input} id="username" />

              { meta.error && meta.touched ?
                <span className="alert error">
                  {meta.error === 'required' ? <span>Le nom est obligatoire.</span> : null}
                  {meta.error === 'minLength' ? <span>Taille minimale: 3 caractères.</span> : null}
                  {meta.error === 'maxLength' ? <span>Taille minimale: 150 caractères.</span> : null}
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
    const { hasUser } = this.state;

    const events = donation.events;

    return (
      <div className="events block-base no-padding ">
        {
          // Note: key value is good as long as there is no live-reload
          events.map((event, index) => {
          if (event.name === DONATION_EVENTS.CREATE_DONATION) return <DonationEventCreation key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.ADD_POLL_ANSWER) return <DonationAddPollAnswer key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.UPDATE_POLL_ANSWER) return <DonationUpdatePollAnswer key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.ADD_COMMENT) return <DonationEventComment key={index} donation={donation} event={event} />;
          else if (event.name === DONATION_EVENTS.CLOSE_POLL) return <DonationEventClosePoll key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.SCHEDULE_DONATION) return <DonationEventDefinitiveDate key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.QUIT) return <DonationEventQuit key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.DONE) return <DonationEventDone key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.RESET_POLL) return <DonationResetPoll key={index} event={event} />;
          return null;
        })}

        <div className="comment-input">
          <Form
            onSubmit={this.sendComment}
            initialValues={this.initialValues}
            validate={values => validateForm(values, this.formRules)}
            render={({ handleSubmit, invalid }) => (
              <form className="form" onSubmit={handleSubmit}>

                { !hasUser ? this.renderUsernameField() : null }

                <Field name="comment">
                  {({ input }) => (
                    <>
                      <label htmlFor="comment" className="sr-only">Votre commentaire</label>
                      <textarea {...input} id="comment" name="comment" onKeyPress={(e) => isEnter(e) ? handleSubmit() : null} placeholder="Entrez votre commentaire"></textarea>
                    </>
                  )}
                </Field>
                <div className="clearfix">
                  <label htmlFor="submit-comment" className="sr-only">Envoyer votre commentaire</label>
                  <input id="submit-comment" type="submit" className="fr btn" value="Commenter" disabled={invalid} />
                </div>
              </form>)}
          />
        </div>
      </div>
    );
  }
}