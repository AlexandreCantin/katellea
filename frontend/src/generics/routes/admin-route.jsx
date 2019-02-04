import React, { Component } from 'react';
import { Redirect } from '@reach/router';
import { connect } from 'react-redux';

import { UserService } from '../../services/user/user.service';
import store from '../../services/store';
import { isEmpty } from '../../services/helper';

class AdminRouteComponent extends Component {
  constructor(props) {
    super(props);
    let user = store.getState().user;
    this.state = {
      hasUser: user.id,
      isAdmin: false,
      loading: true,
      doRedirect: false
    };
  }


  async componentDidMount() {
    if (this.state.hasUser) {
      UserService.isUserAdmin()
        .then(() => this.setState({ isAdmin: true, loading: false }))
        .catch(() => this.redirectToHome());
        return;
    }

    if (localStorage.getItem('USER_TOKEN') === null) {
      this.redirectToHome();
      return;
    }

    let token = localStorage.getItem('USER_TOKEN');
    UserService.getKatelleaUserWithReminder(token)
      .catch(() => this.redirectToHome());
  }

  componentDidUpdate() {
    const finalUpdateDone = this.state.isAdmin || this.state.doRedirect;
    if(this.state.hasUser && !finalUpdateDone) {
      UserService.isUserAdmin()
        .then(() => this.setState({ doRedirect: false, loading: false, isAdmin: true }))
        .catch(() => this.setState({ doRedirect: true, loading: false, isAdmin: false }));
    }
  }

  static getDerivedStateFromProps(props, currentState) {
    let user = store.getState().user;
    currentState.hasUser = user.id;
    return currentState;
  }


  redirectToHome() {
    this.setState({ doRedirect: true, loading: false, isAdmin: false });
  }


  render() {
    const { component: Component } = this.props;
    const { isAdmin, loading, doRedirect } = this.state;

    if(loading) return null;
    else if(doRedirect) return <Redirect to="/not-found" noThrow />
    else if(isAdmin) return <Component {...this.props} />
    return null;
  }

}

const adminRoute = connect(state => ({ user: state.user }))(AdminRouteComponent);
export { adminRoute as AdminRoute };