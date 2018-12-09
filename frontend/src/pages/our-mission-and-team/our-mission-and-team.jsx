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
              <img src="/katellea-logo.png" alt="K" />
              <span>atellea</span>
            </div>
            <div className="block">
              <h1 id="mission">Notre mission</h1>
              <p>
                La principale mission de Katellea se veut simple : amener davantage de personnes  réaliser des dons du sang et de plasma ainsi que combattre les freins associés.
                Aucune ressource ne pouvant se substituer au sang et les besoins étant constant, nous espérons limiter les situations d’urgence autour des réserves de sang et fournir davantage de ressources aux chercheurs.
              </p>

              <p>
                Pour y parvenir, nous misons sur l’implication de chacun, notamment via un système de parrainage par l’intermédiaire d’un proche, rendant ainsi le premier don plus rassurant mais aussi plus convivial !
                Nous souhaitons aussi permettre à tout le monde de communiquer plus efficacement autour des dons du sang auprès de son entourage.
              </p>
              <p>
                Nous savons que le parcours sera semé d’embûches mais nous comptons sur notre détermination pour créer un impact autour de cette problématique.
              </p>

            </div>

            <div className="block">
              <h1 id="equipe">Notre équipe</h1>
              <p>
                {/*Katellea est une ONG (association loi 1901) dont le but est l’amélioration, la maintenance et l’exploitation du site <a href="katellea.fr">katellea.fr</a> et de l’application associé (du même nom).*/}
                Les équipes de Katellea pensent que chacun peut contribuer à sauver davantage de vie, notamment via le don du sang.
                Pour cela, la technologie et les réseaux sociaux peuvent y jouer un rôle prépondérant.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
