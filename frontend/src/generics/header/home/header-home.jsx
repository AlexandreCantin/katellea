import React from 'react';
import { Link } from '@reach/router';

import { FacebookKatelleaLink, TwitterKatelleaLink, InstagramKatelleaLink } from '../../social-network-links';
import { BetaBadge } from '../../beta-badge/beta-badge';


require('./header-home.scss');

const HeaderHome = () => {
  return (
    <header className="home">
      <div className="logo-container fl">
        <Link to="/" title="Retour à l'accueil du site" className="no-wrap">
          <img src="katellea-logo.png" alt="K" />
          <span>atellea</span>
          <BetaBadge />
        </Link>

      </div>
      <ul className="list-unstyled inline-list">
        <li><Link to="/notre-mission-et-notre-equipe">Notre mission et équipe</Link></li>
        <li className="has-image"><FacebookKatelleaLink /></li>
        <li className="has-image"><TwitterKatelleaLink /></li>
        <li className="has-image"><InstagramKatelleaLink /></li>
      </ul>
    </header>

  );
}

export default HeaderHome;