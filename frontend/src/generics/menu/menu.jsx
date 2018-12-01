import React, { useState } from 'react';
import { Link } from '@reach/router';
import { FacebookKatelleaLink, TwitterKatelleaLink, GithubKatelleaLink, InstagramKatelleaLink } from '../social-network-links';
import { BetaBadge } from '../beta-badge/beta-badge';

require('./menu.scss');

function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <nav className={open ? 'menu menu-open' : 'menu'}>
      <button onClick={() => setOpen(!open)} className="menu hide-desktop">
        {open ? 'X' : 'MENU'}
      </button>

      <div className="katellea-logo text-center">
        <span className="hide-mobile no-wrap">
          <Link to="/tableau-de-bord" title="Retour à l'accueil du site">
            <img src="katellea-logo.png" alt="K" />atellea <BetaBadge />
          </Link>
        </span>
        <span className="hide-tablet hide-desktop">Menu</span>
      </div>

      <ul className="menu-content list-unstyled">
        <li>
          <Link to="/tableau-de-bord">
            <img src="/icons/menu/dashboard.svg" alt="" />
            Tableau de bord
            </Link>
        </li>
        <li>
          <Link to="/don-courant">
            <img src="/icons/menu/calendar.svg" alt="" />
            Proposition de don en cours
            </Link>
        </li>
        <li>
          <Link to="/historique-des-dons">
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
        <li><Link to="/notre-mission-et-notre-equipe">Notre mission et équipe</Link></li>
        <li><Link to="/mentions-legales">Mentions légales</Link></li>
        {/*<li><li><Link>Presse</Link></li>*/}
        <li><Link to="/nous-contacter">Contact</Link></li>
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

export default Menu;