import { environment } from '../../environment';
import { Establishment } from './establishment';

class EstablishmentServiceFactory {

  getEstablishmentByZipcode(zipcode) {
    const url = `${environment.SERVER_URL}${environment.ESTABLISHMENT_ENDPOINT_CLOSEST}?zipcode=${zipcode}`;
    return this._getEstablishment(url);
  }

  getEstablishmentByLocalisation(longitude, latitude) {
    const url = `${environment.SERVER_URL}${environment.ESTABLISHMENT_ENDPOINT_CLOSEST}?longitude=${longitude}&latitude=${latitude}`;
    return this._getEstablishment(url);
  }

  _getEstablishment(url) {
    return new Promise(async (resolve, reject) => {
      let response = await fetch(url);

      if (response.status === 200) {
        let establishmentsJSON = await response.json();
        if (establishmentsJSON) {
          let establishments = [];
          establishmentsJSON.forEach(esJSON => establishments.push(Establishment.fromJSON(esJSON)));
          resolve(establishments);
          return;
        }
      }

      reject();
    });
  }
}

// Export as singleton
const establishmentService = new EstablishmentServiceFactory();
Object.freeze(establishmentService);
export { establishmentService as EstablishmentService };
