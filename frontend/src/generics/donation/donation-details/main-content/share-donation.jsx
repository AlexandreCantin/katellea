import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { environment } from '../../../../environment';
import { SocialNetworksService } from '../../../../services/social-network.service';
import Modal from '../../../../generics/modal';

const POP_TITLE = `Inscrivez-vous à mon don !`;
const MESSAGE_TEXT = `Venez participer au don du sang que je viens de lancer !`;

export default class ShareDonation extends Component {
  static propTypes = { donationToken: PropTypes.string.isRequired }

  constructor(props) {
    super(props);

    this.donationUrl = `${environment.FRONT_URL}${environment.DONATION_ENDPOINT}/${this.props.donationToken}`

    this.state = {
      showPromoteModal: false,
      showCopiedTooltip: false,
    };
  }

  closePromoteDonationModal = () => this.setState({ showPromoteModal: false, showCopiedTooltip: false });
  showPromoteDonationModal = () => this.setState({ showPromoteModal: true });

  shareOnFacebook = () => { SocialNetworksService.shareOnFacebook(this.donationUrl, POP_TITLE, MESSAGE_TEXT); }
  shareOnTwitter = () => { SocialNetworksService.shareOnTwitter(this.donationUrl, POP_TITLE, MESSAGE_TEXT); }

  copyToClipboard = () => {
    const linkInput = document.getElementById('donation-url-input');
    linkInput.select();
    document.execCommand('copy');

    // Show 'Copied text' for 1 second
    this.setState({ showCopiedTooltip: true });
    setInterval(() => this.setState({ showCopiedTooltip: false }), 1000);
  }


  renderPromoteDonationModal = () => (
    <Modal title="Invitez des personnes à rejoindre votre don !" onClose={this.closePromoteDonationModal} modalUrl="/donation/partage-du-don">
      <div className="copy-link-container">
        En diffusant le lien suivant :
        <div className="button-container">
          <input readOnly type="text" defaultValue={this.donationUrl} id="donation-url-input" />
          <button onClick={this.copyToClipboard}>Copier</button>
          {this.state.showCopiedTooltip ? <div className="tooltip">Copié !</div> : null}
        </div>
      </div>
    </Modal>
  )

  render() {
    const { showPromoteModal } = this.state;

    return (
      <div className="share-actions">

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

          <li>
            <button className="btn reset" onClick={this.showPromoteDonationModal} title="Diffusez un lien direct vers votre don">
              <span className="sr-only">Lien de partage</span>
              <img src="/icons/social-networks/link.svg" alt="" />
            </button>
          </li>
        </ul>

        {showPromoteModal ? this.renderPromoteDonationModal() : null}
      </div>
    );
  }
}
