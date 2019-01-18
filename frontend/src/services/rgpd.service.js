import { environment } from '../environment';
import { GoogleAnalyticsService } from './google-analytics.service';
import { HotjarService } from './hotjar.service';
import { hasOwnProperties } from './helper';

const RGPD_CONSENT = 'RGPD_CONSENT';
const RGPD_DATE = 'RGPD_DATE';

const RGPD_KEYS = ['required','tracking', 'otherServices'];
let RGPD_DEFAULT = { required: false, tracking: false, otherServices: false }

class RGPDServiceFactory {

  constructor() {
    this.rgpd = RGPD_DEFAULT;

    if (localStorage.getItem(RGPD_CONSENT) !== null) {
      try {
        const rgpdValues = JSON.parse(localStorage.getItem(RGPD_CONSENT));
        if(hasOwnProperties(rgpdValues, RGPD_KEYS)) this.rgpd = rgpdValues;
      } catch(err) {}
    }
  }

  shouldDisplayRGPD() {
    if (localStorage.getItem(RGPD_CONSENT) === null) return true;
    if (!localStorage.getItem(RGPD_DATE) === null) return true;

    let dateSaved = localStorage.getItem(RGPD_DATE);
    if (isNaN(Date.parse(dateSaved))) return true;

    let date = new Date(dateSaved);
    let expirationDate = new Date(dateSaved);
    expirationDate.setFullYear(date.getFullYear() + 1);

    return new Date() >= expirationDate;
  }

  acceptsAll() {
    this.rgpd = { required: true, tracking: true, otherServices: true }
    this.saveRGPDValues();
  }

  updateRGPDConsent(userReponse) {
    // Compute new values
    const oldValues = Object.assign({}, this.rgpd);
    this.rgpd = {};
    RGPD_KEYS.forEach(key => this.rgpd[key] = userReponse.hasOwnProperty(key) ? userReponse[key] : oldValues[key])
    this.saveRGPDValues();

    if (oldValues.tracking === false && userReponse.tracking === true) {
      // Init services
      GoogleAnalyticsService.initGoogleAnalytics();

      // Hotjar downloads 80Ko of JS, so we delay it by one second to prioritize other downloads
      setTimeout(() => HotjarService.initHotjar(), 1000);
    } else if(oldValues.tracking === true && userReponse.tracking === false) {
      // Reload the page : GA and hotjar will not installed after
      window.location = environment.FRONT_URL;
    }
  }

  saveRGPDValues() {
    localStorage.setItem(RGPD_CONSENT, JSON.stringify(this.rgpd));
    localStorage.setItem(RGPD_DATE, new Date());
  }

  getRGPDValues() { return this.rgpd; }
  getRGPDValue(field) {
    if(!RGPD_KEYS.includes(field)) throw new Error(`Unknown RGPD field: ${field}`);
    return this.rgpd[field] === true || this.rgpd[field] === 'true';
  }

}

// Export as singleton
const rgpdService = new RGPDServiceFactory();
export { rgpdService  as RGPDService };