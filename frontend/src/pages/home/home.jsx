import React, { Component, lazy } from 'react';
import Helmet from 'react-helmet';
import { environment } from '../../environment';

import FlashMessage from '../../generics/flash-message';
import HeaderHome from '../../generics/header/home/header-home';
import { RGPDBar } from '../../generics/rgpd/rgpd';
import SponsorCard from '../../generics/sponsor-card/sponsor-card';
import { getSponsorAndDonationFromUrl } from '../../services/token.service';
import KatelleaStatistics from './katellea-statistics';
import DonationCard from '../../generics/donation/donation-card/donation-card';
import KatelleaFooter from './katellea-footer';

import Modal from '../../generics/modal';
import EscapeLinks from '../../generics/escape-links/escape-links';
import AuthLoginButtons from '../../generics/auth-login-button';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
const FakeUserLogin = lazy(() => import('../../generics/fake-user-login'));

require('./home.scss');

export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      gayMoreDetailsModal: false,
      sponsorUser: undefined,
      donation: undefined,
    };
  }

  async componentDidMount() {
    GoogleAnalyticsService.sendPageView(); // Google-analytics

    let data = await getSponsorAndDonationFromUrl();
    if (data.sponsorUser) this.setState({ sponsorUser: data.sponsorUser });
    if (data.donation) this.setState({ donation: data.donation });
  }

  // Modal
  showGayDetailsModal = () => this.setState({ gayMoreDetailsModal: true });
  closeGayDetailsModal = () => this.setState({ gayMoreDetailsModal: false });

  renderGayDetailsModal() {
    return (
      <Modal cssclassName="gay-modal" title="Don pour les homosexuelles" onClose={this.closeGayDetailsModal} modalUrl="/don-homosexuel">
        <p>Depuis le 10 juillet 2016, de nouveaux droits s'appliquent pour les personnes homosexuelles.</p>

        <div className="women">
          <h3>Femmes homosexuelles</h3>
          <p>Même conditions que les personnes hétérosexuelles.</p>
        </div>

        <div className="men">
          <h3>Hommes homosexuels</h3>

          <h4>Don de plasma</h4>
          <p>Même conditions que les personnes hétérosexuelles.<br />Toutefois, pour garantir que le plasma du premier don est sain, un deuxième don est nécessaire dans les 60 jours.</p>

          <h4>Dons du sang et plaquettes</h4>
          <p>Possible après un an d'abstinence.</p>
        </div>

      </Modal>
    );
  }
  render() {
    const { sponsorUser, donation, gayMoreDetailsModal } = this.state;
    return (
      <div id="home-page">
        <Helmet>
          <title>Parrainage pour le don du sang, plasma et plaquettes | Katella</title>
          <meta name="robots" content="noindex,follow" />
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
            <div>
              <h1>Bienvenue sur <span className="no-wrap"><img src="katellea-logo.png" alt="K" />atellea</span></h1>

              <p>Katellea vous permet d'accompagner ou d'être accompagné pour réaliser un don du sang ou plasma en 3 étapes :</p>
              <div>
                <ol className="katellea-objectives list-unstyled">
                  <li className="clearfix">
                    <img src="/icons/social-networks/share.svg" alt="" />
                    <span><span>1- Créez une proposition de don (lieu, dates possibles...) et partagez-la sur les réseaux sociaux</span></span>
                  </li>
                  <li className="clearfix">
                    <img src="/icons/menu/calendar.svg" alt="" />
                    <span><span>2- Echangez et décidez ensemble de la meilleure date pour réaliser ce don</span></span>
                  </li>
                  <li className="clearfix">
                    <img src="/icons/menu/speak.svg" alt="" />
                    <span><span>3- Faites votre don ensemble et partagez ce moment sur les réseaux sociaux pour promouvoir le don du sang !</span></span>
                  </li>
                </ol>
              </div>

              <div className="gay-part">
                <div className="flag">
                  <img src="s.png" className="lazyload" data-src="/img/rainbow_flag.svg" alt="" />
                </div>
                <div>
                  <h2 className="no-margin">Don pour les homosexuelles</h2>
                  <div>
                    <ul className="list-unstyled">
                      <li><span className="bold">Femmes homosexuelles</span> : aucune condition spécifique</li>
                      <li><span className="bold">Hommes et dons de plasma</span> : aucune condition spécifique</li>
                      <li><span className="bold">Hommes et dons sang/plaquettes</span> : sous condition</li>
                    </ul>
                    <button className="btn" onClick={this.showGayDetailsModal}>En savoir plus</button>
                  </div>
                </div>
                {gayMoreDetailsModal ? this.renderGayDetailsModal() : null}
              </div>
            </div>

            <div className="login">
              <FlashMessage scope="homePage" />

              {donation ? <DonationCard donation={donation} /> : null}
              {sponsorUser ? <SponsorCard user={sponsorUser} /> : null}

              <div className="katellea-form">
                <p>Vous aussi rejoignez notre communauté de donneurs !</p>

                {/* #Beta => error message + hide buttons */}
                {!sponsorUser ? <div className="alert error">Katellea est actuellement en Beta. Vous devez avoir un parrain/marraine pour créer un nouveau compte</div> : null }
                <div className="alert warning"><strong>Important !</strong> Dans le cadre de la beta, les établissements et les collectes mobiles sont restreints à la Loire-Atlantique uniquement</div>

                {<AuthLoginButtons />}

                {!environment.production ? <FakeUserLogin /> : null}
              </div>
            </div>

          </div>
        </div>


        <div id="secondary-content" className="sr-only">&nbsp;</div>
        <main className="katellea-main">
          {/*<div>
            <h2>Depuis sa création, Katellea a permis le recueil de :</h2>
            <KatelleaStatistics />
          </div>*/}

          <div className="katellea-donations">
            <h2>Les dons de sang, plasma et plaquettes permettent...</h2>
            <div>
              <div>
                <h3>...de sauver des vies</h3>
                <p>
                  En cas d'urgence : suite à un accident ou lors d'un accouchement.<br />Pour le traitement des maladies chroniques.
                </p>
              </div>
              <div>
                <h3>...d'aider la recherche</h3>
                <p>Les dons non utilisés servent à la recherche sur<br />les maladies génétiques.</p>
              </div>
            </div>
          </div>

          {/*<div className="katellea-testimonials">
            <h2>Témoignages</h2>

            <div>
              <div className="katellea-testimonial">
                <div className="katellea-empty">&nbsp;</div>
                <img src="s.png" className="lazyload" data-src="/img/testimonial_1.jpg" alt="" />
                <div className="katellea-text">
                  <p>
                    "Je fais des dons de manière occasionnel. <br />C'est une manière d'aider les gens."<br />
                    <i>Anne</i>
                  </p>
                </div>
              </div>

              <div className="katellea-testimonial">
                <div className="katellea-text">
                  <p className="katellea-right">
                    "Je suis malade chronique.<br />Sans les dons, ma santé se serait beaucoup déterioré."<br />
                    <i>Antoine</i>
                  </p>
                </div>
                <img src="s.png" className="lazyload" data-src="/img/testimonial_2.jpg" alt="" />
                <div className="katellea-empty">&nbsp;</div>
              </div>
            </div>
          </div>*/}
        </main>

        <div id="footer" className="sr-only">&nbsp;</div>
        <KatelleaFooter />

        <RGPDBar />
      </div>
    );
  }
}
