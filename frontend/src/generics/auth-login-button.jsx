import React, { Component } from 'react';
import { navigate } from '@reach/router';

import { getParameterByName, isEmpty } from '../services/helper';

import store from '../services/store';
import { AuthService } from '../services/user-temp/auth.service';
import { UserService } from '../services/user/user.service';

const ORIGINS = ['facebook', 'twitter', 'google', 'instagram'];

// useState() here
export default class AuthLoginButtons extends Component {

  componentDidMount() {
    this.storeUnsubscribeFn1 = store.subscribe(() => {
      let userTempProfile = store.getState().userTempProfile;
      if (isEmpty(userTempProfile) || userTempProfile.origin !== 'facebook') return;

      UserService.getKatelleaUser(userTempProfile.accessToken, 'facebook')
        .catch(() => {
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
    let origin = e.target.attributes['data-origin'].value;
    if (ORIGINS.includes(origin)) AuthService.doAuthLogin(origin);
  };


  render() {
    // #Beta disable button
    if(this.props.disabled) return null;

    return (
      <div className="social-auth-buttons">
        <button data-origin="facebook" className="btn big facebook" onClick={this.doAuthLogin}>Se connecter avec Facebook</button>
      </div>
    );
  }
}