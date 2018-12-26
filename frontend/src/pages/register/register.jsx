import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { navigate } from '@reach/router';

import FlashMessage from '../../generics/flash-message';
import SponsorCard from '../../generics/sponsor-card/sponsor-card';

import User from '../../services/user/user';
import { UserService } from '../../services/user/user.service';

import { getSponsorAndDonationFromUrl } from '../../services/token.service';
import DonationCard from '../../generics/donation/donation-card/donation-card';
import { isEmpty } from '../../services/helper';
import store from '../../services/store';
import Breadcrumb from '../../generics/breadcrumb/breadcrumb';
import AuthLoginButtons from '../../generics/auth-login-button';

import { validateForm } from '../../services/forms/validate';
import { Form, Field } from 'react-final-form';
import Validators from '../../services/forms/validators';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
import CollapseAlert from '../../generics/collapse-alert';

require('./register.scss');

const FROM_RULES = {
  sponsoredByToken: [],
  donationToken: [],
  gender: [],
  firstName: [Validators.required(), Validators.minLength(3), Validators.maxLength(100)],
  lastName: [Validators.required(), Validators.minLength(3), Validators.maxLength(100)],
  email: [Validators.required(), Validators.email()],
}

export default class Register extends Component {

  constructor(props) {
    super(props);

    this.state = {
      sponsorUser: undefined,
      donation: undefined,

      showForm: false,
      initValues: {},
    };
  }


  async componentDidMount() {
    GoogleAnalyticsService.sendPageView(); // Google-analytics

    // When login with facebook directly on the page
    this.facebookStoreSubscribeFn = store.subscribe(() => {
      let userTempProfile = store.getState().userTempProfile;
      if (!isEmpty(userTempProfile) && !this.state.registerForm) this.initForm();
    });

    // When we get an user : go to dashboard
    this.userStoreUnsubscribeFn = store.subscribe(() => {
      let user = store.getState().user;
      if (!isEmpty(user) && user.isProfileComplete()) navigate('/tableau-de-bord');
    });

    // Get sponsor/donation datas
    let data = await getSponsorAndDonationFromUrl();
    if (data.sponsorUser) this.state.sponsorUser = data.sponsorUser;
    if (data.donation) this.state.donation = data.donation;

    // Try to init the register form
    this.initForm();
  }


  componentWillUnmount() {
    this.facebookStoreSubscribeFn();
    this.userStoreUnsubscribeFn();
  }


  initForm() {
    let userTempProfile = store.getState().userTempProfile;
    if (!isEmpty(userTempProfile) && userTempProfile.hasCompleteInformations()) {

      let sponsorToken = this.state.sponsorUser ? this.state.sponsorUser.sponsorToken : '';
      let donationToken = this.state.donation ? this.state.donation.donationToken : '';

      // Create form
      this.setState({
        showForm: true,
        initValues: {
          sponsoredByToken: sponsorToken,
          donationToken,
          gender: userTempProfile.gender,
          firstName: userTempProfile.firstName,
          lastName: userTempProfile.lastName,
          email: userTempProfile.email
        }
      });
    }
  }

  registerUser = (values) => {
    // Create user
    let user = new User({
      id: null,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      gender: values.gender,
      currentDonation: null,
      lastDonationDate: null,
      lastDonationType: null,
      donationPreference: null,
      bloodType: null,
      sponsor: values.sponsor,
      establishment: null,
      firstVisit: null,
      minimumDate: null,
      sponsorToken: null,
      katelleaToken: null,
      plateletActive: null,
      lastNotificationReadDate: null,
      createdAt: null,
      updatedAt: null
    });

    // Save it
    UserService.saveKatelleaUser(user, true, values.sponsoredByToken, values.donationToken);
  }


  renderForm() {
    return (
      <Form
        onSubmit={this.registerUser}
        validate={(values) => validateForm(values, FROM_RULES)}
        initialValues={this.state.initValues}
        render={({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit} className="form">

            <Field name="gender" component="select">
              {({ input, meta }) => (
                <div className="form-line clearfix">
                  <label htmlFor="gende">Sexe<span>*</span></label>
                  <select {...input} id="gender" name="gender">
                    <option value="MALE">Homme</option>
                    <option value="FEMALE">Femme</option>
                    <option value="UNKNOWN">Ne pas communiquer</option>
                  </select>
                </div>
              )}
            </Field>

            <CollapseAlert
              label="Pourquoi avons-nous besoin de cette information ?"
              text="
                Le nombre de dons du sang maximal par an n'est pas le même pour les femmes et les hommes (respectivement 4 et 6).
                Cette information nous permet ainsi de gérer cela. En son absence, nous prendrons 6 dons par an."
            />

            <Field name="gender">{({ input }) => (<input {...input} type="hidden" name="gender" />)}</Field>
            <Field name="sponsoredByToken">{({ input }) => (<input {...input} type="hidden" name="sponsoredByToken" />)}</Field>
            <Field name="donationToken">{({ input }) => (<input {...input} type="hidden" name="donationToken" />)}</Field>

            <Field name="firstName">
              {({ input, meta }) => (
                <div className="form-line clearfix">
                  <label htmlFor="first-name">Prénom *</label>
                  <input {...input} id="first-name" type="text" name="firstName" />

                  {meta.error && meta.touched ?
                    <div className="alert error">
                      {meta.error === 'required' ? <div>Le champ 'Prénom' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                      {meta.error === 'minLength' ? <div>Le champ 'Prénom' doit comporter minimum 3 caractères.</div> : null}
                      {meta.error === 'maxLength' ? <div>Le champ 'Prénom' ne doit pas dépasser 100 caractères.</div> : null}
                    </div> : null
                  }
                </div>

              )}
            </Field>

            <Field name="lastName">
              {({ input, meta }) => (
                <div className="form-line clearfix">
                  <label htmlFor="last-name">Nom *</label>
                  <input {...input} id="last-name" type="text" name="lastName" />

                  {meta.error && meta.touched ?
                    <div className="alert error">
                      {meta.error === 'required' ? <div>Le champ 'Prénom' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                      {meta.error === 'minLength' ? <div>Le champ 'Prénom' doit comporter minimum 3 caractères.</div> : null}
                      {meta.error === 'maxLength' ? <div>Le champ 'Prénom' ne doit pas dépasser 100 caractères.</div> : null}
                    </div> : null
                  }
                </div>
              )}
            </Field>

            <Field name="email">
              {({ input, meta }) => (
                <div className="form-line clearfix">
                  <label htmlFor="email">E-mail *</label>
                  <input {...input} id="email" type="email" name="email" />

                  {meta.error && meta.touched ?
                    <div className="alert error">
                      {meta.error === 'required' ? <div>Le champ 'E-mail' est obligatoire. Veuillez renseigner ce champ.</div> : null}
                      {meta.error === 'email' ? <div>L'email n'est pas un e-mail valide. Exemple : example@mail.com</div> : null}
                    </div> : null
                  }
                </div>
              )}
            </Field>

            {this.state.sponsorUser ?
              <div className="submit-zone text-center">
                <label htmlFor="submit" className="sr-only">Créer mon profil</label>
                <input id="submit" type="submit" className="btn big" value="Créer mon profil" disabled={invalid} />
              </div> : <div className="alert warning text-center">Vous ne pouvez créer de compte sans avoir de parrain</div>
            }
          </form>
        )} />
    );

  }

  render() {
    const { sponsorUser, donation, showForm } = this.state;

    return (
      <main id="register">
        <Helmet title="Créer votre compte" titleTemplate="%s | Katellea" />

        <div className="register-form">
          <div className="title">
            <h1>Créer votre profil sur Katellea</h1>
            <Breadcrumb links={[{ text: 'Créer votre compte', href: 'creer-votre-compte' }]} />
          </div>

          <FlashMessage scope="registerForm" />

          {donation ? <DonationCard donation={donation} /> : null}
          {sponsorUser ? <SponsorCard user={sponsorUser} /> : null}

          {/* #Beta => error message + limiting form display*/}
          <div className="alert warning"><strong>Important !</strong> Dans le cadre de la beta, les établissements et les collectes mobiles sont restreints à la Loire-Atlantique uniquement</div>
          {!sponsorUser ? <div className="alert error">Katellea est actuellement en Beta. Vous devez avoir un parrain/marraine pour créer un nouveau compte</div> : showForm ? this.renderForm() : <div className="login-button"><AuthLoginButtons /></div>}
        </div>
      </main>
    );

  }
}
