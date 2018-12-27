import React, { Component } from 'react';
import { navigate } from '@reach/router';
import { connect } from 'react-redux';

import { UserService } from '../services/user/user.service';
import { FlashMessageService } from '../services/flash-message/flash-message.service';
import store from '../services/store';
import { getSponsorAndDonationFromUrl } from '../services/token.service';
import { DonationService } from '../services/donation/donation.service';
import { isEmpty } from '../services/helper';

class TokenRoute extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sponsor: undefined,
      donation: undefined,
    };
  }

  async componentDidMount() {
    let data = await getSponsorAndDonationFromUrl();

    // No data => redirect to home
    if (!data.sponsorUser && !data.donation) {
      navigate('/');
      return;
    }

    // TODO : handle origin for Google Analytics
    if (data.sponsorUser) this.setState({ sponsor: data.sponsorUser });
    if (data.donation) this.setState({ donation: data.donation });

    // Data but no token => Redirect to home with token
    if (localStorage.getItem('USER_TOKEN') === null) {
      this.redirectWithToken(data);
      return;
    }

    // Get user from Token
    let token = localStorage.getItem('USER_TOKEN');
    UserService
      .getKatelleaUserWithReminder(token)
      .catch(() => this.redirectWithToken(data));
  }


  redirectWithToken(data) {
    let url = '/';
    if (data.donation) url = url.concat('?donation=', data.donation.donationToken);
    else if (data.sponsorUser) url = url.concat('?sponsor=', data.sponsorUser.sponsorToken);
    navigate(url);
  }

  static async getDerivedStateFromProps(newProps, currentState) {
    // We get user from getKatelleaUserWithReminder()
    let user = store.getState().user;
    if(isEmpty(user)) return;

    const sponsor = currentState.sponsor || {};

    // Donation token & user don't have current donation
    if (currentState.donation && user.hasCurrentDonation()) {
      FlashMessageService.createError('Vous avez déjà une proposition de don en cours.', 'dashboard');
      navigate('/tableau-de-bord');
      return;
    }

    if (currentState.donation && !user.hasCurrentDonation()) {
      let canAccess = await DonationService.canAccessDonationByToken(currentState.donation.donationToken);

      if (!canAccess) {
        // No sponsor => add sponsor
        if (user.sponsor === undefined) {
          // Note: then we return to componentWillReceiveProps() method
          UserService.updateUser({}, sponsor.sponsorToken);
        } else {
          // Already sponsored...
          // TODO: One day ? Allow after all ?
          FlashMessageService.createError('Vous ne pouvez pas accéder à cette proposition de don', 'dashboard');
          navigate('/tableau-de-bord');
          return;
        }
      } else {
        UserService.updateUser({ currentDonation: currentState.donation._id });
        DonationService.getCurrentDonation(currentState.donation._id);
        FlashMessageService.createSuccess('Félicitations, vous venez de rejoindre cette proposition de don !', 'current-donation');
        navigate('/don-courant');
        return;
      }
    }

    // User has already a sponsor => dashboard + error
    if (sponsor.sponsorToken && user.sponsor) {
      // TODO: one day, multi-sponsor ?
      FlashMessageService.createError('Vous avez déjà un parrain/marraine', 'dashboard');
      navigate('/tableau-de-bord');
      return;
    }

    // User can't be his own sponsor...
    if (sponsor.id && user.id) {
      FlashMessageService.createError('Vous ne pouvez pas devenir votre propre parrain/marraine !', 'dashboard');
      navigate('/tableau-de-bord');
      return;
    }

    // User don't have a sponsor => add it
    if (sponsor && !user.sponsor) {
      UserService.updateUser({}, sponsor.sponsorToken);
      FlashMessageService.createSuccess(`Félicitations, ${sponsor.name} est devenu votre parrain/marraine !`, 'dashboard');
      navigate('/tableau-de-bord');
      return;
    }


  }

  render() { return <div>&nbsp;</div>; }

}

export default connect(state => ({ user: state.user }))(TokenRoute);