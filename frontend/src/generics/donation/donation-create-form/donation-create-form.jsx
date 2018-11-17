import React, { Component } from 'react';
import { Form, Validators, validateField } from 'preact-forms-helper';
import dayjs from 'dayjs';
import { navigate } from '@reach/router';

import { DAY_PARTS, DONATION_LOCATION } from '../../../enum';

import Donation, { DONATION_VISIBILITY, DONATION_STATUS } from '../../../services/donation/donation';
import { DonationService } from '../../../services/donation/donation.service';

import store from '../../../services/store';

import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import FlashMessage from '../../flash-message';

import EstablishmentSelectForm from '../../establishment/select/establishment-select-form';
import { UserService } from '../../../services/user/user.service';
import MobileCollectSelectForm from '../../mobile-collect/mobile-collect-form';
import { isEmpty } from '../../../services/helper';
import { dateFormatYearMonthDay, dateFormatHourMinut } from '../../../services/date-helper';

require('./donation-create-form.scss');

const POLL_SUGGESTION_MAX_SIZE = 5;

// TODO: Refacto one day !!
export default class DonationCreateForm extends Component {

  constructor(props) {
    super(props);

    this.user = store.getState().user;
    const donationTypeValue = this.user.donationPreference || 'BLOOD';


    this.state = {
      showNewEstablishment: false,
      pollSuggestionsEstablishment: [{ id: 1, date: dateFormatYearMonthDay(dayjs().add(1, 'day')), dayPart: 'DAY' }],
      errorsEstablishment: [],

      showNewMobileCollect: false,
      pollSuggestionsMobileCollect: [{ id: 1, date: dateFormatHourMinut(dayjs()) }],
      errorsMobileCollect: [],

      newDonationForm: new Form({
        establishment: { value: this.user.establishment, validators: [Validators.required()] },
        donationLocation: { value: this.user.establishment, validators: [Validators.required()] },
        mobileCollect: { value: '', validators: [] },
        donationType: { value: donationTypeValue, validators: [Validators.required()] },
      })
    };
  }

  componentWillMount() {
    this.setState({ showNewEstablishment: this.state.newDonationForm.getValue('establishment') === undefined });

    // When donation created, set it as current for the user
    this.storeUnsubscribeFn = store.subscribe(() => {
      if (!isEmpty(store.getState().donation)) UserService.updateUser({ currentDonation: store.getState().donation.id });
    });
  }
  componentWillUnmount() {
    this.storeUnsubscribeFn();
  }

  // VALIDATION
  createNewDonation = async (e) => {
    e.preventDefault();

    if (!this.state.newDonationForm.isValid()) return false;

    const isEstablishment = this.isEstablishment();
    if (isEstablishment) {
      let errorsEstablishment = this.datesEstablishmentValidation();
      if (errorsEstablishment.length > 0) { this.setState({ errorsEstablishment }); return false; }
    } else {
      let errorsMobileCollect = this.datesMobileCollectValidation();
      if (errorsMobileCollect.length > 0) { this.setState({ errorsMobileCollect }); return false; }
    }

    // Create new donation
    let values = this.state.newDonationForm.getValues();

    let pollSuggestions = isEstablishment ?
      this.state.pollSuggestionsEstablishment.map(ps => ({ date: ps.date, dayPart: ps.dayPart }))
      : this.state.pollSuggestionsMobileCollect.map(ps => ({ hour: ps.date }));

    let donation = new Donation({
      id: null,
      status: DONATION_STATUS.POLL_ON_GOING,
      visibility: DONATION_VISIBILITY.SMALL_NETWORK,
      establishment: isEstablishment ? values.establishment : null,
      mobileCollect: values.mobileCollect,
      donationType: values.donationType,
      pollSuggestions,
      pollAnswers: [],
      finalDate: null,
      events: [],
      finalAttendees: [],
      statisticsDate: null,
      donationToken: null,
      createdBy: null,
      createdAt: null,
      updatedAt: null
    });

    // Save new donation
    try {
      await DonationService.saveDonation(donation, true);
      FlashMessageService.createSuccess('Le don a été créé avec succès', 'donation-create-form');
      // Redirect to current donation page
      setTimeout(() => navigate('/don-courant'), 1000);
    } catch (error) {
      FlashMessageService.createError('Erreur lors de la création du don.. Veuillez nous excuser..!', 'donation-create-form');
    }
  }
  datesEstablishmentValidation() {
    // TODO: improve with preact-form-helpers.js (by removing all suggestions validators and create new one)
    let errors = [];

    // 1 - Check all date are set
    this.state.pollSuggestionsEstablishment.forEach(ps => {
      if (errors.length === 0 && !ps.date) errors.push('Certaines dates ne sont pas renseignées.');
    });
    if (errors.length > 0) return errors;

    // 2 - Check all date are in the future
    let today = dayjs();
    this.state.pollSuggestionsEstablishment.forEach(ps => {
      if (errors.length > 0) return;
      if (dayjs(ps.date).isBefore(today)) errors.push('Certaines dates ne sont pas dans le futur.');
    });
    if (errors.length > 0) return errors;

    // 3 - Check all date are distinct
    let pollSuggestions = this.state.pollSuggestionsEstablishment;
    let length = pollSuggestions.length;
    for (let i = 0; i < length; i++) {
      if (errors.length > 0) break;

      for (let j = i + 1; j < length; j++) {
        if (errors.length > 0) break;

        let date1 = dayjs(pollSuggestions[i].date);
        let date2 = dayjs(pollSuggestions[j].date);

        if (dayjs(date1).isSame(date2)) errors.push('Certaines dates sont identiques');
      }
    }

    return errors;
  }

  datesMobileCollectValidation() {
    let errors = [];

    // 1 - Check all date are set
    this.state.pollSuggestionsMobileCollect.forEach(ps => {
      if (errors.length === 0 && !ps.date) errors.push('Certaines dates ne sont pas renseignées.');
    });
    if (errors.length > 0) return errors;

    // 2 - Check all date are distinct
    let pollSuggestions = this.state.pollSuggestionsMobileCollect;
    for (let i = 0; i < pollSuggestions.length; i++) {
      if (errors.length > 0) break;

      for (let j = i + 1; j < pollSuggestions.length; j++) {
        if (errors.length > 0) break;

        if (pollSuggestions[i].date === pollSuggestions[j].date) errors.push('Certaines heures sont identiques');
      }
    }

    return errors;
  }

  isMobileCollect = () => this.state.newDonationForm.isSelected('donationLocation', 'MOBILE_COLLECT');
  isEstablishment = () => this.state.newDonationForm.isSelected('donationLocation', 'ESTABLISHMENT');
  getPollSuggestions = () => this.isEstablishment() ? this.state.pollSuggestionsEstablishment : this.state.pollSuggestionsMobileCollect;


  // MOBILE COLLECT
  updatemobileCollect = (mobileCollect) => {
    // Compute minimumDate
    this.state.newDonationForm.setValue('mobileCollect', mobileCollect.computemobileCollectText());
    this.setState({ showNewMobileCollect: false });

    // Fill first hour (only if user has not touched the form yet)
    if (this.state.pollSuggestionsMobileCollect.length === 1) this.setState({ pollSuggestionsMobileCollect: [{ id: 1, date: dateFormatHourMinut(dayjs(mobileCollect.beginDate)) }] });
  }
  showNewMobileCollect = (e) => { e.preventDefault(); this.setState({ showNewMobileCollect: true }); }
  closeNewMobileCollect = (e) => {
    if (e) e.preventDefault();
    this.setState({ showNewMobileCollect: false });
  }
  renderFindMobileCollect() {
    return (
      <fieldset>
        <legend>2 - Touver une collecte mobile</legend>
        <div className="form-line free-location">
          <div className="introduction clearfix">
            <button className="find-mobile-collect btn fr" onClick={this.showNewMobileCollect} disabled={this.state.showNewMobileCollect}>Trouver une collecte mobile</button>
            <label className="block" htmlFor="free-location">Pour une collecte mobile, vous pouvez indiquer sa localisation ci-dessous :</label>
          </div>
          {this.state.showNewMobileCollect ? <MobileCollectSelectForm onSelect={this.updatemobileCollect} onClose={this.closeNewMobileCollect} /> : null}

          <textarea id="free-location" onChange={validateField(this, this.state.newDonationForm)} value={this.state.newDonationForm.getValue('mobileCollect')} name="mobileCollect"></textarea>
        </div>
      </fieldset>
    );
  }

  // ESTABLISHMENT
  renderEstablishment(establishment) {
    return (<p>{establishment.name} - {establishment.address}</p>);
  }
  updateEstablishment = (establishment) => {
    this.state.newDonationForm.setValue('establishment', establishment);
    this.setState({ showNewEstablishment: false });
  }
  removeEtablishment = (e) => {
    if (e) { e.preventDefault(); }
    this.state.newDonationForm.setValue('establishment', undefined);
    this.forceUpdate();
  }
  showNewEstablishment = (e) => { e.preventDefault(); this.setState({ showNewEstablishment: true }); }
  closeNewEstablishment = (e) => {
    if (e) e.preventDefault();
    this.setState({ showNewEstablishment: false });
  }

  // DONATION TYPE
  showDonationType() {
    if (!this.isEstablishment()) return false;
    if (isEmpty(this.state.newDonationForm.getValue('establishment'))) return false;
    return true;
  }

  // POLL SUGGESTIONS
  showPollSuggestionsEstablishment() {
    if (!this.showDonationType()) return false;
    if (!this.state.newDonationForm.getValue('donationType')) return false;
    return true;
  }
  showPollSuggestionsMobileCollect() {
    if (!this.isMobileCollect()) return false;
    if (!this.state.newDonationForm.getValue('mobileCollect')) return false;
    return true;
  }
  updateDayPart = (e) => {
    let id = +e.target.parentNode.parentNode.parentNode.attributes['data-id'].value;
    let dayPart = e.target.value;

    let pollSuggestions = this.getPollSuggestions();
    pollSuggestions.forEach(ps => { if (ps.id === id) ps.dayPart = dayPart; });
    this.setState({ pollSuggestions });
  }
  updateDate = (e) => {
    let id = +e.target.parentNode.parentNode.attributes['data-id'].value;
    let date = e.target.value;

    let pollSuggestions = this.getPollSuggestions();
    pollSuggestions.forEach(ps => { if (ps.id === id) ps.date = date; });
    this.setState({ pollSuggestions });
  }
  addPollSuggestion = (e) => {
    e.preventDefault();

    let pollSuggestions = this.getPollSuggestions();
    let maxIndex = Math.max(...pollSuggestions.map(ps => ps.id));

    // Default Value
    if (this.isEstablishment()) pollSuggestions.push({ id: maxIndex + 1, date: dateFormatYearMonthDay(dayjs().add(1, 'day')), dayPart: DAY_PARTS.DAY });
    else {
      // Add an hour to the maximum hour
      let oldestPollSuggestion = pollSuggestions.reduce((ps, currentOldDate) => dayjs(ps.date).isAfter(dayjs(currentOldDate)) ? ps.date : currentOldDate);
      pollSuggestions.push({ id: maxIndex + 1, date: oldestPollSuggestion.date });
    }

    this.setState({ pollSuggestions });
  }
  removeSuggestionPoll = (e) => {
    e.preventDefault();
    let removeId = +e.target.parentNode.attributes['data-id'].value;

    let pollSuggestions = this.getPollSuggestions();
    pollSuggestions = pollSuggestions.filter(ps => ps.id !== removeId);
    pollSuggestions.forEach((ps, index) => ps.id = index + 1); // Re-order id
    this.setState({ pollSuggestions });
  }

  // RENDER
  renderPollSuggestionsEstablishmentFieldset() {
    const pollSuggestions = this.state.pollSuggestionsEstablishment;
    const errors = this.state.errorsEstablishment;

    return (
      <fieldset>
        <legend>4 - Proposition de dates</legend>

        <div className="alert info">
          Afin d'améliorer vos chances pour prendre rendez-vous avec l'EFS, nous vous conseillons de prendre rendez-vous à minima deux semaines avant la date voulue.
        </div>


        <div className="poll-suggestions clearfix">
          <button className="btn" onClick={this.addPollSuggestion} disabled={pollSuggestions.length >= POLL_SUGGESTION_MAX_SIZE}>Ajouter une nouvelle date</button>
        </div>

        {errors.length > 0 ? <div className="alert error">{errors.map(err => <div>{err}</div>)}</div> : null}

        {pollSuggestions.length >= POLL_SUGGESTION_MAX_SIZE ? <div className="alert info">Vous ne pouvez pas ajouter plus de 5 propositions.</div> : null}
        {this.renderPollSuggestions()}
      </fieldset>
    );
  }

  renderPollSuggestionsMobileCollectFieldset() {
    const pollSuggestions = this.state.pollSuggestionsMobileCollect;
    const errors = this.state.errorsMobileCollect;

    return (
      <fieldset>
        <legend>3 - Proposition d'heures</legend>

        <div className="poll-suggestions clearfix">
          <button className="btn" onClick={this.addPollSuggestion} disabled={pollSuggestions.length >= POLL_SUGGESTION_MAX_SIZE}>Ajouter une nouvelle heure</button>
        </div>

        {errors.length > 0 ? <div className="alert error">{errors.map(err => <div>{err}</div>)}</div> : null}

        {pollSuggestions.length >= POLL_SUGGESTION_MAX_SIZE ? <div className="alert info">Vous ne pouvez pas ajouter plus de 5 propositions.</div> : null}
        {this.renderPollSuggestions()}
      </fieldset>
    );
  }
  renderPollSuggestions() {
    const isEstablishment = this.isEstablishment();
    const inputType = isEstablishment ? 'date' : 'time';
    const pollSuggestions = this.getPollSuggestions();

    return (
      pollSuggestions.map(ps => {

        let dayLabel = ''.concat(ps.id, '-day');
        let morningLabel = ''.concat(ps.id, '-morning');
        let afternoonLabel = ''.concat(ps.id, '-afternoon');
        let name = ''.concat(ps.id, '-suggestion');

        return (
          <div data-id={ps.id} key={ps.id} className="poll-suggestion">
            <strong>{ps.id} : </strong>
            <div>
              <input type={inputType} value={ps.date} onChange={this.updateDate} />
            </div>
            {isEstablishment ?
              <ul className="list-unstyled inline-list">
                <li>
                  <input checked={ps.dayPart === DAY_PARTS.DAY} id={dayLabel} name={name} value={DAY_PARTS.DAY} type="radio" onChange={this.updateDayPart} />
                  <label htmlFor={dayLabel}>Journée</label>
                </li>
                <li>
                  <input checked={ps.dayPart === DAY_PARTS.MORNING} id={morningLabel} name={name} value="MORNING" type="radio" onChange={this.updateDayPart} />
                  <label htmlFor={morningLabel}>Matin</label>
                </li>
                <li>
                  <input checked={ps.dayPart === DAY_PARTS.AFTERNOON} id={afternoonLabel} name={name} value="AFTERNOON" type="radio" onChange={this.updateDayPart} />
                  <label htmlFor={afternoonLabel}>Après-midi</label>
                </li>
              </ul> : null
            }
            {pollSuggestions.length > 1 ? <button className="btn" onClick={this.removeSuggestionPoll}>x</button> : null}
          </div>
        );
      })
    );
  }
  renderDonationType() {
    let newDonationForm = this.state.newDonationForm;

    return (
      <fieldset>
        <legend>3 - Type de don</legend>

        <div className="radio-line">
          <div>
            <label>
              <span className="block"><img src="/img/donation-type/blood.svg" alt="" /></span>
              <input type="radio" name="donationType" value="BLOOD" onChange={validateField(this, newDonationForm)} checked={newDonationForm.isSelected('donationType', 'BLOOD')} />
              Don du sang
            </label>
          </div>

          <div>
            <label>
              <span className="block"><img src="/img/donation-type/plasma.svg" alt="" /></span>
              <input type="radio" name="donationType" value="PLASMA" onChange={validateField(this, newDonationForm)} checked={newDonationForm.isSelected('donationType', 'PLASMA')} />
              Don de plasma
            </label>
          </div>

          {
            this.user.plateletActive ?
              <div className="donation-type">
                <label>
                  <span className="block"><img src="/img/donation-type/platelet.svg" alt="" /></span>
                  <input type="radio" name="donationType" value="PLATELET" onChange={validateField(this, newDonationForm)} checked={newDonationForm.isSelected('donationType', 'PLATELET')} />
                  Don de plaquettes
                </label>
              </div> : null
          }

          {
            this.state.newDonationForm.hasErrors('donationType') && this.state.newDonationForm.isTouched('donationType') ?
              <div className="alert error">
                {this.state.newDonationForm.hasError('donationType', 'required') ? <div>Le type du don est obligatoire</div> : null}
              </div> : null
          }
        </div>
      </fieldset>
    );
  }
  renderFindEstablishment() {
    const establishment = this.state.newDonationForm.getValue('establishment');
    const showNewEstablishment = this.state.showNewEstablishment;

    return (
      <fieldset>
        <legend>2 - Touver l'établissement</legend>

        <div className="form-line establishment">
          <span>{establishment ? this.renderEstablishment(establishment) : 'Aucun établissement sélectionné'}</span>

          <div className="establishment-actions text-right">
            <button className="btn" onClick={this.showNewEstablishment} disabled={showNewEstablishment}>
              {establishment ? 'Modifier l\'établissement' : 'Ajouter un établissement'}
            </button>
            {establishment ? <button className="btn danger" onClick={this.removeEtablishment}>x</button> : null}
          </div>
        </div>
        {showNewEstablishment ? <EstablishmentSelectForm onSelect={this.updateEstablishment} onClose={this.closeNewEstablishment} /> : null}

      </fieldset>
    );
  }
  render() {
    const { newDonationForm } = this.state;

    const showPollSuggestionsForEstablishment = this.showPollSuggestionsEstablishment();
    const showPollSuggestionsForMobileCollect = this.showPollSuggestionsMobileCollect();
    return (
      <form id="create-form-modal" onSubmit={this.createNewDonation} aria-live="polite">

        <FlashMessage scope="donation-create-form" />

        <fieldset className="no-border">
          <legend>1 - Type de collecte</legend>

          <div className="radio-line">
            <div>
              <label>
                <span className="block"><img src={DONATION_LOCATION.ESTABLISHMENT.src} alt="" /></span>
                <input type="radio" name="donationLocation" value="ESTABLISHMENT" onChange={validateField(this, newDonationForm)} checked={newDonationForm.isSelected('donationLocation', 'ESTABLISHMENT')} /> Etablissement de l'<acronym title="Etablissement français du sang">EFS</acronym>
              </label>
            </div>

            <div>
              <label>
                <span className="block"><img src={DONATION_LOCATION.MOBILE_COLLECT.src} alt="" /></span>
                <input type="radio" name="donationLocation" value="MOBILE_COLLECT" onChange={validateField(this, newDonationForm)} checked={newDonationForm.isSelected('donationLocation', 'MOBILE_COLLECT')} /> Collecte mobile
              </label>
            </div>
          </div>
        </fieldset>

        {this.isMobileCollect() ? this.renderFindMobileCollect() : null}
        {this.isEstablishment() ? this.renderFindEstablishment() : null}

        {this.showDonationType() ? this.renderDonationType() : null}

        {showPollSuggestionsForEstablishment ? this.renderPollSuggestionsEstablishmentFieldset() : null}
        {showPollSuggestionsForMobileCollect ? this.renderPollSuggestionsMobileCollectFieldset() : null}

        {
          showPollSuggestionsForEstablishment || showPollSuggestionsForMobileCollect ?
            <div className="submit-zone">
              <label htmlFor="submit" className="sr-only">Proposer ce nouveau don</label>
              <input id="submit" type="submit" className="btn" value="Proposer ce nouveau don" />
            </div> : null
        }

      </form>
    );
  }
}