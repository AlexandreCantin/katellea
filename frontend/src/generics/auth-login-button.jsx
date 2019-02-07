import React, { Component } from 'react';
import { navigate } from '@reach/router';

import { getParameterByName, isEmpty, capitalize } from '../services/helper';

import store from '../services/store';
import { AuthService } from '../services/user-temp/auth.service';
import { RGPDService } from '../services/rgpd.service';
import Modal from './modal';

const ORIGINS = ['facebook', 'twitter', 'google', 'instagram'];

// useState() here
export default class AuthLoginButtons extends Component {
  static propTypes = { };

  constructor(props) {
    super(props);

    this.state = {
      showRGPDModal: false,
      origin: undefined
    }
  }

  componentDidMount() {
    this.storeUnsubscribeFn1 = store.subscribe(() => {
      let userTempProfile = store.getState().userTempProfile;

      if (isEmpty(userTempProfile) || !userTempProfile.origin) return;

      // No user found
      if (userTempProfile.hasCompleteInformations()) {
        let url = '/creer-votre-compte';

        let sponsorToken = getParameterByName('sponsor');
        if (sponsorToken) url += `?sponsor=${sponsorToken}`;

        let donationToken = getParameterByName('donation');
        if (donationToken) url += `?donation=${donationToken}`;

        navigate(url);
        return;
      }
    });

    // When we get an user : go to dashboard
    this.storeUnsubscribeFn2 = store.subscribe(() => {
      let user = store.getState().user;
      if (user.id && user.isProfileComplete()) {
        if (user.hasCurrentDonation()) { navigate(user.computeCurrentDonationUrl()); return; }
        navigate('/tableau-de-bord');
      }
    });
  }

  componentWillUnmount() {
    this.storeUnsubscribeFn1();
    this.storeUnsubscribeFn2();
  }

  closeRGPDModal = (e) => this.setState({ showRGPDModal: false, origin: undefined });

  waitForAuthLogin = e => {
    let origin = e.target.getAttribute('data-origin');
    localStorage.removeItem('USER_TOKEN');

    // Not accepts RGPD ? Temporary modal
    if(!RGPDService.getRGPDValue('required')) {
      e.preventDefault();
      this.setState({ showRGPDModal: true, origin });
      return;
    }

    // RGPD accepted => doLogin
    if (ORIGINS.includes(origin)) AuthService.doAuthLogin(origin);
  };

  acceptRGPDAndLogin = (e) => {
    RGPDService.acceptsAll();
    let origin = e.target.getAttribute('data-origin');
    if (ORIGINS.includes(origin)) AuthService.doAuthLogin(origin);
  }

  computeLinkTitle(origin) {
    return `Se connecter avec ${capitalize(origin)} (ouverture dans une nouvelle fenêtre)`;
  }
  computeLinkText(origin) {
    return `Continuer avec ${capitalize(origin)}`;
  }

  // RENDER
  renderRGPDModal() {
    const origin = this.state.origin;

    return (
      <Modal title="Vous devez accepter les condtions du RGPD pour continuer" onClose={this.closeRGPDModal} modalUrl='/tableau-de-bord/parrainage' cssClass="rgpd-auth-modal">
        <div>
          <p>
            Pour fonctionner, Katellea stocke un certain nombre de données dites personnelles (nom, email, groupe sanguin...).
            De même, Katellea utilise un ensemble de service tiers (Youtube, Google Analytics...) dont vous pouvez accepter ou refuser l'utilisation.
          </p>

          <p>Pour vous connecter, votre <strong>“consentement positif et explicite”</strong> pour la récupération de ces données est nécessaire.</p>

          <div className="buttons text-center">
            <a className="btn big" data-origin={origin} href={AuthService.computeConnectURL(origin)} target="_blank" title={this.computeLinkTitle(origin)} onClick={this.acceptRGPDAndLogin} >Tout accepter et continuer</a>
            <button className="btn">Personnaliser</button>
          </div>
        </div>
      </Modal>
    );
  }

  render() {
    const socialNetworks = ['facebook',/*'twitter',*/'google','instagram'];

    return (
      <>
        <p>En créant un compte, vous pourrez : consulter vos historiques de don, gérer vos périodes d'indisponibilité ou encore créer un réseau privé pour vos dons !</p>
        { this.state.showRGPDModal ? this.renderRGPDModal() : null }

        <div className="social-auth-buttons">
          {socialNetworks.map(origin => (
            <a key={origin}
              className={"btn big "+ origin}
              data-origin={origin}
              target="_blank"
              title={this.computeLinkTitle(origin)}
              href={AuthService.computeConnectURL(origin)}
              onClick={this.waitForAuthLogin}>
                {this.computeLinkText(origin)}
            </a>
          ))}
        </div>
      </>
    );
  }
}