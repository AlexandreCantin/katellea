import React, { Component } from 'react';
import { connect } from 'react-redux';

import HeaderAccountItem from './account-item';
import MinimumDateItem from './minimum-date-item';
import NotificationItem from './notification-item';
import { extractKey } from '../../../services/helper';

require('./header-user.scss');

class HeaderUser extends Component {

  render() {
    const { user } = this.props;
    return (
      <nav className="katellea">
        <HeaderAccountItem user={user} />
        <MinimumDateItem user={user} />
        <NotificationItem user={user} />
      </nav>
    );
  }
}

export default connect(state => extractKey(state, 'user'))(HeaderUser);