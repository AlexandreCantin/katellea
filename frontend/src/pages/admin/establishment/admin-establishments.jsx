import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { AdminHeader } from '../admin-header';
import { AdminSearch } from '../admin-search';
import Modal from '../../../generics/modal';

import Loader from '../../../generics/loader/loader';
import { AdminCityEstablishmentService } from '../../../services/admin/admin-city-establishment.service';
import { dateFormatDayMonthYearHourMinutSecond } from '../../../services/date-helper';
import { AdminEstablishmentDetails } from './admin-establishment-details';

require('../admin.scss');

export default class AdminEstablishments extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      establishments: [],
      selectedEstablishment: undefined,

      searchTerm: ''
    }
  }

  async componentDidMount() {
    this.getAllEstablishments();
  }

  async getAllEstablishments() {
    try {
      const establishments = await AdminCityEstablishmentService.getAllEstablishments();
      this.setState({ establishments, loading: false });
    } catch(err) {
      this.setState({ establishments:[], loading: false });
    }
  }

  // ESTABLISHMENT SELECTED
  selectEstablishment = (event) => this.setState({ selectedEstablishment: event.target.getAttribute('data-id') });
  clearSelectedEstablishment = () => this.setState({ selectedEstablishment: undefined });

  // SEARCH
  searchEstablishment = async (term) => {
    this.setState({ searchTerm: term });

    try {
      const establishments = await AdminCityEstablishmentService.searchEstablishment(encodeURIComponent(term));
      this.setState({ establishments });
    } catch(err) {
      this.setState({ establishments: [] });
    }
  }
  cancelSearch = () => {
    this.setState({ searchTerm: '' }, () => this.getAllEstablishments());
  }

  // RENDER
  render() {
    const { loading, establishments, searchTerm, selectedEstablishment } =  this.state;

    return (
      <div id="admin-establishments">
        <Helmet title="Etablissements" titleTemplate="%s | Administration - Katellea" />
        <AdminHeader subTitle="Etablissements" />

        <section className="admin-content clearfix">
          <AdminSearch
            label="Nom, code postal" submitText="Chercher des établissements"
            term={searchTerm} cancelFn={this.cancelSearch} submitFn={this.searchEstablishment}
          />

          { loading ? <div className="text-center"><Loader /></div> : null }
          { !loading && establishments.length === 0 ? <div className="alert info">Pas d'établissements trouvés...</div> : null }
          { !loading && establishments.length > 0 ?
            <table className="text-center">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Date de mise à jour</th>
                  <th>Vérifié</th>
                  <th>En savoir plus</th>
                </tr>
              </thead>
              <tbody>
              {
                establishments.map(establishment => (
                  <tr key={establishment._id}>
                    <td>{ establishment._id }</td>
                    <td>{ establishment.name }</td>
                    <td>{ dateFormatDayMonthYearHourMinutSecond(establishment.updatedAt) }</td>
                    <td><img src={establishment.verified ? '/icons/header/available.svg' : '/icons/header/unavailable.svg'} alt="" /></td>
                    <td><button data-id={establishment._id} onClick={this.selectEstablishment} className="btn small">Détails</button></td>
                  </tr>
                ))
              }
              </tbody>
            </table> : null
          }

          { selectedEstablishment ?
            <Modal title="Details de l'établissement" cssClass="admin-establishment-details" onClose={() => this.clearSelectedEstablishment()} noModalUrl>
              <>
                <AdminEstablishmentDetails establishmentId={selectedEstablishment} />
              </>
            </Modal> : null }
        </section>

      </div>
    );
  }
}