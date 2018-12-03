import React, { Component } from 'react';
import { navigate } from '@reach/router';
import { connect } from 'react-redux';

import { isEmpty } from '../../services/helper';
import { UserService } from '../../services/user/user.service';
import { FlashMessageService } from '../../services/flash-message/flash-message.service';
import store from '../../services/store';

class PrivateRouteComponent extends Component {
  constructor(props) {
    super(props);

    let user = store.getState().user;
    this.state = {
      hasUser: !isEmpty(user),
    };
  }


  componentDidMount() {
    if (!this.state.hasUser) {
      if (localStorage.getItem('USER_TOKEN') === null) { this.redirectToHome(); return; }

      let token = localStorage.getItem('USER_TOKEN');
      UserService
        .getKatelleaUserWithReminder(token)
        .catch(err => this.redirectToHome());
    }
  }

  static getDerivedStateFromProps(props, currentState) {
    let user = store.getState().user;
    currentState.hasUser = !isEmpty(user);
    return currentState;
  }


  redirectToHome() {
    FlashMessageService.createError('Vous devez être connecté pour accéder à cette page', 'homePage');
    navigate('/');
  }


  render() {
    const { component: Component } = this.props;
    const { hasUser } = this.state;

    if (hasUser) return <Component />;
    return null;
  }

}

const privateRoute = connect(state => ({ user: state.user }))(PrivateRouteComponent);
export { privateRoute as PrivateRoute };