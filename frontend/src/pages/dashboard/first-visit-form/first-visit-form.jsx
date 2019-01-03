import React, { Component } from 'react';
import { navigate } from '@reach/router';
import { connect } from 'react-redux';
import { Form, Field } from 'react-final-form';

import EstablishmentSelectForm from '../../../generics/establishment/select/establishment-select-form';
import { UserService } from '../../../services/user/user.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import FlashMessage from '../../../generics/flash-message';

import UserCompatibility from '../../../generics/blood/user-compatibility';
import SponsorCompatibility from '../../../generics/blood/sponsor-compatibility';
import { extractKey } from '../../../services/helper';
import store from '../../../services/store';
import Modal from '../../../generics/modal';
import Validators from '../../../services/forms/validators';

import { validateForm } from '../../../services/forms/validate';

require('./first-visit-form.scss');

let STEP_2_FROM_RULES = {
  noLastDonation: [],
  lastDonationDate: [Validators.required(), Validators.dateBeforeToday()],
  lastDonationType: [Validators.required()]
}

const STEP_3_FORM_RULES = {
  bloodType: [Validators.required()]
}

class FirstVisitForm extends Component {

  constructor(props) {
    super(props);

    // Form ref
    this.formRef = React.createRef();
    this.noLastDonationRef = React.createRef();
    this.lastDonationDateRef = React.createRef();
    this.lastDonationTypeRef = React.createRef();

    this.state = {
      currentStep: 0,
      finalStepNumber: 4,

      establishment: undefined,
      step2Values: { noLastDonation: false, lastDonationType: 'BLOOD' },
      step3Values: {},

      lastDonationDateDateDisabled: false,
      lastDonationDateTypeDisabled: false,
    };
  }

  setFieldValue(field, value) {
    this.formRef.current.form.getFieldState(field).change(value);
  }
  changeLastDonation = (e) => {
    if (e.target.checked) {

      // Disable 'lastDonationDate' & 'lastDonationType' validators
      STEP_2_FROM_RULES.lastDonationDate = [];
      STEP_2_FROM_RULES.lastDonationType = [];

      // And set empty values
      this.setFieldValue('noLastDonation', true);
      this.setFieldValue('lastDonationDate', '');
      this.setFieldValue('lastDonationType', '');
      this.noLastDonationRef.current.value = true;
      this.lastDonationDateRef.current.value = '';
      this.lastDonationTypeRef.current.value = '';
      this.setState({ lastDonationDateDateDisabled: true, lastDonationDateTypeDisabled: true });
    } else {
      this.setState({ lastDonationDateDateDisabled: false, lastDonationDateTypeDisabled: false });
      this.lastDonationTypeRef.current.value = 'BLOOD';
      this.noLastDonationRef.current.value = false;
      this.setFieldValue('noLastDonation', false);
      this.setFieldValue('lastDonationType', 'BLOOD');

      // Enable  'lastDonationDate' & 'lastDonationType' validators
      STEP_2_FROM_RULES.lastDonationDate = [Validators.required(), Validators.dateBeforeToday()];
      STEP_2_FROM_RULES.lastDonationType = [Validators.required()];
    }
  }

  saveEstablishment = (establishment) => {
    this.setState({ establishment, currentStep: this.state.currentStep + 1 });
  }

  // STEP HANDLERS
  previousStep = () => this.setState({ currentStep: this.state.currentStep - 1 });

  nextStep = (values) => {
    if (this.state.currentStep === 2) this.setState({ step2Values: values })
    if (this.state.currentStep === 3) this.setState({ step3Values: values })
    this.setState({ currentStep: this.state.currentStep + 1 });
  }

  finalStep = async () => {
    // Save user infos
    let user = store.getState().user.copy();
    user.establishment = this.state.establishment;

    let hasLastDonation = !this.state.step2Values.noLastDonation;
    user.lastDonationDate = hasLastDonation ? this.state.step2Values.lastDonationDate : null;
    user.lastDonationDate = hasLastDonation ? this.state.step2Values.lastDonationType : null;

    user.bloodType = this.state.step3Values.bloodType;

    // Update user
    try {
      await UserService.saveKatelleaUser(user);
      if (user.hasCurrentDonation()) {
        FlashMessageService.createSuccess('Votre compte a été créé avec succès. Bienvenue sur Katellea !', 'current-donation');
        setTimeout(() => navigate('don-courant'), 750);
      } else {
        FlashMessageService.createSuccess('Votre compte a été créé avec succès. Bienvenue sur Katellea !', 'dashboard');
      }
    } catch (error) {
      FlashMessageService.createError('Erreur lors de la mise à jour de votre profil. Veuillez nous en excuser..!', 'first-visit-form');
    }
  }


  // Render
  metaStep(stepNumber) {
    if (stepNumber === 0) return { title: 'Bienvenue sur Katellea !', cssClass: 'first-visit-form step-0', hideClose: true };
    if (stepNumber === 1) return { title: 'Etablissement de rattachement', cssClass: 'first-visit-form step-1', hideClose: true };
    if (stepNumber === 2) return { title: 'Votre dernier don', cssClass: 'first-visit-form step-2', hideClose: true };
    if (stepNumber === 3) return { title: 'Votre groupe sanguin', cssClass: 'first-visit-form step-3', hideClose: true };
    if (stepNumber === 4) return { title: 'Merci !', cssClass: 'first-visit-form step-4', hideClose: true };
  }

  renderStep0() {
    return (
      <div>
        <div className="text-center">
          <p>Katellea vous permet d'accompagner ou d'être accompagné pour réaliser un don du sang ou plasma en 3 étapes :</p>
          <div>
            <ol className="katellea-objectives list-unstyled">
              <li className="clearfix">
                <img src="/icons/social-networks/share.svg" alt="" />
                <span><span>1- Créez une proposition de don avec différentes dates et partagez-la sur les réseaux sociaux</span></span>
              </li>
              <li className="clearfix">
                <img src="/icons/menu/calendar.svg" alt="" />
                <span><span>2- Echangez et décidez ensemble de la meilleure date pour réaliser ce don</span></span>
              </li>
              <li className="clearfix">
                <img src="/icons/menu/speak.svg" alt="" />
                <span><span>3- Faites votre don ensemble et partagez ce moment sur les réseaux sociaux pour promouvoir le don du sang !</span></span>
              </li>
            </ol>
          </div>
        </div>

        <div className="alert info text-center">Nous avons besoin encore de vous une petite minute pour compléter votre profil.</div>

        <div className="button-container">
          <button className="btn big" onClick={this.nextStep}>Commencez !</button>
        </div>
      </div>
    );
  }
  renderStep1() {
    return (
      <div>
        <div className="alert info text-center">Pour commencer, nous avons besoin de connaître votre établissment le plus proche.</div>

        {this.state.establishment ? <div className="alert warning">Etablissement sélectionné : {this.state.establishment.name}</div> : null}
        <EstablishmentSelectForm onSelect={this.saveEstablishment} />

        <div className="button-container">
          <button className="btn grey" onClick={this.previousStep}>Retour</button>
        </div>
      </div>
    );
  }
  renderStep2() {
    return (
      <div>
        <div className="alert info text-center">Nous avons besoin des informations concernant votre dernier don.</div>
        <Form
          onSubmit={this.nextStep}
          validate={(values) => validateForm(values, STEP_2_FROM_RULES)}
          initialValues={this.state.step2Values}
          ref={this.formRef}
          render={({ handleSubmit, form, invalid }) => (
            <form onSubmit={handleSubmit}>
              <Field name="noLastDonation" type="checkbox">
                {({ input, meta }) => (
                  <div className="no-donation text-center">
                    <input {...input} id="no-last-donation" type="checkbox" onChange={this.changeLastDonation} ref={this.noLastDonationRef} />
                    <label htmlFor="no-last-donation">Je n'ai jamais fait de don</label>
                  </div>
                )}
              </Field>

              <hr />
              <div className="donation">

                <Field name="lastDonationDate">
                  {({ input, meta }) => (
                    <div className="text-center">
                      <label htmlFor="last-donation">Date du dernier don *</label>
                      <input {...input} id="last-donation" type="date" name="lastDonationDate" placeholder="dd/mm/yyyy" disabled={this.state.lastDonationDateDateDisabled} ref={this.lastDonationDateRef} />

                      {meta.error && (meta.touched || form.getFieldState('noLastDonation').touched) ?
                        < div className="alert error">
                          {meta.error === 'required' ? <div>La date est obligatoire</div> : null}
                          {meta.error === 'dateBeforeToday' ? <div>La date doit être dans le passé</div> : null}
                        </div> : null
                      }
                    </div>

                  )}
                </Field>

                <Field name="lastDonationType" type="select">
                  {({ input, meta }) => (
                    < div className="text-center">
                      <label htmlFor="type-last-donation">Type du dernier don</label>

                      <select {...input} id="type-last-donation" name="lastDonationType" disabled={this.state.lastDonationDateTypeDisabled} ref={this.lastDonationTypeRef} >
                        <option value="BLOOD">Don de sang</option>
                        <option value="PLASMA">Don de plasma</option>
                        <option value="PLATELET">Don de plaquettes</option>
                      </select>

                      {meta.error && (meta.touched || form.getFieldState('noLastDonation').touched) ?
                        < div className="alert error">
                          {meta.error === 'required' ? <div>Le type du don est obligatoire</div> : null}
                        </div> : null
                      }
                    </div>
                  )}
                </Field>
              </div>

              <div className="button-container">
                <button className="btn grey" onClick={this.previousStep}>Retour</button>
                <input type="submit" className="btn next" disabled={invalid} value="Etape suivante" />
              </div>
            </form>
          )} />


      </div >
    );
  }
  renderStep3() {
    return (
      <div>
        <div className="alert info text-center">Pour terminer, nous aimerions connaître votre groupe sanguin</div>

        <Form
          onSubmit={this.nextStep}
          validate={values => validateForm(values, STEP_3_FORM_RULES)}
          initialValues={this.state.step3Values}
          render={({ handleSubmit, invalid, form }) => (
            <form onSubmit={handleSubmit} className="blood-type-choices">

              <Field name="bloodType" type="radio" value="UNKNOWN">
                {({ input }) => (
                  <div className="unknown">
                    <input {...input} id="UNKNOWN" name="bloodType" type="radio" value="UNKNOWN" />
                    <label htmlFor="UNKNOWN">Je ne connais pas mon groupe sanguin</label>
                  </div>

                )}
              </Field>
              <Field name="bloodType" type="radio" value="A+">
                {({ input }) => (
                  <div>
                    <input {...input} id="A+" name="bloodType" type="radio" value="A+" />
                    <label htmlFor="A+">A+</label>
                  </div>
                )}
              </Field>
              <Field name="bloodType" type="radio" value="A-">
                {({ input }) => (
                  <div>
                    <input {...input} id="A-" name="bloodType" type="radio" value="A-" />
                    <label htmlFor="A-">A-</label>
                  </div>
                )}
              </Field>

              <Field name="bloodType" type="radio" value="B+">
                {({ input }) => (
                  <div>
                    <input {...input} id="B+" name="bloodType" type="radio" value="B+" />
                    <label htmlFor="B+">B+</label>
                  </div>
                )}</Field>

              <Field name="bloodType" type="radio" value="B-">
                {({ input }) => (
                  <div>
                    <input {...input} id="B-" name="bloodType" type="radio" value="B-" />
                    <label htmlFor="B-">B-</label>
                  </div>
                )}</Field>

              <Field name="bloodType" type="radio" value="AB+">
                {({ input }) => (
                  <div>
                    <input {...input} id="AB+" name="bloodType" type="radio" value="AB+" />
                    <label htmlFor="AB+">AB+</label>
                  </div>
                )}</Field>

              <Field name="bloodType" type="radio" value="AB-">
                {({ input }) => (
                  <div>
                    <input {...input} id="AB-" name="bloodType" type="radio" value="AB-" />
                    <label htmlFor="AB-">AB-</label>
                  </div>
                )}</Field>

              <Field name="bloodType" type="radio" value="O+">
                {({ input }) => (
                  <div>
                    <input {...input} id="O+" name="bloodType" type="radio" value="O+" />
                    <label htmlFor="O+">O+</label>
                  </div>
                )}
              </Field>

              <Field name="bloodType" type="radio" value="O-">
                {({ input }) => (
                  <div>
                    <input {...input} id="O-" name="bloodType" type="radio" value="O-" />
                    <label htmlFor="O-">O-</label>
                  </div>
                )}
              </Field>

              <div className="text-center">
                <UserCompatibility bloodType={form.getFieldState('bloodType')} />
              </div>


              {this.props.user.sponsor ?
                <div>
                  <SponsorCompatibility sponsorBloodType={this.props.user.sponsor.bloodType} userBloodType={form.getFieldState('bloodType')} />
                </div> : null}

              <div className="button-container">
                <button className="btn grey" onClick={this.previousStep}>Retour</button>
                <input type="submit" className="btn next" disabled={invalid} value="Valider" />
              </div>
            </form>
          )} />



      </div>
    );
  }
  renderStep4() {
    return (
      <div>
        <FlashMessage scope="first-visit-form" />

        <p>
          Le saviez-vous ? Aucun produit ne peut remplacer le sang !<br />
          Sa durée de conservation étant de 42 jours, les stocks de sang dépendent donc la régularité des donneurs.
        </p>


        <div className="button-container">
          <button className="btn grey" onClick={this.previousStep}>Retour</button>
          <button className="btn big" onClick={this.finalStep}>Commencez à utiliser Katellea</button>
        </div>
      </div>
    );
  }
  render() {
    const { user } = this.props;
    const { currentStep } = this.state;

    if (!user.firstVisit) return null;

    return (
      <Modal {...this.metaStep(currentStep)} modalUrl="/tableau-de-bord/premiere-visite">
        {currentStep === 0 ? this.renderStep0() : null}
        {currentStep === 1 ? this.renderStep1() : null}
        {currentStep === 2 ? this.renderStep2() : null}
        {currentStep === 3 ? this.renderStep3() : null}
        {currentStep === 4 ? this.renderStep4() : null}
      </Modal>
    );
  }
}

export default connect(state => extractKey(state, 'user'))(FirstVisitForm);
