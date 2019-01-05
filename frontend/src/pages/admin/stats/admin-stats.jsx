import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { AdminHeader } from '../admin-header';
import Loader from '../../../generics/loader/loader';
import { AdminStatisticsService } from '../../../services/admin/admin-statistics.service';

import { StatsBarGraph } from './stats-bar-graph';

require('../admin.scss');


export default class AdminStats extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      stats: []
    }
  }

  async componentDidMount() {
    try {
      const stats = await AdminStatisticsService.getLastStats();
      this.setState({ stats, loading: false });
    } catch(err) {
      this.setState({ stats:[], loading: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(this.state.stats !== nextState.stats) return true;
    if(this.state.loading !== nextState.loading) return true;
    return false;
  }


  render() {
    const { loading, stats } =  this.state;

    return (
      <div id="admin">
        <Helmet title="Statistiques" titleTemplate="%s | Administration - Katellea" />
        <AdminHeader subTitle="Statistiques du site" />

        <section className="admin-content">
          { loading ? <div className="text-center"><Loader /></div> : null }
          { !loading && stats.length === 0 ? <div className="alert info">Pas de statistiques trouvées...</div> : null }
          { !loading && stats.length > 0 ?
            <div className="text-center">
              <StatsBarGraph stats={stats} title="Nombre de nouveaux d'utilisateurs (avec parrain/marraine)" fields={['dayNbUsers', 'dayNbSponsoredUsers']} />
              <StatsBarGraph stats={stats} title="Nombre total d'utilisateurs (avec parrain/marraine)" fields={['nbUsers', 'nbSponsoredUsers']} />

              <StatsBarGraph stats={stats} title="Nombre total de don du sang par jour (avec utilisateur avec parrain/marraine)" fields={['bloodDonation', 'nbSponsoredUsers']} />
              <StatsBarGraph stats={stats} title="Nombre total de don de plasma par jour (avec utilisateur avec parrain/marraine)" fields={['plasmaDonation', 'nbSponsoredUsers']} />
              <StatsBarGraph stats={stats} title="Nombre total d'utilisateurs par jour (avec utilisateur avec parrain/marraine)" fields={['plateletDonation', 'nbSponsoredUsers']} />

              <StatsBarGraph stats={stats} title="Nombre de dons du sang par jour (avec utilisateur avec parrain/marraine)" fields={['dayBloodDonation', 'dayBloodSponsoredDonation']} />
              <StatsBarGraph stats={stats} title="Nombre de dons de plasma par jour (avec utilisateur avec parrain/marraine)" fields={['dayPlasmaDonation', 'dayPlasmaSponsoredDonation']} />
              <StatsBarGraph stats={stats} title="Nombre de dons de plaquettes par jour (avec utilisateur avec parrain/marraine)" fields={['dayPlateletDonation', 'dayPlateletSponsoredDonation']} />

              <StatsBarGraph stats={stats} title="Nombre total de dons du sang (avec utilisateur avec parrain/marraine)" fields={['bloodDonation', 'bloodSponsoredDonation']} />
              <StatsBarGraph stats={stats} title="Nombre total de dons de plasma (avec utilisateur avec parrain/marraine)" fields={['plasmaDonation', 'plasmaSponsoredDonation']} />
              <StatsBarGraph stats={stats} title="Nombre total de dons de plaquettes (avec utilisateur avec parrain/marraine)" fields={['plateletDonation', 'plateletSponsoredDonation']} />
            </div>: null
          }
        </section>

      </div>
    );
  }
}