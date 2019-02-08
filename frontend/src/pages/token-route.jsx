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
      addFriendOnGoing: false
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

    // Data but no connected user => Redirect to home with token (for sponsorship)
    if (localStorage.getItem('USER_TOKEN') === null) {
      this.redirectWithToken(data);
      return;
    }

    // Get user from Token
    let token = localStorage.getItem('USER_TOKEN');
    UserService
      .getKatelleaUserWithReminder(token)
      .catch(() => TokenRoute.redirectWithToken(data));
  }


  static redirectWithToken(data) {
    let url = '/';
    if (data.sponsorUser) url = url.concat('?sponsor=', data.sponsorUser.networkToken);
    navigate(url);
  }

  static async getDerivedStateFromProps(nextProps, currentState) {
    // We get user from getKatelleaUserWithReminder()
    let user = store.getState().user;
    if(!user.id) return;

    const sponsor = currentState.sponsor || {};
    if(isEmpty(sponsor)) return;

    // User can't be his own friend...
    if (sponsor.id === user.id) {
      FlashMessageService.createError('Vous ne pouvez pas intégrer votre propre réseau !', 'dashboard');
      navigate('/tableau-de-bord');
      return;
    }

    if (sponsor.id === user.sponsor) {
      FlashMessageService.createError(`${sponsor.name} est déjà dans votre réseau !`, 'dashboard');
      navigate('/tableau-de-bord');
      return;
    }

    // Add as friend
    if(!currentState.addFriendOnGoing) {
      currentState.addFriendOnGoing = true;

      UserService
      .addFriendship(sponsor.networkToken)
      .then(() => {
        FlashMessageService.createSuccess(`Félicitations, vous êtes devenu ami avec ${sponsor.name} !`, 'dashboard');
        navigate('/tableau-de-bord');
        return;
      })
      .catch(() => TokenRoute.redirectWithToken({ sponsorUser: sponsor }));
    }

    return currentState;
  }

  render() { return <div>&nbsp;</div>; }

}

export default connect(state => ({ user: state.user }))(TokenRoute);