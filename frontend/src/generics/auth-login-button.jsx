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

  waitForAuthLogin = e => {
    localStorage.removeItem('USER_TOKEN');
    let origin = e.target.getAttribute('data-origin');
    if (ORIGINS.includes(origin)) AuthService.doAuthLogin(origin);
  };


  render() {
    return (
      <div className="social-auth-buttons">
        <a className="btn big facebook" data-origin="facebook" target="_blank" href={AuthService.computeConnectURL('facebook')} onClick={this.waitForAuthLogin}>Continuer avec Facebook</a>
        {/*<a className="btn big twitter" data-origin="twitter" target="_blank" href={AuthService.computeConnectURL('twitter')} onClick={this.waitForAuthLogin}>Continuer avec Twitter</a>*/}
        <a className="btn big google" data-origin="google" target="_blank" href={AuthService.computeConnectURL('google')} onClick={this.waitForAuthLogin}>Continuer avec Google</a>
        <a className="btn big instagram" data-origin="instagram" target="_blank" href={AuthService.computeConnectURL('instagram')} onClick={this.waitForAuthLogin}>Continuer avec Instagram</a>
      </div>
    );
  }
}