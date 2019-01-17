import React, { Component } from 'react';
import store from '../../../services/store';

export default class StatisticsContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: store.getState().user
    };
  }

  render() {
    const { user } = this.state;

    if(!user.hasOwnProperty('stats')) {
      return (
        <div id="statistics" className="block-base">
          <h2>Vos statistiques</h2>
          <div className="alert info">Pas de données</div>
        </div>
      )
    }

    return (
      <div id="statistics" className="block-base">
        <h2>Vos statistiques</h2>
        <div className="text-center">
          <div>
            <img src="/img/donation-type/blood.svg" alt="" />
            <span>{user.stats.bloodDonationDone} { user.stats.bloodDonationDone > 1 ? 'dons' : 'don' } de sang</span>
          </div>

          <div>
            <img src="/img/donation-type/plasma.svg" alt="" />
            <span>{user.stats.plasmaDonationDone} { user.stats.plasmaDonationDone > 1 ? 'dons' : 'don' } de plasma</span>
          </div>

          {
            user.plateletActive ?
            <div>
              <img src="/img/donation-type/platelet.svg" alt="" />
              <span>{user.stats.plateletDonationDone} { user.stats.plateletDonationDone > 1 ? 'dons' : 'don' } de plaquettes</span>
            </div> : null
          }
        </div>

      </div>
    );
  }
}