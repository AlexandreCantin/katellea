import React, { Component } from 'react';
import Modal from '../../../generics/modal';
import store from '../../../services/store';
import MyGodchildsDetails from './my-godchilds-details';

export default class MyGodchilds extends Component {

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

    if(!user.godchildNumber) return null;

    if(this)
    return(
      <div className="godchilds-block">
        <div>
          <img src="/icons/menu/speak.svg" alt="" />
          <div>
            Actuellement, vous avez parrainé <strong>{user.godchildNumber} { user.godchildNumber > 1 ? 'personnes' : 'personne' }.</strong>
            <button className="btn btn-small" onClick={this.showDetailsModal}>Affichez vos filleul(e)s</button>
          </div>
        </div>

        {showDetailsModal ?
          <Modal title="Proches parrainés" onClose={this.closeDetailsModal} modalUrl='/tableau-de-bord/parrainage' cssClass="godchild-details">
            <MyGodchildsDetails />
          </Modal>
          : null}
      </div>
    )
  }
}