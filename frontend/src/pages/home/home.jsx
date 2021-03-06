import React, { Component, lazy } from 'react';
import Helmet from 'react-helmet';
import { environment } from '../../environment';

import FlashMessage from '../../generics/flash-message';
import HeaderHome from '../../generics/header/home/header-home';
import { RGPDBar } from '../../generics/rgpd/rgpd';
import SponsorCard from '../../generics/sponsor-card/sponsor-card';
import { getSponsorFromUrl } from '../../services/token.service';
import DonationCard from '../../generics/donation/donation-card/donation-card';
import KatelleaFooter from './katellea-footer';

import EscapeLinks from '../../generics/escape-links/escape-links';
import AuthLoginButtons from '../../generics/auth-login-button';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
import DonationCreateFormModal from '../../generics/donation/donation-create-form/donation-create-form-modal';
const FakeUserLogin = lazy(() => import('../../generics/fake-user-login'));

require('./home.scss');

export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      sponsorUser: undefined,
      donation: undefined,
    };
  }

  async componentDidMount() {
    GoogleAnalyticsService.sendPageView(); // Google-analytics

    let data = await getSponsorFromUrl();
    if (data.sponsorUser) this.setState({ sponsorUser: data.sponsorUser });
    if (data.donation) this.setState({ donation: data.donation });
  }

  render() {
    const { sponsorUser, donation } = this.state;
    return (
      <div id="home-page">
        <Helmet>
          <title>Parrainage pour le don du sang, plasma et plaquettes | Katella</title>
          <meta name="robots" content="index,follow" />
        </Helmet>

        <EscapeLinks links={[
          { href: '#header-home', text: 'En-tête de la page' },
          { href: '#main-content', text: 'Contenu principal' },
          { href: '#secondary-content', text: 'Contenu secondaire' },
          { href: '#footer', text: 'Pied de page' }
        ]} />

        <div className="katellea-header">
          <div id="header-home" className="sr-only">&nbsp;</div>
          <HeaderHome />

          <div id="main-content" className="sr-only">&nbsp;</div>
          <div className="presentation-container">
            <h1 className="text-center">Bienvenue sur <span className="no-wrap"><img src="katellea-logo.svg" alt="K" />atellea</span></h1>
            <h2 className="text-center">Katellea facilite l'organisation de dons de sang avec vos amis !</h2>
            <div>
              <div className="login">
                <FlashMessage scope="homePage" />

                {donation ? <DonationCard donation={donation} /> : null}
                {sponsorUser ? <SponsorCard user={sponsorUser} /> : null}

                <div className="katellea-form">
                  <div className="alert warning"><strong>Important !</strong> Dans le cadre de la beta, les établissements et les collectes mobiles sont restreints à la <strong>Bretagne et aux Pays de la Loire</strong> uniquement.</div>

                  {<DonationCreateFormModal modalUrl="/nouveau-don" text="Organiser un nouveau don et sauver des vies" addSubtext />}
                  <div className="life-saved text-center">1 don de sang = 3 vies sauvées</div>

                  <hr />
                  {/* #Beta => error message + hide buttons */}
                  {<AuthLoginButtons />}
                  {!environment.production ? <FakeUserLogin /> : null}

                </div>
              </div>

            </div>
          </div>
        </div>


        <div id="secondary-content" className="sr-only">&nbsp;</div>
        <main className="katellea-main">

          <div className="katellea-steps">
            <h2>Faire un don de sang en 3 étapes</h2>
            <ul className="list-unstyled">
              <li className="clearfix">
                <img src="/icons/social-networks/share.svg" alt="" />
                <span><span>1- Créez une proposition de don (lieu, dates possibles...) et partagez-la à vos amis</span></span>
              </li>
              <li className="clearfix">
                <img src="/icons/menu/calendar.svg" alt="" />
                <span><span>2- Discuter et décidez de la meilleure date pour réaliser ce don</span></span>
              </li>
              <li className="clearfix">
                <img src="/icons/menu/speak.svg" alt="" />
                <span><span>3- Faites votre don ensemble et partagez ce moment sur les réseaux sociaux pour promouvoir le don du sang !</span></span>
              </li>
            </ul>
          </div>


          <div className="gay-part">
            <h2>Don pour les homosexuels</h2>
            <div>

              <div>
                <div className="flag">
                  <img src="s.png" className="lazyload" data-src="/img/rainbow_flag.svg" alt="" />
                </div>
                <div className="text">
                  <p>Depuis le 10 juillet 2016, de nouveaux droits s'appliquent pour les personnes homosexuelles.</p>

                  <div>
                    <div className="women">
                      <h3>Femmes homosexuelles</h3>
                      <p>Même conditions que les personnes hétérosexuelles.</p>
                    </div>

                    <div className="men">
                      <h3>Hommes homosexuels</h3>

                      <h4>Don de plasma</h4>
                      <p>Même conditions que les personnes hétérosexuelles. Toutefois, pour garantir que le plasma du premier don est sain, un deuxième don est nécessaire dans les 60 jours.</p>

                      <h4>Dons du sang et plaquettes</h4>
                      <p>Possible après un an d'abstinence.</p>
                    </div>
                  </div>
                </div>
              </div>
              <a
                className="btn big" target="_blank" rel="noopener noreferrer"
                href="https://dondesang.efs.sante.fr/qui-peut-donner-les-contre-indications/tout-savoir-sur-les-contre-indications"
                title=" sur le site de l'EFS (ouverture dans une nouvelle fenêtre)">
                  En savoir plus
              </a>
            </div>
          </div>


          <div className="katellea-donations">
            <h2>Les dons de sang, plasma et plaquettes permettent...</h2>
            <div>
              <div>
                <h3>...de sauver des vies</h3>
                <p>
                  En cas d'urgence : suite à un accident, lors d'un accouchement...<br />Mais aussi pour le traitement des maladies chroniques.
                </p>
              </div>
              <div>
                <h3>...d'aider la recherche</h3>
                <p>Les dons non utilisés servent les centres de recherche, la formation universitaire,<br />la création de produits d'analyse biologiques...<br /></p>
              </div>
            </div>
          </div>
        </main>

        <div id="footer" className="sr-only">&nbsp;</div>
        <KatelleaFooter />

        <RGPDBar />
      </div>
    );
  }
}
