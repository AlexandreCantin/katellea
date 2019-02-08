import React, { Component } from 'react';
import { connect } from 'react-redux';

import { environment } from '../../../environment';
import { SocialNetworksService } from '../../../services/social-network.service';
import { SHARE_PREFIXES } from '../../../enum';
import Modal from '../../../generics/modal';
import MyNetwork from './my-network';
import { extractKey } from '../../../services/helper';

const POP_TITLE = `Parrainez un proche !`;
const MESSAGE_TEXT = `Vous hésitez à faire votre premier don du sang ? Je peux vous y accompagner`;

class PromotionContainer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showPromoteModal: false,
      showCopiedTooltip: false
    };
  }

  generateSponsorUrl(prefix) {
    return `${environment.FRONT_URL}/token?sponsor=${prefix}-${this.props.user.networkToken}`;
  }

  closePromoteModal = () => this.setState({ showPromoteModal: false, showCopiedTooltip: false });
  showPromotionModal = () => this.setState({ showPromoteModal: true });

  shareOnFacebook = () => { SocialNetworksService.shareOnFacebook(this.generateSponsorUrl(SHARE_PREFIXES.FACEBOOK), POP_TITLE, MESSAGE_TEXT); }
  shareOnTwitter = () => { SocialNetworksService.shareOnTwitter(this.generateSponsorUrl(SHARE_PREFIXES.TWITTER), POP_TITLE, MESSAGE_TEXT); }

  copyToClipboard = () => {
    const linkInput = document.getElementById('sponsor-url-input');
    linkInput.select();
    document.execCommand('copy');

    // Show 'Copied text' for 1 second
    this.setState({ showCopiedTooltip: true });
    setInterval(() => this.setState({ showCopiedTooltip: false }), 1000);
  }


  renderPromoteModal = () => (
    <Modal title="Parrainez un ami ! Etendez votre réseau !" onClose={this.closePromoteModal} modalUrl="/tableau-de-bord/parrainez-un-ami" cssClass="sponsor">
      <div>Diffusez un message sur les réseaux sociaux :</div>

      <ul className="social-networks list-unstyled inline-list">
        <li>
          <button className="btn reset" onClick={this.shareOnFacebook} title="Communiquez sur Facebook (ouverture dans une nouvelle fenêtre)">
            <span className="sr-only">Diffusez un message sur Facebook</span>
            <img src="/icons/social-networks/facebook.svg" alt="" />
          </button>
        </li>

        <li>
          <button className="btn reset" onClick={this.shareOnTwitter} title="Communiquez sur Twitter  (ouverture dans une nouvelle fenêtre)">
            <span className="sr-only">Diffusez un message sur Twitter</span>
            <img src="/icons/social-networks/twitter.svg" alt="" />
          </button>
        </li>

        {/*
          <li>
            <a onClick={this.showPromotionCode} title="Communiquez sur Instagram">
              <span className="sr-only">Diffusez un message sur Instagram</span>
              <img src="/icons/social-networks/instagram.svg" alt="" />
            </a>
          </li>
        */}

      </ul>

      <div className="sponsor-link-container copy-link-container">
        Ou diffuser le lien suivant :
        <div className="button-container">
          <input readOnly type="text" defaultValue={this.generateSponsorUrl(SHARE_PREFIXES.DIRECT)} id="sponsor-url-input" />
          <button onClick={this.copyToClipboard}>Copier</button>
          {this.state.showCopiedTooltip ? <div className="tooltip">Copié !</div> : null}
        </div>

      </div>
    </Modal>
  )


  render() {
    const { user } = this.props;
    const { showPromoteModal } = this.state;

    let sponsor = user ? user.sponsor : undefined;

    return (
      <div id="promotion-item" className="block-base">
        <h2>Parrainez vos amis ! Etendez votre réseau !</h2>

        {sponsor ? <div className="alert info">Votre parrain/marraine : {sponsor.name}</div> : null}
        <MyNetwork />

        <div>
          <p>
            Parrainez des proches pour réaliser un don avec eux ou les accompagner à leur premier don !<br />
            Ou étendez votre réseau pour inviter davantage de proches à vos propositions de dons :
          </p>
          <div className="button-container text-center">
            <button className="btn big" onClick={this.showPromotionModal}>Parrainez des proches / Etendez votre réseau</button>
          </div>

        </div>
        {showPromoteModal ? this.renderPromoteModal() : null}
      </div>
    );
  }
}


export default connect(state => extractKey(state, 'user'))(PromotionContainer);
