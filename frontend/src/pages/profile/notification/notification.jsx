import React, { Component } from 'react';
import { connect } from 'react-redux';

import Validators from '../../../services/forms/validators';
import { validateForm } from '../../../services/forms/validate';
import { Form, Field } from 'react-final-form';

import { extractKey } from '../../../services/helper';
import { NOTIFICATION_ANSWERS } from '../../../enum';
import { UserService } from '../../../services/user/user.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import FlashMessage from '../../../generics/flash-message';

const NOTIFICATION_NAMES = [
  { name: 'bloodEligible', label: 'Quand vous êtes éligible à un nouveau don ?' },
  { name: 'sponsorGodchildCreateDonation', label: 'Quand vos filleul(e)s créaient une nouvelle proposition de don ?' }
];

const FORM_RULES = {
  bloodEligible: [Validators.required()],
  sponsorGodchildCreateDonation: [Validators.required()]
}

class Notification extends Component {

  constructor(props) {
    super(props);

    const notifications = this.props.notificationSettings || {};

    this.state = {
      initialValues: {
        bloodEligible: this.computeValue(notifications, 'bloodEligible'),
        sponsorGodchildCreateDonation: this.computeValue(notifications, 'sponsorGodchildCreateDonation')
      }
    }
  }

  computeValue(notifications, field) {
    if(!notifications.hasOwnProperty(field)) return NOTIFICATION_ANSWERS.YES;
    return notifications[field] ? NOTIFICATION_ANSWERS.YES : NOTIFICATION_ANSWERS.NO;
  }

  static componentWillReceiveProps(nextProps, currentState) {
    const notifications = nextProps.notifications;
    return {
      initialValues: {
        bloodEligible: notifications.bloodEligible || NOTIFICATION_ANSWERS.YES,
        sponsorGodchildCreateDonation: notifications.sponsorGodchildCreateDonation || NOTIFICATION_ANSWERS.YES
      }
    };
  }

  updateUser = (values) => {
    const notificationSettings = {
      bloodEligible: values.bloodEligible === NOTIFICATION_ANSWERS.YES,
      sponsorGodchildCreateDonation: values.sponsorGodchildCreateDonation === NOTIFICATION_ANSWERS.YES,
    }

    UserService.updateUser({ notificationSettings })
    .then(() => {
      const message = 'Vos préférences ont été mis à jour';
      FlashMessageService.createSuccess(message, 'notifications');
    })
    .catch(() => {
      FlashMessageService.createError('Erreur lors de la mise à jour de votre compte. Veuillez réessayer ultérieurement.', 'notifications');
    });
  }


  // RENDER
  renderLine(notification) {
    const yesLabel = notification.name + '-yes';
    const noLabel = notification.name + '-no';

    return (
      <div className="line" key={notification.name}>
        <div className="text">{ notification.label }</div>
        <Field name={notification.name} type="radio" value={NOTIFICATION_ANSWERS.YES}>
          {({ input }) => (
              <div className="input">
                <input {...input} id={yesLabel} name={notification.name} type="radio" value={NOTIFICATION_ANSWERS.YES} />
                <label htmlFor={yesLabel}>Oui</label>
            </div>
          )}
        </Field>
        <Field name={notification.name} type="radio" value={NOTIFICATION_ANSWERS.NO}>
          {({ input }) => (
              <div className="input">
                <input {...input} id={noLabel} name={notification.name} type="radio" value={NOTIFICATION_ANSWERS.NO} />
                <label htmlFor={noLabel}>Non</label>
            </div>
          )}
        </Field>
      </div>
    )
  }
  render() {
    const { initialValues } = this.state;

    return (
      <div className="form block-base">
        <FlashMessage scope="notifications" />

        <Form
          onSubmit={this.updateUser}
          validate={values => validateForm(values, FORM_RULES)}
          initialValues={initialValues}
          render={({ handleSubmit, invalid }) => (
            <form className="notification-form" onSubmit={handleSubmit}>

              {NOTIFICATION_NAMES.map(name => this.renderLine(name))}

              <div className="text-center">
                <label htmlFor="update-notification" className="sr-only">Modifier mes préférences de notifications</label>
                <input id="update-notification" className="btn big" type="submit" value="Modifier mes préférences" disabled={invalid} />
              </div>
            </form>
          )} />
      </div>
    );
  }
}

export default connect(state => extractKey(state, 'user.notificationSettings'))(Notification);