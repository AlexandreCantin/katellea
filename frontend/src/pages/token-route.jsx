import React, { Component } from 'react';
import { navigate } from '@reach/router';
import { connect } from 'react-redux';

import { UserService } from '../services/user/user.service';
import { FlashMessageService } from '../services/flash-message/flash-message.service';
import store from '../services/store';
import { getSponsorFromUrl } from '../services/token.service';
import { isEmpty } from '../services/helper';

class TokenRoute extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sponsor: undefined,
    };
  }

  async componentDidMount() {
    let data = await getSponsorFromUrl();

    // No data => redirect to home
    if (!data.sponsorUser) {
      navigate('/');
      return;
    }

    // TODO : handle origin for Google Analytics
    if (data.sponsorUser) this.setState({ sponsor: data.sponsorUser });

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
    if (data.sponsorUser) url = url.concat('?sponsor=', data.sponsorUser.sponsorToken);
    navigate(url);
  }

  static async getDerivedStateFromProps(newProps, currentState) {
    // We get user from getKatelleaUserWithReminder()
    let user = store.getState().user;
    if(isEmpty(user)) return;

    const sponsor = currentState.sponsor || {};

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