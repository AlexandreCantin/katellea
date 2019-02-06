import React, { Component } from 'react';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import Modal from '../../../modal';
import FlashMessage from '../../../flash-message';
import { PollSuggestionsOneDay, PollSuggestionsMultipleDay } from '../../donation-create-form/donation-date-suggestion';
import { isEmpty } from '../../../../services/helper';
import { datesValidationOneDay, datesValidationMultipleDays } from '../../donation-helper';
import { dateFormatHourMinut, dateFormatYearMonthDay } from '../../../../services/date-helper';
import { DonationService } from '../../../../services/donation/donation.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';



export default class DonationNewPoll extends Component {
  static propTypes = {
    donation: PropTypes.object.isRequired,
    adminToken: PropTypes.string.isRequired
  }


  constructor(props) {
    super(props);
    this.state = { showNewPollModal: false };

    this.formData = {
      hourSuggestions: [dateFormatHourMinut(dayjs())],
      dateSuggestions: [{ date: dateFormatYearMonthDay(dayjs().add(1, 'day')), dayPart: 'DAY' }]
    }
  }


  updatePollSuggestions = (values) => {
    let pollSuggestions = this.props.donation.isMultipleDay() ?
      values.dateSuggestions.map(ps => ({ date: ps.date, dayPart: ps.dayPart })) : values.hourSuggestions.map(hour => ({ hour }));

    DonationService.resetPoll(this.props.donation, { pollSuggestions }, this.props.adminToken)
      .then(() => {
        FlashMessageService.createSuccess('Un nouveau sondage a été créé.', 'donation');
        setTimeout(() => this.setState({ showNewPollModal: false }), 500)
      })
      .catch(() => FlashMessageService.createError('Erreur lors de la mise à jour du sondage. Veuillez réessayer ultérieurement', 'donation-new-poll'));
  }

  validate = (values) => {
    const errors = this.props.donation.isMultipleDay() ?
      datesValidationMultipleDays(values.dateSuggestions, 'dateSuggestions', true) : datesValidationOneDay(values.hourSuggestions, 'hourSuggestions');
    if (!isEmpty(errors)) return errors;
  }

  showNewPollModal = () => this.setState({ showNewPollModal: true });
  closeNewPollModal = () => this.setState({ showNewPollModal: false });

  renderNewPollModal() {
    const { donation } = this.props;

    return (
      <Modal cssclassName="new-poll" role="alertdialog" title="Lancer un nouveau sondage ?" onClose={this.closeNewPollModal} modalUrl="/donation/nouveau-sondage">
        <div className="text-center">
          <p className="alert danger">Attention ! L'ensemble des réponses sera supprimé.</p>
          <Form
            onSubmit={this.updatePollSuggestions}
            mutators={{ ...arrayMutators }}
            initialValues={this.formData}
            validate={values => this.validate(values)}
            ref={this.formRef}
            render={({ handleSubmit, valid }) => (
              <form id="create-form-modal" onSubmit={handleSubmit} aria-live="polite">
                <FlashMessage scope="donation-new-poll" />
                {donation.isMultipleDay() ? <PollSuggestionsMultipleDay isEdit /> : <PollSuggestionsOneDay donation={donation} isEdit />}

                <div className="submit-zone">
                  <label htmlFor="new-poll" className="sr-only">Proposer ce nouveau don</label>
                  <input id="new-poll" type="submit" className="btn" disabled={!valid} value="Créer un nouveau sondage" />
                </div>
              </form>
            )} />
        </div>
      </Modal>
    );
  }


  render() {
    return (
      <>
        <button className="btn" onClick={this.showNewPollModal}>Lancer un nouveau sondage</button>
        {this.state.showNewPollModal ? this.renderNewPollModal() : null}
      </>
    );
  }
}



