import { environment } from '../environment';
import { GoogleAnalyticsService } from './google-analytics.service';
import { HotjarService } from './hotjar.service';

const RGPD_CONSENT = 'RGPD_CONSENT';
const RGPD_DATE = 'RGPD_DATE';

class RGPDServiceFactory {

  userAcceptsRGPD() {
    if (this.shouldDisplayRGPD() === true) return false;
    let userResponse = localStorage.getItem(RGPD_CONSENT);
    return userResponse === 'true';
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


  setRGPDConsent(userReponse, reload = false) {
    localStorage.setItem(RGPD_CONSENT, userReponse);
    localStorage.setItem(RGPD_DATE, new Date());

    if (userReponse === true) {
      // Init services
      GoogleAnalyticsService.initGoogleAnalytics();

      // Hotjar downloads 80Ko of JS, so we delay it by one second to prioritize other downloads
      setTimeout(() => HotjarService.initHotjar(), 1000);
    } else {
      // Reload the page : GA and hotjar will not installed after
      if(reload) window.location = environment.FRONT_URL;
    }
  }

}

// Export as singleton
const rgpdService = new RGPDServiceFactory();
Object.freeze(rgpdService);
export { rgpdService  as RGPDService };