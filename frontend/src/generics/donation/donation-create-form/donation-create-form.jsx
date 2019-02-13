import React, { Component } from 'react';
import dayjs from 'dayjs';
import arrayMutators from 'final-form-arrays'
import { Form, Field } from 'react-final-form';
import { navigate } from '@reach/router';

import store from '../../../services/store';
import Modal from '../../modal';
import { DONATION_LOCATION, DONATION_STATUS } from '../../../enum';
import { UserService } from '../../../services/user/user.service';
import { DonationService } from '../../../services/donation/donation.service';

import Validators from '../../../services/forms/validators';
import { validateForm } from '../../../services/forms/validate';
import { dateFormatYearMonthDay, dateFormatHourMinut } from '../../../services/date-helper';

import { isEmpty, saveToLocalStorage, getLocalStorageValue } from '../../../services/helper';
import FlashMessage from '../../flash-message';
import EstablishmentSelectForm from '../../establishment/select/establishment-select-form';
import MobileCollectSelectForm from '../../mobile-collect/mobile-collect-form';
import Donation from '../../../services/donation/donation';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { datesValidationMultipleDays, datesValidationOneDay } from '../donation-helper';
import { PollSuggestionsMultipleDay, PollSuggestionsOneDay } from './donation-date-suggestion';

require('./donation-create-form.scss');



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
      isPublicDonation: !this.user.id,
      donationType: this.user.donationPreference || 'BLOOD',
      establishment: this.user.establishment,
      hourSuggestions: [dateFormatHourMinut(dayjs())],
      dateSuggestions: [{ date: dateFormatYearMonthDay(dayjs().add(1, 'day')), dayPart: 'DAY' }],

      name: getLocalStorageValue('name'),
      email: getLocalStorageValue('email')
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
    if(this.user.id) {
      this.storeUnsubscribeFn = store.subscribe(() => {
        if (!isEmpty(store.getState().donation)) UserService.updateUser({ currentDonationToken: store.getState().donation.donationToken });
      });
    }
  }
  componentWillUnmount() {
    if(this.user.id) this.storeUnsubscribeFn();
  }

  componentDidUpdate() {
    // Notify parent to update their focusable elements (on modal mode only)
    if(this.props.updateFocusableElements) this.props.updateFocusableElements();
  }

  updateDonationLocation = (e) => {
    const donationLocation = e.target.value;
    this.getField('donationLocation').change(donationLocation);
    this.setState({ donationLocation });
  }
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
    // Handle registered vs non-register donation
    if(!this.user.id) {
      rules.email = [Validators.required(), Validators.email()];
      rules.name = [Validators.required(), Validators.minLength(3), Validators.maxLength(150), Validators.alphaDash()];
      rules.rgpd = [Validators.required()];
    }


    let errors = validateForm(values, rules);
    if (!isEmpty(errors)) return errors;

    errors = this.state.multipleDayDonation ?
      datesValidationMultipleDays(values.dateSuggestions, 'dateSuggestions', true) : datesValidationOneDay(values.hourSuggestions, 'hourSuggestions');
    if (!isEmpty(errors)) return errors;
  }

  createDonation = async (values, form) => {
    if (form.invalid) return false;

    const isEstablishment = this.isEstablishment();
    const isMobileCollect = this.isMobileCollect();

    let pollSuggestions = this.state.multipleDayDonation ?
      values.dateSuggestions.map(ps => ({ date: ps.date, dayPart: ps.dayPart })) : values.hourSuggestions.map(hour => ({ hour }));

    // Save some data to localStorage
    if(values.isPublicDonation) saveToLocalStorage({ name: values.name, email: values.email });

    let donation = new Donation({
      id: null,
      isPublicDonation: values.isPublicDonation,
      status: DONATION_STATUS.POLL_ON_GOING,
      establishment: isEstablishment ? values.establishment : null,
      mobileCollect: isMobileCollect ? values.mobileCollect : null,
      donationType: values.donationType,
      pollSuggestions,
      pollAnswers: [],
      finalDate: null,
      events: [],
      finalAttendeesUser: [],
      finalAttendeesGuest: [],
      statisticsDate: null,
      donationToken: null,
      createdBy: null,
      createdByGuest: values.isPublicDonation ? { name: values.name, email: values.email } : null,
      createdAt: null,
      updatedAt: null
    });

    // Save new donation
    try {
      const donationCreated = await DonationService.saveDonation(donation, '', true, values.acceptEligibleMail);
      FlashMessageService.createSuccess('Le don a été créé avec succès', 'donation');

      // Redirect to donation page
      const url = `/donation/${donationCreated.donationToken}?admin=${donationCreated.adminToken}&first-visit=true`;
      setTimeout(() => navigate(url), 1000);
    } catch (error) {
      FlashMessageService.createError('Erreur lors de la création du don.. Veuillez nous excuser..!', 'donation-create-form');
    }
  }


  // RENDER

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
            {showNewEstablishment ?
              <Modal title="Trouver un établissement" onClose={this.closeNewEstablishment} modalUrl='/tableau-de-bord/nouveau-don/etablissement' level="2">
                <EstablishmentSelectForm onSelect={this.updateEstablishment} />
              </Modal>
            : null}

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
              {this.state.showNewMobileCollect ?
                <Modal title="Trouver une collecte mobile" onClose={this.closeNewMobileCollect} modalUrl='/tableau-de-bord/nouveau-don/collecte-mobile' level="2">
                  <MobileCollectSelectForm onSelect={this.updateMobileCollect} />
                </Modal> : <textarea {...input} id="free-location"></textarea>}
            </div>
          </fieldset>
        )}
      </Field>
    );
  }
  renderNonRegisteredFields() {
    return (
      <fieldset className="coordinates">
        <legend className="no-style">Vos coordonnées</legend>
        <p className="alert info">Ces données seront supprimées 6 mois après la date finale du don.</p>
        <div>
          <Field name="name">
            {({ input, meta }) => (
              <div className="form-line">
                <div>
                  <label htmlFor="name">Prénom & Nom *</label>
                  <input {...input} id="name" type="text" name="name" maxLength="150" />
                </div>

                {meta.error && meta.touched ?
                  <div className="alert error">
                    {meta.error === 'required' ? <div>Le champ 'Prénom & Nom' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                    {meta.error === 'minLength' ? <div>Le champ 'Prénom & Nom' doit comporter minimum 3 caractères.</div> : null}
                    {meta.error === 'maxLength' ? <div>Le champ 'Prénom & Nom' ne doit pas dépasser 150 caractères.</div> : null}
                    {meta.error === 'alphaDash' ? <span>Seuls les lettres sont autorisées.</span> : null}
                  </div> : null}
              </div>
            )}
          </Field>
          <Field name="email">
            {({ input, meta }) => (
              <div className="form-line">
                <div>
                  <label htmlFor="email">E-mail <span>*</span></label>
                  <input {...input} id="email" type="email" name="email" />
                </div>
                {meta.error && meta.touched ?
                  <div className="alert error">
                    {meta.error === 'required' ? <div>Le champ 'E-mail' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                    {meta.error === 'email' ? <div>L'email n'est pas un e-mail valide. Exemple : example@mail.com</div> : null}
                  </div> : null}
              </div>
            )}
          </Field>
        </div>

        <Field name="rgpd" type="checkbox">
          {({ input, meta }) => (
            <div className="form-line accept-field">
              <div>
                <input {...input} id="accept-rgpd" type="checkbox" />
                <label htmlFor="accept-rgpd">J'accepte que Katellea stocke ces informations durant toute la durée de cette proposition de don <em>(obligatoire)</em> </label>
              </div>
              {meta.error && meta.touched ?
                <div className="alert error">
                  {meta.error === 'required' ? <div>Vous devez cocher cette case afin de continuer.</div> : null}
                </div> : null }
            </div>
          )}
        </Field>
        <Field name="acceptEligibleMail" type="checkbox">
          {({ input }) => (
            <div className="form-line accept-field">
              <div>
                <input {...input} id="accept-eligible-new-donation" type="checkbox" />
                <label htmlFor="accept-eligible-new-donation">J'accepte d'être sollicité lorsque je serai disponible pour un nouveau don <em>(optionnel)</em></label>
              </div>
            </div>
          )}
        </Field>
      </fieldset>
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

              <Field name="isPublicDonation" type="checkbox">
                {({ input }) => (<input className="hide" {...input} type="checkbox" disabled="disabled" />)}
                </Field>

              <div className="radio-line">
                <Field name="donationLocation" type="radio" value="ESTABLISHMENT">
                  {({ input }) => (
                    <div>
                      <label>
                        <span className="block"><img src={DONATION_LOCATION.ESTABLISHMENT.src} alt="" /></span>
                        <input {...input} type="radio" onChange={this.updateDonationLocation} /> Etablissement de l'<acronym title="Etablissement français du sang">EFS</acronym>
                      </label>
                    </div>
                  )}
                </Field>

                <Field name="donationLocation" type="radio" value="MOBILE_COLLECT">
                  {({ input }) => (
                    <div>
                      <label>
                        <span className="block"><img src={DONATION_LOCATION.MOBILE_COLLECT.src} alt="" /></span>
                        <input {...input} type="radio" onChange={this.updateDonationLocation} /> Collecte mobile
                      </label>
                    </div>
                  )}
                </Field>
              </div>
            </fieldset>


            {/* Mobile collect form steps */}
            {this.isMobileCollect() ? this.renderFindMobileCollect() : null}
            {this.showPollSuggestionsMobileCollect() ?
              <>
                {this.state.multipleDayDonation ? <PollSuggestionsMultipleDay />: <PollSuggestionsOneDay />}
                {!this.user.id ? this.renderNonRegisteredFields() : null}
              </>
              : null}


            {/* Establishment form steps */}
            {this.isEstablishment() ? this.renderFindEstablishment() : null}
            {this.showDonationType() ? this.renderDonationType() : null}
            {this.showPollSuggestionsEstablishment() ?
              <>
                <PollSuggestionsMultipleDay />
                {!this.user.id ? this.renderNonRegisteredFields() : null}
              </>
            : null}

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



