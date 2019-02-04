import React, { Component } from 'react';
import { navigate } from '@reach/router';
import { connect } from 'react-redux';

import store from '../services/store';
import Loader from '../generics/loader/loader';
import { getParameterByName } from '../services/helper';
import { FlashMessageService } from '../services/flash-message/flash-message.service';
import { UserService } from '../services/user/user.service';

class EmailVerificationRouteComponent extends Component {

  constructor(props) {
    super(props);

    this.state = {
      token: getParameterByName('token')
    }
  }

  async componentDidMount() {
    // No token ? redirect to homePage
    if(!this.state.token) { this.redirectToHomePage(); return; }

    try {
      await UserService.validateUserMail(this.state.token);
    } catch(err) {
      EmailVerificationRouteComponent.redirectToHomePage('Erreur lors de la validation de votre email.');
    }
  }

  static async getDerivedStateFromProps(newProps, currentState) {
    // We get user from validateUserMail()
    let user = store.getState().user;
    if(!user.id) {EmailVerificationRouteComponent.redirectToHomePage(); return; }

    if(user.emailVerified) {
      FlashMessageService.createSuccess('Votre email a été validé', 'dashboard');
      navigate('/tableau-de-bord');
    } else {
      EmailVerificationRouteComponent.redirectToHomePage('Erreur lors de la validation de votre email.');
    }
  }


  static redirectToHomePage(errorMessage) {
    if(errorMessage) FlashMessageService.createError(errorMessage, 'homePage');
    navigate('/');
  }

  render() {
    return <Loader />;
  }
}


const emailVerificationRoute = connect(state => ({ user: state.user }))(EmailVerificationRouteComponent);
export { emailVerificationRoute as EmailVerificationRoute };