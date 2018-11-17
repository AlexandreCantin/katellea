import React, { Component } from 'react';
import dayjs from 'dayjs';

import store from '../../../services/store';
import FlashMessage from '../../../generics/flash-message';

import { UserService } from '../../../services/user/user.service';
import { DonationService } from '../../../services/donation/donation.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { dateFormatShortDayDayMonthYear } from '../../../services/date-helper';
import Modal from '../../../generics/modal';

import Validators from '../../../services/forms/validators';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../../services/forms/validate';

const FORM_RULES = {
  finalAttendees: [Validators.minLength(1)]
}

export default class DonationDone extends Component {

  constructor(props) {
    super(props);

    this.finalAttendeesInitialValues = {
      finalAttendees: this.props.donation.finalAttendees.map(at => at.id)
    }

    this.setState({
      showDonationDoneUpdateModal: false,
      isCreator: this.props.donation.isCreator(store.getState().user.id)
    });
  }

  showDonationDoneUpdateModal = () => this.setState({ showDonationDoneUpdateModal: true });
  closeDonationDoneUpdateModal = () => this.setState({ showDonationDoneUpdateModal: false });

  updateDefinitiveAttendees = (values) => {
    // Compute user ids as Number
    values.finalAttendees = values.finalAttendees.map(id => parseInt(id, 10));

    DonationService.updateDonation(values)
      .then(() => {
        FlashMessageService.createSuccess('Les participants ont été mis à jour', 'update-attendees');
        setTimeout(() => this.closeDefinitiveDateModal(), 1500);
      }).catch(() => FlashMessageService.createError('Erreur lors de la mise à jour du don. Veuillez réessayer ultérieurement.', 'update-attendees'));
  }

  renderDefinitiveDateModal() {
    return (
      <Modal cssclassName="donation-done" title="Modifier le don définitif" onClose={this.closeDonationDoneUpdateModal}>
        <FlashMessage scope="update-attendees" />
        <div>
          <p>Selectionner les participants définitifs pour ce don :</p>

          <Form
            onSubmit={this.updateDefinitiveAttendees}
            initialValue={this.finalAttendeesInitialValues}
            validate={values => validateForm(values, FORM_RULES)}
            render={({ handleSubmit, invalid }) => (
              <form className="form" onSubmit={handleSubmit}>
                <div className="attendees">
                  {
                    this.props.donation.pollAnswers.map(pa => {
                      const id = pa.author.id;

                      return (
                        <Field name="finalAttendees" type="checkbox" value={id} multiple="true">
                          {({ input }) => (
                            <div className={input.values.contains(id) ? 'attendee selected' : 'attendee'}>
                              <label>
                                <input type="checkbox" name="finalAttendees" value={id} />
                                <span>{UserService.getFullName(pa.author)}</span>
                              </label>
                            </div>

                          )}

                        </Field>
                      );
                    })
                  }
                  <div className="text-center">
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

    if (!canUpdateAttendees) return (<div className="alert error">Vous ne pouvez modifier les participants à ce don</div>);
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