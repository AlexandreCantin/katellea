import React, { Component } from 'react';
import Helmet from 'react-helmet';

import { GoogleAnalyticsService } from '../../services/google-analytics.service';

import HeaderHome from '../../generics/header/home/header-home';
import HeaderUser from '../../generics/header/user/header-user';

import Menu from '../../generics/menu/menu';
import { scrollToHash, isEmpty } from '../../services/helper';
import store from '../../services/store';
import Breadcrumb from '../../generics/breadcrumb/breadcrumb';
import EscapeLinks from '../../generics/escape-links/escape-links';

require('./our-mission-and-team.scss');

export default class OurMissionAndTeam extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hasUser: !isEmpty(store.getState().user)
    };
  }

  componentDidMount() {
    GoogleAnalyticsService.sendPageView();

    // FIXME: Remove manual scroll ?
    scrollToHash();
  }

  render() {
    const { hasUser } = this.state;

    let escapeLinks = [];
    escapeLinks.push({ href: '#header', text: 'En-tête de la page' });
    if (hasUser) escapeLinks.push({ href: '#menu', text: 'Menu' });
    escapeLinks.push({ href: '#main-content', text: 'Contenu principal' });

    return (
      <div className={`page text-only ${hasUser ? 'has-menu' : ''}`}>
        <Helmet title="Notre équipe et notre mission" titleTemplate="%s | Katellea" />

        <EscapeLinks links={escapeLinks} />

        <div id="header" className="sr-only">&nbsp;</div>
        {hasUser ? <HeaderUser /> : <HeaderHome />}

        <Breadcrumb links={[{ href: '/notre-mission-et-notre-equipe', text: 'Notre mission et équipe' }]} />

        <main id="our-mission-and-team">
          {hasUser ? <div id="menu" className="sr-only">&nbsp;</div> : null}
          {hasUser ? <Menu /> : null}

          <div id="main-content">
            <div className="big-title no-wrap text-center">
              <img src="/katellea-logo.svg" alt="K" />
              <span>atellea</span>
            </div>
            <div className="block">
              <h1 id="mission">Notre mission</h1>
              <p>
                La mission de Katellea est simple : permettre à des personnes voulant faire des dons du sang, mais ne souhaitant pas y aller seule, de solliciter leurs proches via les réseaux sociaux pour ensuite convenir de la date et le lieu pour réaliser ce don.
                Aucune ressource ne pouvant se substituer au sang et les besoins étant constant, nous espérons limiter les situations d’urgence autour des réserves de sang.
              </p>

              <p>Nous comptons sur notre détermination pour créer un impact autour de cette problématique.</p>

            </div>

            <div className="block">
              <h1 id="equipe">Notre équipe</h1>
              <p>
                Les équipes de Katellea pensent que chacun peut contribuer à sauver davantage de vie, notamment via le don du sang.
                Pour cela, la technologie et les réseaux sociaux peuvent y jouer un rôle prépondérant.
              </p>
              <div className="team-members clearfix">
                <div>
                  <img src="img/team/alexandre_cantin.jpg" alt="" />
                  <span>Alexandre CANTIN</span>
                  <span className="role">Créateur de Katellea</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
