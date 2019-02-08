import React, { Component } from 'react';
import Modal from '../../../generics/modal';
import store from '../../../services/store';
import MyNetworkDetails from './my-network-details';

export default class MyNetwork extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showDetailsModal: false,
      user: store.getState().user
    }
  }

  // Modal
  showDetailsModal = () => this.setState({ showDetailsModal: true });
  closeDetailsModal = () => this.setState({ showDetailsModal: false });


  render() {
    const { showDetailsModal, user } = this.state;
    const godchildNumber = user.godchildNumber;
    const networkLength = user.network.length;

    if(!godchildNumber && !networkLength) return null;


    return(
      <div className="godchilds-block">
        <div>
          <img src="/icons/menu/speak.svg" alt="" />
          <div>
            Actuellement, vous avez <strong>{networkLength} { networkLength > 1 ? 'personnes' : 'personne' }</strong> dans votre réseau dont <strong>{godchildNumber} { godchildNumber > 1 ? 'parrainées' : 'parrainée' }.</strong>
            <button className="btn btn-small" onClick={this.showDetailsModal}>Voir votre réseau</button>
          </div>
        </div>

        {showDetailsModal ?
          <Modal title="Votre réseau de proches" onClose={this.closeDetailsModal} modalUrl='/tableau-de-bord/parrainage' cssClass="godchild-details">
            <MyNetworkDetails />
          </Modal>
          : null}
      </div>
    )
  }
}