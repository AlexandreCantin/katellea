import React, { Component } from 'react';

import { UserService } from '../../services/user/user.service';
import { FlashMessageService } from '../../services/flash-message/flash-message.service';
import store from '../../services/store';
import Validators from '../../services/forms/validators';
import { validateForm } from '../../services/forms/validate';
import { Form, Field } from 'react-final-form';


const rules = {
  firstName: [Validators.required(), Validators.minLength(3), Validators.maxLength(20)],
  lastName: [Validators.required(), Validators.minLength(3), Validators.maxLength(20)],
  email: [Validators.required(), Validators.email()],
  donationPreference: [],
  bloodType: []
}

export default class UpdateAccountForm extends Component {

  constructor(props) {
    super(props);

    this.user = store.getState().user;

    this.formData = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      donationPreference: this.user.donationPreference,
      bloodType: this.user.bloodType,
    }
  }

  updateUser = (newUserData) => {
    UserService.updateUser(newUserData)
      .then(() => FlashMessageService.createSuccess('Votre compte a été mise à jour', 'account'))
      .catch(() => FlashMessageService.createError('Erreur lors de la mise à jour de votre compte. Veuillez réessayer ultérieurement.', 'account'));
  }


  render() {
    return (
      <div className="form update-account block-base">
        <fieldset>
          <legend>Modifier vos informations</legend>

          <Form
            onSubmit={this.updateUser}
            validate={values => validateForm(values, rules)}
            initialValues={this.formData}
            render={({ handleSubmit, reset, submitting, pristine, values, invalid }) => (
              <form onSubmit={handleSubmit}>
                <Field name="firstName">
                  {({ input, meta }) => (
                    <div className="form-line clearfix">
                      <label htmlFor="first-name">Prénom <span>*</span></label>
                      <input {...input} id="first-name" type="text" name="firstName" />
                      {meta.error && meta.touched ?
                        <div className="alert error">
                          {meta.error === 'required' ? <div>Le champ 'Prénom' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                          {meta.error === 'minLength' ? <div>Le champ 'Prénom' doit comporter minimum 3 caractères.</div> : null}
                          {meta.error === 'maxLength' ? <div>Le champ 'Prénom' ne doit pas dépasser 20 caractères.</div> : null}
                        </div> : null}
                    </div>
                  )}
                </Field>

                <Field name="lastName">
                  {({ input, meta }) => (
                    <div className="form-line clearfix">
                      <label htmlFor="last-name">Nom <span>*</span></label>
                      <input {...input} id="last-name" type="text" name="lastName" />
                      {meta.error && meta.touched ?
                        <div className="alert error">
                          {meta.error === 'required' ? <div>Le champ 'Nom' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                          {meta.error === 'minLength' ? <div>Le champ 'Nom' doit comporter minimum 3 caractères.</div> : null}
                          {meta.error === 'maxLength' ? <div>Le champ 'Nom' ne doit pas dépasser 20 caractères.</div> : null}
                        </div> : null}
                    </div>
                  )}
                </Field>

                <Field name="email">
                  {({ input, meta }) => (
                    <div className="form-line clearfix">
                      <label htmlFor="email">E-mail <span>*</span></label>
                      <input {...input} id="email" type="email" name="email" />
                      {meta.error && meta.touched ?
                        <div className="alert error">
                          {meta.error === 'required' ? <div>Le champ 'E-mail' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                          {meta.error === 'email' ? <div>L'email n'est pas un e-mail valide. Exemple : example@mail.com</div> : null}
                        </div> : null}
                    </div>
                  )}
                </Field>

                <Field name="donationPreference" component="select">
                  {({ input, meta }) => (
                    <div className="form-line clearfix">
                      <label htmlFor="donation-preference">Préférence du don <span>*</span></label>
                      <select id="donation-preference" name="donationPreference">
                        <option value="NONE">Pas de préférence</option>
                        <option value="BLOOD">Don de sang</option>
                        <option value="PLASMA">Don de plasma</option>
                        {this.user.plateletActive ? <option value="PLATELET">Don de Plaquettes</option> : null}
                      </select>
                    </div>
                  )}
                </Field>

                <Field name="bloodType" component="select">
                  {({ input, meta }) => (
                    <div className="form-line clearfix">
                      <label htmlFor="blood-type">Votre groupe sanguin <span>*</span></label>
                      <select id="blood-type" name="bloodType">
                        <option value="UNKNOWN">Inconnu</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  )}
                </Field>

                <div className="text-center">
                  <input className="btn big" type="submit" value="Modifier mes informations" disabled={invalid} />
                </div>

              </form>
            )} />

          {/*

            <div className="form-line clearfix">
              <label htmlFor="donation-preference">Préférence du don <span>*</span></label>

              <select id="donation-preference" name="donationPreference" onChange={validateField(this, updateForm)}>
                <option value="NONE">Pas de préférence</option>
                <option value="BLOOD">Don de sang</option>
                <option value="PLASMA">Don de plasma</option>
                {this.user.plateletActive ? <option value="PLATELET">Don de Plaquettes</option> : null}
              </select>
            </div>

            <div className="form-line clearfix">
              <label htmlFor="blood-type">Votre groupe sanguin <span>*</span></label>
              <select id="blood-type" name="bloodType" onChange={validateField(this, updateForm)} >
                <option value="UNKNOWN">Inconnu</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="text-center">
              <input className="btn big" type="submit" value="Modifier mes informations" disabled={!updateForm.isValid()} />
            </div>
            </form>*/}



        </fieldset>
      </div>
    );
  }
}