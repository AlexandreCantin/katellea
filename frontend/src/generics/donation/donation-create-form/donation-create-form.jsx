import React, { Component } from 'react';
import dayjs from 'dayjs';
import arrayMutators from 'final-form-arrays'
import { FieldArray } from 'react-final-form-arrays'
import { Form, Field } from 'react-final-form';
import { navigate } from '@reach/router';

import store from '../../../services/store';
import { DONATION_LOCATION, DONATION_STATUS } from '../../../enum';
import { UserService } from '../../../services/user/user.service';
import { DonationService } from '../../../services/donation/donation.service';

import Validators from '../../../services/forms/validators';
import { validateForm } from '../../../services/forms/validate';
import { dateFormatYearMonthDay, dateFormatHourMinut } from '../../../services/date-helper';

import { isEmpty } from '../../../services/helper';
import FlashMessage from '../../flash-message';
import EstablishmentSelectForm from '../../establishment/select/establishment-select-form';
import MobileCollectSelectForm from '../../mobile-collect/mobile-collect-form';
import Donation, { DONATION_VISIBILITY } from '../../../services/donation/donation';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';

require('./donation-create-form.scss');

const POLL_SUGGESTION_MAX_SIZE = 5;

const MOBILE_COLLECT_FORM_RULES = {
  donationLocation: [Validators.required()],
  mobileCollect: [Validators.required()],
}
const ESTABLISHMENT_FORM_RULES = {
  donationLocation: [Validators.required()],
  establishment: [Validators.required()],
  donationType: [Validators.required()],
}

export default class DonationCreateForm extends Component {

  constructor(props) {
    super(props);

    this.user = store.getState().user;

    this.formData = {
      donationType: this.user.donationPreference || 'BLOOD',
      establishment: this.user.establishment,
      hourSuggestions: [dateFormatHourMinut(dayjs())],
      dateSuggestions: [{ date: dateFormatYearMonthDay(dayjs().add(1, 'day')), dayPart: 'DAY' }],
    }

    this.formRef = React.createRef();

    this.state = {
      donationLocation: undefined,
      establishment: this.user.establishment,
      showNewEstablishment: false,
      showNewMobileCollect: false,
      multipleDayDonation: true
    }
  }

  componentDidMount() {
    // When donation created, set it as current for the user
    this.storeUnsubscribeFn = store.subscribe(() => {
      if (!isEmpty(store.getState().donation)) UserService.updateUser({ currentDonation: store.getState().donation.id });
    });
  }
  componentWillUnmount() {
    this.storeUnsubscribeFn();
  }

  updateDonationLocation = (e) => this.setState({ donationLocation: e.target.value });
  getField = (fieldName) => this.formRef.current.form.getFieldState(fieldName);

  // Establishment steps
  isEstablishment = () => this.state.donationLocation === 'ESTABLISHMENT';
  showDonationType() {
    if (!this.isEstablishment()) return false;
    if (!this.getField('establishment') || this.getField('establishment').invalid) return false;
    return true;
  }
  showPollSuggestionsEstablishment() {
    if (!this.showDonationType()) return false;
    if (!this.getField('donationType') || this.getField('donationType').invalid) return false;
    return true;
  }

  // Mobile collect steps
  isMobileCollect = () => this.state.donationLocation === 'MOBILE_COLLECT';
  showPollSuggestionsMobileCollect() {
    if (!this.isMobileCollect()) return false;
    if (!this.getField('mobileCollect') || this.getField('mobileCollect').invalid) return false;
    return true;
  }


  // Establishment and mobile collect select forms
  showNewEstablishment = (e) => { e.preventDefault(); this.setState({ showNewEstablishment: true }); }
  closeNewEstablishment = (e) => { if (e) { e.preventDefault(); } this.setState({ showNewEstablishment: false }); }
  showNewMobileCollect = (e) => { e.preventDefault(); this.setState({ showNewMobileCollect: true }); }
  closeNewMobileCollect = (e) => { if (e) { e.preventDefault(); } this.setState({ showNewMobileCollect: false }); }

  removeEtablishment = (e) => {
    if (e) { e.preventDefault(); }
    this.getField('establishment').change(undefined);
    this.setState({ establishment: undefined });
  }
  updateEstablishment = (establishment) => {
    this.getField('establishment').change(establishment);
    this.setState({ establishment, showNewEstablishment: false, multipleDayDonation: true });
  }
  updateMobileCollect = (mobileCollect) => {
    this.getField('mobileCollect').change(mobileCollect.computemobileCollectText());
    this.setState({ showNewMobileCollect: false, multipleDayDonation: mobileCollect.multipleDay });
  }


  validate = (values) => {
    const rules = this.isEstablishment() ? ESTABLISHMENT_FORM_RULES : MOBILE_COLLECT_FORM_RULES;
    let errors = validateForm(values, rules);
    if (!isEmpty(errors)) return errors;

    errors = this.state.multipleDayDonation ? datesValidationMultipleDays(values.dateSuggestions, 'dateSuggestions', true) : datesValidationOneDay(values.hourSuggestions, 'hourSuggestions');
    if (!isEmpty(errors)) return errors;
  }

  createDonation = async (values, form) => {
    if (form.invalid) return false;

    const isEstablishment = this.isEstablishment();
    const isMobileCollect = this.isMobileCollect();

    let pollSuggestions = this.state.multipleDayDonation ?
      values.dateSuggestions.map(ps => ({ date: ps.date, dayPart: ps.dayPart })) : values.hourSuggestions.map(hour => ({ hour }));

    let donation = new Donation({
      id: null,
      status: DONATION_STATUS.POLL_ON_GOING,
      visibility: DONATION_VISIBILITY.SMALL_NETWORK,
      establishment: isEstablishment ? values.establishment : null,
      mobileCollect: isMobileCollect ? values.mobileCollect : null,
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


  // RENDER
  renderPollSuggestionsMultipleDay() {
    return (
      <fieldset>
        <legend>4 - Proposition de dates</legend>

        <div className="alert info">
          Afin d'améliorer vos chances pour prendre rendez-vous avec l'EFS, nous vous conseillons de prendre rendez-vous à minima deux semaines avant la date voulue.
        </div>

        <FieldArray name="dateSuggestions">
          {({ fields, meta }) => (
            <>
              <div className="poll-suggestions clearfix">
                <button className="btn" onClick={(e) => { e.preventDefault(); fields.push({ date: dateFormatYearMonthDay(dayjs().add(1, 'day')), dayPart: 'DAY' }) }} disabled={fields.length >= POLL_SUGGESTION_MAX_SIZE}>Ajouter une nouvelle date</button>
              </div>

              {fields.length >= POLL_SUGGESTION_MAX_SIZE ? <div className="alert info">Vous ne pouvez pas ajouter plus de {POLL_SUGGESTION_MAX_SIZE} propositions.</div> : null}

              {fields.map((name, index) => {
                const error = meta.error && meta.error[index] ? meta.error[index].error : undefined;
                return (
                  <div key={name}>
                    <div className="poll-suggestion">
                      <strong>{index + 1} : </strong>
                      <div>
                        <Field name={`${name}.date`}>
                          {({ input }) => (<><input {...input} type="date" id={name + '-hour'} /><label htmlFor={name + '-hour'} className="sr-only">Heure proposé n°{index + 1}</label></>)}
                        </Field>
                      </div>

                      <ul className="list-unstyled inline-list">
                        <li>
                          <Field name={`${name}.dayPart`} value="DAY" type="radio">
                            {({ input }) => (<><input {...input} type="radio" id={name + '-day'} /><label htmlFor={name + '-day'}>Journée</label></>)}
                          </Field>
                        </li>
                        <li>
                          <Field name={`${name}.dayPart`} value="MORNING" type="radio">
                            {({ input }) => (<><input {...input} type="radio" id={name + '-morning'} /><label htmlFor={name + '-morning'}>Matin</label></>)}
                          </Field>
                        </li>
                        <li>
                          <Field name={`${name}.dayPart`} value="AFTERNOON" type="radio">
                            {({ input }) => (<><input {...input} type="radio" id={name + '-afternoon'} /><label htmlFor={name + '-afternoon'}>Après-midi</label></>)}
                          </Field>
                        </li>
                      </ul>
                      {fields.length > 1 ? <button className="btn" onClick={() => fields.remove(index)}>x</button> : null}
                    </div>

                    {error ?
                      <div className="alert error">
                        {error === 'required' ? <div>Cette date n'est pas renseignée</div> : null}
                        {error === 'noFutureDate' ? <div>La date doit être dans le futur</div> : null}
                        {error === 'sameDate' ? <div>Cette date existe déjà</div> : null}
                      </div> : null
                    }
                  </div>
                )
              })}
            </>
          )}
        </FieldArray>
      </fieldset>
    );
  }

  renderPollSuggestionsOneDay() {
    return (
      <fieldset>
        <legend>3 - Proposition d'heures</legend>

        <FieldArray name="hourSuggestions">
          {({ fields, meta }) => (
            <>
              <div className="poll-suggestions clearfix">
                <button className="btn" onClick={(e) => { e.preventDefault(); fields.push(dateFormatHourMinut(dayjs())) }} disabled={fields.length >= POLL_SUGGESTION_MAX_SIZE}>Ajouter une nouvelle heure</button>
              </div>

              {fields.length >= POLL_SUGGESTION_MAX_SIZE ? <div className="alert info">Vous ne pouvez pas ajouter plus de {POLL_SUGGESTION_MAX_SIZE} propositions.</div> : null}
              {fields.map((name, index) => {
                const error = meta.error && meta.error[index] ? meta.error[index].error : undefined;
                return (
                  <div key={name}>
                    <div className="poll-suggestion">
                      <strong>{index + 1} : </strong>
                      <div>
                        <Field name={name}>{({ input }) => (<input {...input} type="time" />)}</Field>
                      </div>
                      {fields.length > 1 ? <button className="btn" onClick={() => fields.remove(index)}>x</button> : null}
                    </div>
                    {error ?
                      <div className="alert error">
                        {error === 'required' ? <div>L'heure n'est pas renseignée</div> : null}
                        {error === 'sameDate' ? <div>Vous avez déjà proposé cette horaire</div> : null}
                      </div> : null
                    }
                  </div>
                )
              }
              )}
            </>
          )}
        </FieldArray>
      </fieldset>
    );
  }
  renderDonationType() {
    return (
      <fieldset>
        <legend>3 - Type de don</legend>
        <div className="radio-line">
          <Field name="donationType" type="radio" value="BLOOD">
            {({ input }) => (
              <div>
                <label>
                  <span className="block"><img src="/img/donation-type/blood.svg" alt="" /></span>
                  <input {...input} type="radio" value="BLOOD" />
                  Don du sang
                </label>
              </div>
            )}
          </Field>

          <Field name="donationType" type="radio" value="PLASMA">
            {({ input }) => (
              <div>
                <label>
                  <span className="block"><img src="/img/donation-type/plasma.svg" alt="" /></span>
                  <input {...input} type="radio" value="PLASMA" />
                  Don de plasma
                </label>
              </div>
            )}
          </Field>

          {
            this.user.plateletActive ?
              <Field name="donationType" type="radio" value="PLATELET">

                {({ input }) => (
                  <div className="donation-type">
                    <label>
                      <span className="block"><img src="/img/donation-type/platelet.svg" alt="" /></span>
                      <input {...input} type="radio" value="PLATELET" />
                      Don de plaquettes
                </label>
                  </div>
                )}
              </Field> : null
          }

          <Field name="donationType" type="radio">
            {({ meta }) => {
              if (meta.error && meta.touched) return (<div className="alert error">{meta.error === 'required' ? <div>Le type du don est obligatoire</div> : null}</div>)
              return null
            }}
          </Field>
        </div>
      </fieldset>
    );
  }
  renderFindEstablishment() {
    const establishment = this.state.establishment;
    const showNewEstablishment = this.state.showNewEstablishment;

    return (
      <Field name="establishment">
        {() => (
          <fieldset>
            <legend>2 - Touver l'établissement</legend>

            <div className="form-line establishment">
              <span>{establishment ? <p>{establishment.name} - {establishment.address}</p> : 'Aucun établissement sélectionné'}</span>

              <div className="establishment-actions text-right">
                <button className="btn" onClick={this.showNewEstablishment} disabled={showNewEstablishment}>
                  {establishment ? 'Modifier l\'établissement' : 'Ajouter un établissement'}
                </button>
                {establishment ? <button className="btn danger" onClick={this.removeEtablishment}>x</button> : null}
              </div>
            </div>
            {showNewEstablishment ? <EstablishmentSelectForm onSelect={this.updateEstablishment} onClose={this.closeNewEstablishment} /> : null}

          </fieldset>
        )}
      </Field>
    );
  }
  renderFindMobileCollect() {
    return (
      <Field name="mobileCollect">
        {({ input }) => (
          <fieldset>
            <legend>2 - Touver une collecte mobile</legend>
            <div className="form-line free-location">
              <div className="introduction clearfix">
                <button className="find-mobile-collect btn fr" onClick={this.showNewMobileCollect} disabled={this.state.showNewMobileCollect}>Trouver une collecte mobile</button>
                <label className="block" htmlFor="free-location">Pour une collecte mobile, vous pouvez indiquer sa localisation ci-dessous :</label>
              </div>
              {this.state.showNewMobileCollect ? <MobileCollectSelectForm onSelect={this.updateMobileCollect} onClose={this.closeNewMobileCollect} /> : null}

              <textarea {...input} id="free-location"></textarea>
            </div>
          </fieldset>
        )}
      </Field>
    );
  }
  render() {
    return (
      <Form
        onSubmit={this.createDonation}
        mutators={{ ...arrayMutators }}
        initialValues={this.formData}
        validate={values => this.validate(values)}
        ref={this.formRef}
        render={({ handleSubmit, valid }) => (
          <form id="create-form-modal" onSubmit={handleSubmit} aria-live="polite">
            <FlashMessage scope="donation-create-form" />

            <fieldset className="no-border">
              <legend>1 - Type de collecte</legend>

              <div className="radio-line">
                <Field name="donationLocation" type="radio" value="ESTABLISHMENT">
                  {({ input }) => (
                    <div>
                      <label>
                        <span className="block"><img src={DONATION_LOCATION.ESTABLISHMENT.src} alt="" /></span>
                        <input {...input} type="radio" onInput={this.updateDonationLocation} /> Etablissement de l'<acronym title="Etablissement français du sang">EFS</acronym>
                      </label>
                    </div>
                  )}
                </Field>

                <Field name="donationLocation" type="radio" value="MOBILE_COLLECT">
                  {({ input }) => (
                    <div>
                      <label>
                        <span className="block"><img src={DONATION_LOCATION.MOBILE_COLLECT.src} alt="" /></span>
                        <input {...input} type="radio" onInput={this.updateDonationLocation} /> Collecte mobile
                      </label>
                    </div>
                  )}
                </Field>
              </div>
            </fieldset>


            {/* Mobile collect form steps */}
            {this.isMobileCollect() ? this.renderFindMobileCollect() : null}
            {this.showPollSuggestionsMobileCollect() ?
              this.state.multipleDayDonation ? this.renderPollSuggestionsMultipleDay() : this.renderPollSuggestionsOneDay()
              : null}


            {/* Establishment from steps */}
            {this.isEstablishment() ? this.renderFindEstablishment() : null}
            {this.showDonationType() ? this.renderDonationType() : null}
            {this.showPollSuggestionsEstablishment() ? this.renderPollSuggestionsMultipleDay() : null}

            {
              valid ?
                <div className="submit-zone">
                  <label htmlFor="submit" className="sr-only">Proposer ce nouveau don</label>
                  <input id="submit" type="submit" className="btn" value="Proposer ce nouveau don" />
                </div> : null
            }

          </form>
        )} />
    )
  }
}



function datesValidationMultipleDays(values, fieldName) {
  let errors = {};
  errors[fieldName] = [];

  // 1 - Check all date are set
  values.forEach((ps, index) => {
    if (isEmpty(errors) && !ps.date) errors[fieldName][index] = { error: 'required' }; // errors.push('Certaines dates ne sont pas renseignées.');
  });
  if (!isEmpty(errors[fieldName])) return errors;

  // 2 - Check all date are in the future
  let today = dayjs();
  values.forEach((ps, index) => {
    if (errors.length > 0) return;
    if (dayjs(ps.date).isBefore(today)) errors[fieldName][index] = { error: 'noFutureDate' }; // errors.push('Certaines dates ne sont pas dans le futur.');
  });
  if (!isEmpty(errors[fieldName])) return errors;

  // 3 - Check all date are distinct
  let length = values.length;
  for (let i = 0; i < length; i++) {
    if (errors.length > 0) break;

    for (let j = i + 1; j < length; j++) {
      if (errors.length > 0) break;

      let date1 = dayjs(values[i].date);
      let date2 = dayjs(values[j].date);

      if (dayjs(date1).isSame(date2)) errors[fieldName][j] = { error: 'sameDate' }; // errors.push('Certaines dates sont identiques');
    }
  }
  if (!isEmpty(errors[fieldName])) return errors;


  return {};
}


function datesValidationOneDay(values, fieldName) {

  let errors = {};
  errors[fieldName] = [];

  // 1 - Check all date are set
  values.forEach((val, index) => {
    if (isEmpty(errors) && !val) errors[fieldName][index] = { error: 'required' }; // errors.push('Certaines dates ne sont pas renseignées.');
  });
  if (!isEmpty(errors[fieldName])) return errors;

  // 2 - Check all date are distinct
  for (let i = 0; i < values.length; i++) {
    if (errors.length > 0) break;

    for (let j = i + 1; j < values.length; j++) {
      if (errors.length > 0) break;

      if (values[i] === values[j]) errors[fieldName][j] = { error: 'sameDate' };
    }
  }
  if (!isEmpty(errors[fieldName])) return errors;

  return {};
}