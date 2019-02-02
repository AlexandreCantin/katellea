import React, { Component } from 'react';
import { Link } from '@reach/router';
import { extractKey } from '../../services/helper';
import { connect } from 'react-redux';

import { FacebookKatelleaLink, TwitterKatelleaLink, GithubKatelleaLink, InstagramKatelleaLink } from '../social-network-links';
import { BetaBadge } from '../beta-badge/beta-badge';
import { MenuService } from '../../services/menu/menu.service';

require('./menu.scss');

const isActive = ({ isCurrent }) => isCurrent ? { className: 'active' } : null;

class Menu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  closeMenu = (e) => {
    e.preventDefault();
    MenuService.closeMenu();
  }

  linkClicked = (e) => {
    // No preventDefault => we want the native behavior after closing menu
    MenuService.closeMenu();
  }

  render() {
    const { menuOpen } = this.props;

    return (
      <nav className={menuOpen ? 'menu menu-open' : 'menu'}>
        <button onClick={this.closeMenu} className="menu hide-desktop">X</button>

        <div className="katellea-logo text-center">
          <span className="no-wrap">
            <Link onClick={this.linkClicked} to="/tableau-de-bord" title="Retour à l'accueil du site" getProps={isActive}>
              <img src="/katellea-logo.svg" alt="K" />atellea <BetaBadge />
            </Link>
          </span>
          <span className="hide-tablet hide-desktop">Menu</span>
        </div>

        <ul className="menu-content list-unstyled">
          <li>
            <Link onClick={this.linkClicked} to="/tableau-de-bord" getProps={isActive}>
              <img src="/icons/menu/dashboard.svg" alt="" />
              Tableau de bord
            </Link>
          </li>
          <li>
            <Link onClick={this.linkClicked} to="/don-courant" getProps={isActive}>
              <img src="/icons/menu/calendar.svg" alt="" />
              Proposition de don en cours
            </Link>
          </li>
          <li>
            <Link onClick={this.linkClicked} to="/historique-des-dons" getProps={isActive}>
              <img src="/icons/menu/history.svg" alt="" />
              Historique des dons
            </Link>
          </li>
          {/*
            <li>
              <Link to="/sponsorship">
                <img src="/icons/menu/teamwork.svg" alt="" />
                Parrainage
              </Link>
            </li>
          */}
        </ul>

        <ul className="list-unstyled nav-footer">
          {/*<li><Link>Aider Katellea</Link></li>*/}
          <li><Link onClick={this.linkClicked} to="/notre-mission-et-notre-equipe" getProps={isActive}>Notre mission et équipe</Link></li>
          <li><Link onClick={this.linkClicked} to="/mentions-legales" getProps={isActive}>Mentions légales</Link></li>
          {/*<li><li><Link>Presse</Link></li>*/}
          <li><Link to="/nous-contacter" getProps={isActive}>Contact</Link></li>
          <li className="social-networks">
            <FacebookKatelleaLink />
            <TwitterKatelleaLink />
            <InstagramKatelleaLink />
            <GithubKatelleaLink />
          </li>
        </ul>
      </nav >
    );
  }
}

export default connect(state => extractKey(state, 'menuOpen'))(Menu);