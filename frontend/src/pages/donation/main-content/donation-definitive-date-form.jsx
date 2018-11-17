import React, { Component } from 'react';
import store from '../../../services/store';
import PhoneLink from '../../../generics/phone-link';

import { UserService } from '../../../services/user/user.service';
import { DonationService } from '../../../services/donation/donation.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';

import FlashMessage from '../../../generics/flash-message';
import Modal from '../../../generics/modal';
import { DONATION_STATUS } from '../../../enum';

import Validators from '../../../services/forms/validators';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../../services/forms/validate';

const FORM_RULES = {
  finalDate: [Validators.required(), Validators.dateAfterToday()],
  finalAttendees: [Validators.minLength(1)], multiple: true
}

export default class DonationDefinitiveDateForm extends Component {

  constructor(props) {
    super(props);

    this.user = store.getState().user;

    this.state = {
      showDefinitiveDateModal: false,
      isCreator: this.props.donation.isCreator(this.user.id),
      validateDateForm: new Form({
      })
    };
  }


  addDefinitiveDateAndAttendees = (e) => {
    e.preventDefault();
    const form = this.state.validateDateForm;

    if (!this.state.validateDateForm.isValid()) return;

    // Compute user ids as Number
    let values = form.getValues();
    let finalAttendeesIdAsNumber = values.finalAttendees.map(id => parseInt(id, 10));
    values.finalAttendees = finalAttendeesIdAsNumber;
    values.status = DONATION_STATUS.DATE_CONFIRMED;

    DonationService.updateDonation(values)
      .then(() => {
        FlashMessageService.createSuccess('Le don a été mis à jour', 'definitive-date');
        setTimeout(() => this.closeDefinitiveDateModal(), 1500);
      }).catch(() => FlashMessageService.createError('Erreur lors de la mise à jour du don. Veuillez réessayer ultérieurement.', 'definitive-date'));
  }

  showDefinitiveDateModal = () => this.setState({ showDefinitiveDateModal: true });
  closeDefinitiveDateModal = () => this.setState({ showDefinitiveDateModal: false });


  renderDefinitiveDateModal() {
    const form = this.state.validateDateForm;

    return (
      <Modal cssclassName="definitive-date-form" title="Indiquer la date définitive du don" onClose={this.closeDefinitiveDateModal}>
        <FlashMessage scope="definitive-date" />

        <Form
          onSubmit={this.addDefinitiveDateAndAttendees}
          validate={values => validateForm(values, FORM_RULES)}
          render={({ handleSubmit, invalid }) => (
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

              <Field name="finalAttendees" type="checkbox" multiple="true">
                {({ input, meta }) => (
                  <div>
                    <p>Selectionner les participants définitifs pour ce don :</p>
                    <div className="attendees">
                      {
                        this.props.donation.pollAnswers.map(pa => {
                          const id = pa.author.id;
                          const disabled = id === this.user.id;
                          const isSelected = form.isSelected('finalAttendees', id);

                          return (
                            <div className={isSelected ? 'attendee selected' : 'attendee'}>
                              <label>
                                <span className="sr-only">Confirmer la présence de {UserService.getFullName(pa.author)}</span>
                                <input type="checkbox" name="finalAttendees" value={id} disabled={disabled} checked={isSelected} />
                                <span>{UserService.getFullName(pa.author)}</span>
                              </label>
                            </div>
                          );
                        })
                      }

                    </div>
                  </div>

                )}
              </Field>

              <div className="text-center">
                <input className="btn big" type="submit" disabled={invalid} value="Valider cette date et ces participants" />
              </div>

            </form>
          )} />


      </Modal >

    );
  }
  render() {
    const { donation } = this.props;
    const { isCreator, showDefinitiveDateModal } = this.state;

    return (
      <div className="donation-definitive-date block-base">
        <div className="alert warning"><h2>Action à réaliser : Prise de rendez-vous</h2></div>
        <p>Le choix des dates étant terminé. Il convient à l'organisateur de cette proposition de prendre rendez-vous auprès de {donation.establishment.name}.</p>

        {isCreator ?
          <div className="phone-link alert info">
            Pour appeler {donation.establishment.name}, cliquer sur ce lien : <PhoneLink establishment={donation.establishment} />
          </div> : null}

        {isCreator ?
          <div className="text-center">
            <button className="btn big" onClick={this.showDefinitiveDateModal}>Indiquer la date définitive du don</button>
          </div> : null}

        {showDefinitiveDateModal ? this.renderDefinitiveDateModal() : null}
      </div>
    );
  }

}