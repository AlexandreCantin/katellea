import React, { Component } from 'react';
import Helmet from 'react-helmet';
import cx from 'classnames';

import { GoogleAnalyticsService } from '../../services/google-analytics.service';

import HeaderHome from '../../generics/header/home/header-home';
import HeaderUser from '../../generics/header/user/header-user';

import Menu from '../../generics/menu/menu';
import { scrollToHash, isEmpty } from '../../services/helper';
import store from '../../services/store';
import Breadcrumb from '../../generics/breadcrumb/breadcrumb';
import EscapeLinks from '../../generics/escape-links/escape-links';

require('./press.scss');

export default class Press extends Component {

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
      <div className={cx('page text-only', { 'has-menu': hasUser })}>
        <Helmet title="Kit presse" titleTemplate="%s | Katellea" />

        <EscapeLinks links={escapeLinks} />

        <div id="header" className="sr-only">&nbsp;</div>
        {hasUser ? <HeaderUser /> : <HeaderHome />}

        <Breadcrumb links={[{ href: '/presse', text: 'Presse' }]} />

        <main id="press">
          {hasUser ? <div id="menu" className="sr-only">&nbsp;</div> : null}
          {hasUser ? <Menu /> : null}

          <div id="main-content">
            <div className="big-title no-wrap text-center">
              <img src="/katellea-logo.svg" alt="K" />
              <span>atellea</span>
            </div>
            <div className="block">
              <h1>Presse</h1>
              <h2>Présentation courte</h2>
              <p>Katellea permet à des personnes voulant faire des dons du sang, mais ne souhaitant pas y aller seule, de solliciter leurs proches via les réseaux sociaux pour ensuite convenir de la date et le lieu pour réaliser ce don. </p>

              <h2>Présentation longue</h2>
              <p>Katellea permet à des personnes voulant faire des dons du sang, mais ne souhaitant pas y aller seule, de solliciter leurs proches via les réseaux sociaux pour ensuite convenir de la date et le lieu pour réaliser ce don. En effet, Katellea vise à attirer de nouveaux donneurs, potentiellement hésitants, mais dont la présence d’un proche rassurerait ou motiverait. Bien sûr, les donneurs actuels pourraient aussi inviter leurs proches à les rejoindre.</p>
              <p>Avec Katellea, une personne est libre de créer une proposition de don partageable sur les réseaux sociaux contenant le lieu (établissement fixe ou collectes mobiles) ainsi des suggestions de dates. Ses proches peuvent ensuite indiquer leurs disponibilités et discuter tous ensemble pour l’organisation de ce don.</p>
              <p>Aucune ressource ne pouvant se substituer au sang et les besoins étant constant, nous espérons limiter les situations d’urgence autour des réserves de sang.</p>

              <h2>Logo</h2>
              <p>Faire clic-droit > Enregistrer l'image sous</p>
              <div className="logo">
                <p>
                  <img src="/katellea-logo.svg" alt="K" /><br />
                  Version SVG - 278 octets
                </p>
                <p>
                  <img src="/katellea-logo.png" alt="K" /><br />
                  Version PNG - 1,3 kilo-octets
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
