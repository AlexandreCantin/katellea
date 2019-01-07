import { getKatelleaTokenHeaders } from '../helper';
import { environment } from '../../environment';

class AdminCityEstablishmentServiceFactory {

  getAllCities({ page, pageSize }) {
    let url = `${environment.SERVER_URL}${environment.ADMIN_CITY_ENDPOINT}?page=${page}&pageSize=${pageSize}`;
    return this.doRequest(url);
  }

  getTotalCitiesNumber() {
    let url = `${environment.SERVER_URL}${environment.ADMIN_CITY_TOTAL_ENDPOINT}`;
    return this.doRequest(url);
  }

  searchCity(term) {
    let url = `${environment.SERVER_URL}${environment.ADMIN_SEARCH_CITY_ENDPOINT}?term=${term}`;
    return this.doRequest(url);
  }


  getAllEstablishments() {
    let url = `${environment.SERVER_URL}${environment.ADMIN_ESTABLISHMENT_ENDPOINT}`;
    return this.doRequest(url);
  }

  getEstablishment(id) {
    let url = `${environment.SERVER_URL}${environment.ADMIN_ESTABLISHMENT_ENDPOINT}/${id}`;
    return this.doRequest(url);
  }

  searchEstablishment(term) {
    let url = `${environment.SERVER_URL}${environment.ADMIN_SEARCH_ESTABLISHMENT_ENDPOINT}?term=${term}`;
    return this.doRequest(url);
  }

  saveEstablishment({ id, verified, internalComment }) {
    let url = `${environment.SERVER_URL}${environment.ADMIN_ESTABLISHMENT_ENDPOINT}/${id}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      try {
        await fetch(url, { headers, method: 'PUT', body: JSON.stringify({ verified, internalComment }) });
        resolve();
      } catch(err) {
        reject();
      }
    });
  }

  doRequest(url) {
    let headers = getKatelleaTokenHeaders();
    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers });
      if (response.status === 200) {
        let usersData = await response.json();
        if (usersData) { resolve(usersData); return; }
      }
      reject();
    });
  }

}

// Export as singleton
const adminCityEstablishmentService = new AdminCityEstablishmentServiceFactory();
Object.freeze(adminCityEstablishmentService);
export { adminCityEstablishmentService as AdminCityEstablishmentService };