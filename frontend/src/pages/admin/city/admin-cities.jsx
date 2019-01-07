import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { AdminHeader } from '../admin-header';
import { AdminSearch } from '../admin-search';

import Loader from '../../../generics/loader/loader';
import Pagination from '../../../generics/pagination';
import { AdminCityEstablishmentService } from '../../../services/admin/admin-city-establishment.service';
import { dateFormatDayMonthYearHourMinutSecond } from '../../../services/date-helper';

require('../admin.scss');

const PAGE_SIZE = 30;

export default class AdminCities extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      cities: [],
      nbTotalCities: undefined,
      pageSize: PAGE_SIZE,
      currentPage: 0,

      searchTerm: ''
    }
  }

  async componentDidMount() {
    // Get the number of cities
    try {
      const nbTotalCities = await AdminCityEstablishmentService.getTotalCitiesNumber();
      this.setState({ nbTotalCities });
    } catch(err) {}

    // Get the cities first page
    this.getCitiesPage();
  }

  async getCitiesPage() {
    try {
      const cities = await AdminCityEstablishmentService.getAllCities({
        page: this.state.currentPage,
        pageSize: this.state.pageSize
      });
      this.setState({ cities, loading: false });
    } catch(err) {
      this.setState({ cities:[], loading: false });
    }
  }

  updatePage = (pageNumber) => {
    this.setState({ currentPage: pageNumber }, () => this.getCitiesPage());
  }

  // SEARCH
  searchCity = async (term) => {
    this.setState({ searchTerm: term, currentPage: 0, cities: [] });

    try {
      const cities = await AdminCityEstablishmentService.searchCity(encodeURIComponent(term));
      this.setState({ cities });
    } catch(err) {
      this.setState({ cities:[] });
    }
  }
  cancelSearch = () => {
    this.setState({ searchTerm: '', currentPage: 0, cities: [] }, () => this.getCitiesPage());
  }

  // RENDER
  render() {
    const { loading, nbTotalCities, cities, pageSize, currentPage, searchTerm } =  this.state;

    return (
      <div id="admin-cities">
        <Helmet title="Villes" titleTemplate="%s | Administration - Katellea" />
        <AdminHeader subTitle="Villes" />

        <section className="admin-content clearfix">
          <AdminSearch
            label="Nom, code postal" submitText="Chercher des villes"
            term={searchTerm} cancelFn={this.cancelSearch} submitFn={this.searchCity}
          />

          { loading ? <div className="text-center"><Loader /></div> : null }
          { !loading && cities.length === 0 ? <div className="alert info">Pas de villes trouvées...</div> : null }
          { !loading && cities.length > 0 ?
            <table className="text-center">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Dép.</th>
                  <th>Slug</th>
                  <th>Code postal</th>
                  <th>Lon/Lat</th>
                  <th>Date de modification</th>
                </tr>
              </thead>
              <tbody>
              {
                cities.map(city => (
                  <tr key={city._id}>
                    <td>{ city._id }</td>
                    <td>{ city.name }</td>
                    <td>{ city.department }</td>
                    <td>{ city.slug }</td>
                    <td>{ city.zipcode }</td>
                    <td>{ city.longitude }/{ city.latitude }</td>
                    <td>{ dateFormatDayMonthYearHourMinutSecond(city.updatedAt) }</td>
                  </tr>
                ))
              }
              </tbody>
            </table> : null
          }

          { !loading && nbTotalCities && !searchTerm?
            <div className="fr">
              <Pagination currentPage={currentPage} pageSize={pageSize} total={nbTotalCities} onPageChange={this.updatePage} />
            </div> : null }
        </section>

      </div>
    );
  }
}