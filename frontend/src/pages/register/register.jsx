import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { navigate } from '@reach/router';

import FlashMessage from '../../generics/flash-message';
import SponsorCard from '../../generics/sponsor-card/sponsor-card';

import User from '../../services/user/user';
import { UserService } from '../../services/user/user.service';

import { getSponsorFromUrl } from '../../services/token.service';
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
import { FlashMessageService } from '../../services/flash-message/flash-message.service';

require('./register.scss');

const FROM_RULES = {
  sponsoredByToken: [],
  gender: [],
  name: [Validators.required(), Validators.minLength(3), Validators.maxLength(100)],
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
      if (user.id && user.isProfileComplete()) navigate('/tableau-de-bord');
    });

    // Get sponsor/donation datas
    let data = await getSponsorFromUrl();
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

      // Create form
      this.setState({
        showForm: true,
        initValues: {
          sponsoredByToken: sponsorToken,
          gender: userTempProfile.gender,
          name: userTempProfile.name,
          email: userTempProfile.email
        }
      });
    }
  }

  registerUser = (values) => {
    FlashMessageService.deleteFlashMessage();

    // Create user
    let user = new User({
      id: null,
      name: values.name,
      email: values.email,
      emailVerified: false,
      gender: values.gender,
      currentDonation: null,
      lastDonationDate: null,
      quotaExceeded: false,
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
      godchildNumber: null,
      notificationSettings: null,
      lastNotificationReadDate: null,
      stats: {},
      createdAt: null,
      updatedAt: null
    });

    // Save it
    UserService.saveKatelleaUser(user, true, values.sponsoredByToken, UserService.generateSocialNetworkKey());
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

            <Field name="gender">{({ input }) => (<input {...input} type="hidden" name="gender" readOnly />)}</Field>
            <Field name="sponsoredByToken">{({ input }) => (<input {...input} type="hidden" name="sponsoredByToken" readOnly />)}</Field>

            <Field name="name">
              {({ input, meta }) => (
                <div className="form-line clearfix">
                  <label htmlFor="name">Nom complet*</label>
                  <input {...input} id="name" type="text" name="name" />

                  {meta.error && meta.touched ?
                    <div className="alert error">
                      {meta.error === 'required' ? <div>Le champ 'Nom complet' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                      {meta.error === 'minLength' ? <div>Le champ 'Nom complet' doit comporter minimum 3 caractères.</div> : null}
                      {meta.error === 'maxLength' ? <div>Le champ 'Nom complet' ne doit pas dépasser 100 caractères.</div> : null}
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

            {true ?
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
            <Breadcrumb links={[{ text: 'Créer votre compte', href: '/creer-votre-compte' }]} />
          </div>


          {donation ? <DonationCard donation={donation} /> : null}
          {sponsorUser ? <SponsorCard user={sponsorUser} /> : null}

          {/* #Beta => error message + limiting form display*/}
          <div className="alert warning"><strong>Important !</strong> Dans le cadre de la beta, les établissements et les collectes mobiles sont restreints à la <strong>Loire-Atlantique</strong> uniquement</div>
          {!sponsorUser ? <div className="alert error">Katellea est actuellement en Beta. Vous devez avoir un parrain/marraine pour créer un nouveau compte (sauf pour les 100 premiers utilisateurs)</div> : null }

          <FlashMessage scope="registerForm" />

          {showForm ? this.renderForm() : <div className="login-button"><AuthLoginButtons /></div>}
        </div>
      </main>
    );

  }
}
