import React, { Component } from 'react';
import { connect } from 'react-redux';

import { MenuService } from '../../../services/menu/menu.service';

import HeaderAccountItem from './account-item';
import MinimumDateItem from './minimum-date-item';
import NotificationItem from './notification-item';
import { extractKey } from '../../../services/helper';


require('./header-user.scss');

class HeaderUser extends Component {

  openMenu = (e) => {
    e.preventDefault();
    MenuService.openMenu();
  }

  render() {
    const { user } = this.props;
    return (
      <nav className="katellea">
        <button className="hide-desktop menu-button" onClick={this.openMenu}>MENU</button>
        <HeaderAccountItem user={user} />
        <MinimumDateItem user={user} />
        <NotificationItem user={user} />
      </nav>
    );
  }
}

export default connect(state => extractKey(state, 'user'))(HeaderUser);