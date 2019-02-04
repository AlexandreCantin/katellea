import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from '@reach/router';

import { MenuService } from '../../../services/menu/menu.service';

import HeaderAccountItem from './account-item';
import MinimumDateItem from './minimum-date-item';
import NotificationItem from './notification-item';
import { extractKey } from '../../../services/helper';
import { BetaBadge } from '../../beta-badge/beta-badge';


require('./header-user.scss');

class HeaderUser extends Component {
  static propTypes = {};

  openMenu = (e) => {
    e.preventDefault();
    MenuService.openMenu();
  }

  render() {
    const { user } = this.props;
    return (
      <nav className="katellea">
        <button className="hide-desktop menu-button" onClick={this.openMenu}>MENU</button>
        <Link className="hide-desktop logo" to="/tableau-de-bord" title="Retour à l'accueil du site">
          <img src="/katellea-logo.svg" alt="K" />atellea <BetaBadge />
        </Link>
        <HeaderAccountItem user={user} />
        <MinimumDateItem user={user} />
        <NotificationItem user={user} />
      </nav>
    );
  }
}

export default connect(state => extractKey(state, 'user'))(HeaderUser);