import React, { Component } from 'react';
import { navigate } from '@reach/router';

import { getParameterByName, isEmpty } from '../services/helper';

import store from '../services/store';
import { AuthService } from '../services/user-temp/auth.service';

const ORIGINS = ['facebook', 'twitter', 'google', 'instagram'];

// useState() here
export default class AuthLoginButtons extends Component {

  componentDidMount() {
    this.storeUnsubscribeFn1 = store.subscribe(() => {
      let userTempProfile = store.getState().userTempProfile;

      if (isEmpty(userTempProfile) || !userTempProfile.origin) return;

      // No user found
      if (userTempProfile.hasCompleteInformations()) {
        let url = '/creer-votre-compte';

        let sponsorToken = getParameterByName('sponsor');
        if (sponsorToken) url += `?sponsor=${sponsorToken}`;

        let donationToken = getParameterByName('donation');
        if (donationToken) url += `?donation=${donationToken}`;

        navigate(url);
        return;
      }
    });

    // When we get an user : go to dashboard
    this.storeUnsubscribeFn2 = store.subscribe(() => {
      let user = store.getState().user;
      if (!isEmpty(user) && user.isProfileComplete()) {
        if (user.hasCurrentDonation()) { navigate('/don-courant'); return; }
        navigate('/tableau-de-bord');
      }
    });
  }

  componentWillUnmount() {
    this.storeUnsubscribeFn1();
    this.storeUnsubscribeFn2();
  }

  doAuthLogin = e => {
    e.preventDefault();
    let origin = e.target.getAttribute('data-origin');
    if (ORIGINS.includes(origin)) AuthService.doAuthLogin(origin);
  };


  render() {
    return (
      <div className="social-auth-buttons">
        <button data-origin="facebook" className="btn big facebook" onClick={this.doAuthLogin}>Se connecter avec Facebook</button>
        <button data-origin="twitter" className="btn big twitter" onClick={this.doAuthLogin}>Se connecter avec Twitter</button>
        <button data-origin="google" className="btn big google" onClick={this.doAuthLogin}>Se connecter avec Google</button>
        <button data-origin="instagram" className="btn big instagram" onClick={this.doAuthLogin}>Se connecter avec Instagram</button>
      </div>
    );
  }
}