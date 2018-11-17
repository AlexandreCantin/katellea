import React, { Component } from 'react';

import DonationEventCreation from './events/create-donation';
import DonationAddPollAnswer from './events/add-poll-answer';
import DonationUpdatePollAnswer from './events/update-poll-answer';
import { DonationService } from '../../services/donation/donation.service';

import DonationEventComment from './events/comment-event';
import DonationEventClosePoll from './events/close-poll';
import DonationEventQuit from './events/quit';
import DonationEventDone from './events/done';

import DonationEventDefinitiveDate from './events/date-confirmed';
import { DONATION_EVENTS } from '../../enum';

import { Form, Field } from 'react-final-form';
import { validateForm } from '../../services/forms/validate';
import Validators from '../../services/forms/validators';
import { isEnter } from '../../services/helper';

const FORM_RULES = {
  comment: [Validators.required()]
}

export default class DonationEvents extends Component {

  sendComment = (values, form) => {
    let isCreation = true;

    DonationService.saveComment(this.props.donation, values, isCreation)
      .then(() => {
        form.reset();
        document.getElementById('comment').value = ''; // FIXME: use a preact way
      });
  }

  render() {
    const { donation } = this.props;

    const events = donation.events;

    return (
      <div className="events block-base no-padding ">
        {events.map((event, index) => {
          if (event.name === DONATION_EVENTS.CREATE_DONATION) return <DonationEventCreation key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.ADD_POLL_ANSWER) return <DonationAddPollAnswer key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.UPDATE_POLL_ANSWER) return <DonationUpdatePollAnswer key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.ADD_COMMENT) return <DonationEventComment key={index} donation={donation} event={event} />;
          else if (event.name === DONATION_EVENTS.CLOSE_POLL) return <DonationEventClosePoll key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.SCHEDULE_DONATION) return <DonationEventDefinitiveDate key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.QUIT) return <DonationEventQuit key={index} event={event} />;
          else if (event.name === DONATION_EVENTS.DONE) return <DonationEventDone key={index} event={event} />;
          return null;
        })}

        <div className="comment-input">
          <Form
            onSubmit={this.sendComment}
            validate={values => validateForm(values, FORM_RULES)}
            render={({ handleSubmit, invalid }) => (
              <form className="form" onSubmit={handleSubmit}>

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