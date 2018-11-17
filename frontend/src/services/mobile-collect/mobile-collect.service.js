import { environment } from '../../environment';
import { MobileCollect } from './mobile-collect';

class MobileCollectServiceFactory {

  getMobileCollectByZipcode(zipcode) {
    const url = `${environment.SERVER_URL}${environment.MOBILE_COLLECT_ENDPOINT_CLOSEST}?zipcode=${zipcode}`;
    return this._getMobileCollect(url);
  }

  getMobileCollectByLocalisation(longitude, latitude) {
    const url = `${environment.SERVER_URL}${environment.MOBILE_COLLECT_ENDPOINT_CLOSEST}?longitude=${longitude}&latitude=${latitude}`;
    return this._getMobileCollect(url);
  }

  _getMobileCollect(url) {
    return new Promise(async (resolve, reject) => {
      let response = await fetch(url);

      if (response.status === 200) {
        let mobileCollectsJSON = await response.json();
        if (mobileCollectsJSON) {
          let mobileCollects = [];
          mobileCollectsJSON.forEach(mcJSON => mobileCollects.push(MobileCollect.fromJSON(mcJSON)));
          resolve(mobileCollects);
          return;
        }
      }

      reject();
    });
  }
}

// Export as singleton
const mobileCollectService = new MobileCollectServiceFactory();
Object.freeze(mobileCollectService);
export { mobileCollectService as MobileCollectService };
