import React, { Component } from 'react';
import { connect } from 'react-redux';

import { UserService } from '../../services/user/user.service';

class CouldHaveUserRouteComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPage: false,
    };
  }


  componentDidMount() {
    if (localStorage.getItem('USER_TOKEN')) {
      let token = localStorage.getItem('USER_TOKEN');
      UserService.getKatelleaUserWithReminder(token)
        .then(() => this.setState({ showPage: true }))
        .catch(() => this.setState({ showPage: true }));
    } else this.setState({ showPage: true });
  }


  render() {
    const { component: Component } = this.props;
    const { showPage } = this.state;

    if (showPage) return <Component {...this.props} />;
    return null;
  }

}

const couldHaveUserRoute = connect(state => ({ user: state.user }))(CouldHaveUserRouteComponent);
export { couldHaveUserRoute as CouldHaveUserRoute };