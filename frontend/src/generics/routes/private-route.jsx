import React, { Component } from 'react';
import { Redirect } from '@reach/router';
import { connect } from 'react-redux';

import { UserService } from '../../services/user/user.service';
import { FlashMessageService } from '../../services/flash-message/flash-message.service';
import store from '../../services/store';

class PrivateRouteComponent extends Component {
  constructor(props) {
    super(props);
    let user = store.getState().user;
    this.state = {
      hasUser: user.id,
      loading: true,
      doRedirect: false
    };
  }


  async componentDidMount() {
    if (!this.state.hasUser) {
      if (localStorage.getItem('USER_TOKEN') === null) {
        this.redirectToHome();
        return;
      }

      let token = localStorage.getItem('USER_TOKEN');
      UserService.getKatelleaUserWithReminder(token)
        .then(() => this.setState({ loading: false }))
        .catch(err => this.redirectToHome());
    }
  }

  static getDerivedStateFromProps(props, currentState) {
    let user = store.getState().user;
    currentState.hasUser = user.id;
    return currentState;
  }


  redirectToHome() {
    FlashMessageService.createError('Vous devez être connecté pour accéder à cette page', 'homePage');
    this.setState({ doRedirect: true, loading: false });
  }


  render() {
    const { component: Component } = this.props;
    const { hasUser, loading, doRedirect } = this.state;

    if (hasUser) return <Component {...this.props} />;
    else if(!loading && doRedirect) return <Redirect to="/" noThrow />

    return null;
  }

}

const privateRoute = connect(state => ({ user: state.user }))(PrivateRouteComponent);
export { privateRoute as PrivateRoute };