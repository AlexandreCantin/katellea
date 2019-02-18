import React, { Component } from 'react';
import dayjs from 'dayjs';
import slugify from 'slugify';
import cx from 'classnames';
import PropTypes from 'prop-types';

import store from '../../../../services/store';
import PhoneLink from '../../../../generics/phone-link';

import { DonationService } from '../../../../services/donation/donation.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';

import FlashMessage from '../../../../generics/flash-message';
import Modal from '../../../../generics/modal';

import Validators from '../../../../services/forms/validators';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../../../services/forms/validate';
import { isEmpty } from '../../../../services/helper';
import { DONATION_STATUS } from '../../../../enum';

const FORM_RULES = {
  finalDate: [Validators.required(), Validators.dateAfterToday()],
  finalAttendees: [Validators.minLength(1)]
}

export default class DonationDefinitiveDateForm extends Component {
  static propTypes = {
    donation: PropTypes.object.isRequired,
    adminToken: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);

    this.user = store.getState().user;

    this.initialValues = {}
    //if(!isEmpty(this.user)) this.initialValues = { finalAttendees: [this.props.donation.createdBy.id] };
    //else this.initialValues = { finalAttendees: [this.props.donation.createdByGuest.name] };

    this.state = {
      showDefinitiveDateModal: false,
      isCreator: this.props.isAdmin || this.props.donation.isCreator(this.user.id),
    };
  }


  addDefinitiveDateAndAttendees = (values) => {
    const { finalAttendeesUser, finalAttendeesGuest } = DonationService.separateGuestAndUser(values.finalAttendees);

    values.status = DONATION_STATUS.DATE_CONFIRMED;
    values.finalDate = dayjs(values.finalDate).toISOString();

    DonationService.updateDonation({
      finalDate: dayjs(values.finalDate).toISOString(),
      status: DONATION_STATUS.DATE_CONFIRMED,
      finalAttendeesUser,
      finalAttendeesGuest
    }, this.props.adminToken)
      .then(() => {
        FlashMessageService.createSuccess('Le don a été mis à jour', 'definitive-date');
        setTimeout(() => this.closeDefinitiveDateModal(), 1500);
      }).catch(() => FlashMessageService.createError('Erreur lors de la mise à jour du don. Veuillez réessayer ultérieurement.', 'definitive-date'));
  }

  showDefinitiveDateModal = () => this.setState({ showDefinitiveDateModal: true });
  closeDefinitiveDateModal = () => this.setState({ showDefinitiveDateModal: false });


  renderDefinitiveDateModal() {
    return (
      <Modal cssClass="definitive-date-form" title="Indiquer la date définitive du don" onClose={this.closeDefinitiveDateModal} modalUrl="/donation/date-definitive">
        <FlashMessage scope="definitive-date" />

        <>
          <Form
            onSubmit={this.addDefinitiveDateAndAttendees}
            initialValues={this.initialValues}
            validate={values => validateForm(values, FORM_RULES)}
            render={({ handleSubmit, invalid, values }) => (
              <form className="form" onSubmit={handleSubmit}>
                <Field name="finalDate">
                  {({ input, meta }) => (
                    <div className="form-line text-center date">
                      <div>
                        <label htmlFor="finalDate">Date et heure du don :</label>
                        <input {...input} id="finalDate" type="datetime-local" name="finalDate" />
                      </div>

                      {
                        meta.error && meta.touched ?
                          <div className="alert error">
                            {meta.error === 'required' ? <div>La date du don est obligatoire.</div> : null}
                            {meta.error === 'dateAfterToday' ? <div>La date du don doit être dans le futur.</div> : null}
                          </div> : null
                      }
                    </div>
                  )}
                </Field>

                <div className="attendees">
                {
                  this.props.donation.pollAnswers.map(pa => {
                    const id = pa.author ? pa.author.id : slugify(pa.username);
                    const name = pa.username || pa.author.name;

                    const disabled = !this.user.id ? this.props.donation.createdByGuest.name === name : id === this.user.id;
                    const isSelected = !this.user.id ? values.finalAttendees.includes(pa.username) : values.finalAttendees.includes(id);

                    return (
                      <Field key={id} name="finalAttendees" type="checkbox" value={pa.username} multiple="true">
                        {({ input }) => (
                          <div className={cx('attendee', { 'selected': isSelected })}>
                            <label>
                                <span className="sr-only">Confirmer la présence de {name}</span>
                                <input {...input} type="checkbox" disabled={disabled} />
                                <span>{name}</span>
                              </label>
                          </div>
                        )}
                      </Field>
                    );
                  })
                }
                </div>

                <div className="text-center">
                  <input className="btn big" type="submit" disabled={invalid} value="Valider cette date et ces participants" />
                </div>
              </form>
            )} />
          </>
      </Modal >

    );
  }
  render() {
    const { donation } = this.props;
    const { isCreator, showDefinitiveDateModal } = this.state;

    const isEstablishmentDonation = !isEmpty(donation.establishment);

    return (
      <div className="donation-definitive-date block-base">
        <div className="alert warning">
          {
            isEstablishmentDonation ? <h2>Action à réaliser : Prendre rendez-vous</h2> : <h2>Action à réaliser: indiquer l'heure retenue</h2>
          }
        </div>
        {isEstablishmentDonation ? <p>Le choix des dates étant terminé. Il convient à l'organisateur de cette proposition de prendre rendez-vous auprès de {donation.establishment.name}.</p> : null}

        {isCreator && isEstablishmentDonation ?
          <div className="phone-link alert info">
            Pour appeler {donation.establishment.name}, cliquer sur ce lien : <PhoneLink establishment={donation.establishment} />
          </div> : null}

        {isCreator ?
          <div className="text-center">
            <button className="btn big" onClick={this.showDefinitiveDateModal}>
              {isEstablishmentDonation ? 'Indiquer la date définitive du don' : 'Indiquer l\'heure définitive du don'}
            </button>
          </div> : null}

        {showDefinitiveDateModal ? this.renderDefinitiveDateModal() : null}
      </div>
    );
  }

}