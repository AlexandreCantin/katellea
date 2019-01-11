import React, { Component } from 'react';
import RGPDModal from '../../generics/rgpd/rgpd-modal';
import { Link } from '@reach/router';
import { FacebookKatelleaLink, TwitterKatelleaLink, GithubKatelleaLink } from '../../generics/social-network-links';

export default class KatelleaFooter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRGPDModal: false
    };
  }

  showRGPDModal = () => { this.setState({ showRGPDModal: true }); }
  closeRGPDModal = () => { this.setState({ showRGPDModal: false }); }

  render() {
    const { showRGPDModal } = this.state;
    return (
      <footer className="katellea-footer">
        <div></div>

        <div className="katellea-links">
          <ul className="list-unstyled">
            <li>
              <button className="btn reset" onClick={this.showRGPDModal} title="Consulter notre Politique de confidentialité et utilisation de vos données personnelles (RGPD)">RGPD</button>
            </li>
            <li><Link to="/nous-contacter" title="Nous contacter">Contact</Link></li>
            <li><Link to="/mentions-legales" title="Mentions légales">Mentions légales</Link></li>
            <li><Link to="/presse" title="Presse">Presse</Link></li>
            {/*<li className="katellea-donation"><span><a href="#" title="">Don</a></span></li>*/}
          </ul>
        </div>

        <div className="katellea-other">
          <ul className="list-unstyled">
            <li><FacebookKatelleaLink /></li>
            <li><TwitterKatelleaLink /></li>
            <li><GithubKatelleaLink /></li>
          </ul>
        </div>
        {showRGPDModal ? <RGPDModal closeModalFn={this.closeRGPDModal} showButtons={false} /> : null}
      </footer>
    );
  }

}