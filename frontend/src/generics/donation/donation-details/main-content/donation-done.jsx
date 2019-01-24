import React, { Component } from 'react';
import dayjs from 'dayjs';

import store from '../../../../services/store';
import FlashMessage from '../../../../generics/flash-message';

import { DonationService } from '../../../../services/donation/donation.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { dateFormatShortDayDayMonthYear } from '../../../../services/date-helper';
import Modal from '../../../../generics/modal';

import Validators from '../../../../services/forms/validators';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../../../services/forms/validate';

const FORM_RULES = {
  finalAttendees: [Validators.minLength(1)]
}

export default class DonationDone extends Component {

  constructor(props) {
    super(props);

    const finalAttendeesUser = this.props.donation.finalAttendeesUser.map(at => at.id);

    this.finalAttendeesInitialValues = { finalAttendees: finalAttendeesUser.concat(this.props.donation.finalAttendeesGuest) }

    this.state = {
      showDonationDoneUpdateModal: false,
      isCreator: this.props.isAdmin || this.props.donation.isCreator(store.getState().user.id)
    };
  }

  showDonationDoneUpdateModal = () => this.setState({ showDonationDoneUpdateModal: true });
  closeDonationDoneUpdateModal = () => this.setState({ showDonationDoneUpdateModal: false });

  updateDefinitiveAttendees = (values) => {
    const { finalAttendeesUser, finalAttendeesGuest } = DonationService.separateGuestAndUser(values.finalAttendees);

    DonationService.updateDonation({ finalAttendeesUser, finalAttendeesGuest }, this.props.adminToken)
      .then(() => {
        FlashMessageService.createSuccess('Les participants ont été mis à jour', 'update-attendees');
        setTimeout(() => this.closeDonationDoneUpdateModal(), 1500);
      }).catch(() => FlashMessageService.createError('Erreur lors de la mise à jour du don. Veuillez réessayer ultérieurement.', 'update-attendees'));
  }

  renderDefinitiveDateModal() {
    return (
      <Modal cssclassName="donation-done" title="Modifier le don définitif" onClose={this.closeDonationDoneUpdateModal} modalUrl="/don-courant/participants-definitifs" cssClass="definitive-attendees-form">
        <FlashMessage scope="update-attendees" />
        <div>
          <p>Selectionner les participants définitifs pour ce don :</p>

          <Form
            onSubmit={this.updateDefinitiveAttendees}
            initialValues={this.finalAttendeesInitialValues}
            validate={values => validateForm(values, FORM_RULES)}
            render={({ handleSubmit, invalid, values }) => (
              <form className="form" onSubmit={handleSubmit}>
                <div className="attendees">
                  {
                    this.props.donation.pollAnswers.map(pa => {
                      const id = pa.author ? pa.author.id : pa.username;
                      const name = pa.username || pa.author.name;

                      let isSelected = false;
                      if (values && values.finalAttendees) isSelected = values.finalAttendees.includes(id);

                      return (
                        <Field key={id} name="finalAttendees" type="checkbox" value={pa.username} multiple="true">
                          {({ input }) => (
                            <div className={isSelected ? 'attendee selected' : 'attendee'}>
                              <label>
                                <span className="sr-only">Confirmer la présence de {name}</span>
                                <input {...input} type="checkbox" />
                                <span>{name}</span>
                              </label>
                            </div>

                          )}

                        </Field>
                      );
                    })
                  }
                  <div className="text-center btn-container">
                    <input className="btn big" type="submit" disabled={invalid} value="Valider ces participants" />
                  </div>
                </div>
              </form>

            )} />
        </div>
      </Modal>
    );
  }

  renderUpdateButton() {
    let statisticsScheduledDate = dayjs(this.props.donation.statisticsDate);
    let canUpdateAttendees = dayjs().isBefore(statisticsScheduledDate);

    if (!canUpdateAttendees) return (<div className="alert error">Vous ne pouvez plus modifier les participants à ce don</div>);
    return (
      <div className="alert warning">
        Vous avez jusqu'au {dateFormatShortDayDayMonthYear(this.props.donation.statisticsDate)} pour modifier les personnes ayant effectivement participer au don.<br />
        <button className="btn big" onClick={this.showDonationDoneUpdateModal}>Modifier les participants au don</button>
      </div>
    );
  }

  render() {
    const { isCreator, showDonationDoneUpdateModal } = this.state;

    return (
      <div className="donation-done block-base">
        <div className="text-center">
          <div className="thank-you">
            <img src="/icons/heart.svg" alt="" />
            <h2><strong>Merci</strong> pour votre don !</h2>
            <img src="/icons/heart.svg" alt="" />
          </div>
        </div>

        {isCreator ? this.renderUpdateButton() : null}

        <div className="selfie alert info">
          <img src="/icons/selfie.svg" alt="" />
          <div className="text-center">
            <p className="block">
              N'hésitez pas à partager les réseaux sociaux les photos/selfies durant de votre don.<br />
              Il n'y a pas de honte à partager votre geste. Au contraire, cela peut inspirer d'autres personnes à en faire aussi !<br />
            </p>
            <ul className="hashtags inline-list unstyled-list">
              <li>#DonDeSang</li>
              <li>#Partagezvotrepouvoir</li>
              <li>@EFS_dondesang</li>
              <li>@Katellea_officiel</li>
            </ul>
          </div>
        </div>

        {showDonationDoneUpdateModal ? this.renderDefinitiveDateModal() : null}
      </div>
    );
  }

}