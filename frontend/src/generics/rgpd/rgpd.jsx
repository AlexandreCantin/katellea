import React, { Component } from 'react';

import RGPDModal from './rgpd-modal';
import { RGPDService } from '../../services/rgpd.service';

require('./rgpd-bar.scss');

export class RGPDBar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      show: RGPDService.shouldDisplayRGPD(),
      showRGPDModal: false,
    };
  }

  showRGPDModal = () => {
    this.setState({ showRGPDModal: true });
  }
  closeRGPDModal = () => {
    if(!RGPDService.shouldDisplayRGPD()) this.hideBar();
    this.setState({ showRGPDModal: false });
  }

  acceptRGPD = () => {
    RGPDService.acceptsAll();
    this.hideBar();
  }

  acceptOnlyNecessaryRGPD = () => {
    RGPDService.updateRGPDConsent({ required: true });
    this.hideBar();
  }

  hideBar = () => {
    this.setState({ show: false });
  }

  render() {
    if (!this.state.show) return null;

    return (
      <div className="rgpd-banner">

        <p>En poursuivant votre navigation sur ce site, vous acceptez nos conditions d'utilisation de vos données personnelles (RGPD).</p>
        <ul className="list-unstyled inline-list actions">
          <li><button onClick={this.acceptRGPD}><b>Tout accepter</b></button></li>
          <li><button onClick={this.acceptOnlyNecessaryRGPD}>Accepter seulement le nécessaire au bon fonctionnement de Katellea</button></li>
          <li><button onClick={this.showRGPDModal}>Personnaliser</button></li>
        </ul>
        {this.state.showRGPDModal ? <RGPDModal closeModalFn={this.closeRGPDModal} /> : null}
      </div>

    );
  }
}