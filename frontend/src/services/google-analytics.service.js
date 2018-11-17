import { environment } from '../environment';
import { RGPDService } from '../services/rgpd.service';

class GoogleAnalyticsServiceFactory {

  initGoogleAnalytics() {
    window.ga = window.ga || function () { (window.ga.q = window.ga.q || []).push(arguments); };
    window.ga.l = +new Date();

    if (environment.GA_ID && environment.GA_ID !== '') {
      window.ga('create', environment.GA_ID, 'auto');
      // Anonymous mode if user not accept RGPD : https://developers.google.com/analytics/devguides/collection/analyticsjs/ip-anonymization
      if (!RGPDService.userAcceptsRGPD()) window.ga('set', 'anonymizeIp', true);
    }
  }

  // https://developers.google.com/analytics/devguides/collection/analyticsjs/pages
  sendPageView(url = window.location.pathname) {
    window.window.ga('send', 'pageview', url);
  }

  // https://developers.google.com/analytics/devguides/collection/analyticsjs/events
  // Ex : window.ga('send', 'event', 'Videos', 'play', 'Fall Campaign');
  sendEvent(eventCategory, eventAction, eventLabel, eventValue) {
    window.window.ga('send', 'event', eventCategory, eventAction, eventLabel, eventValue);
  }

  // https://developers.google.com/analytics/devguides/collection/analyticsjs/social-interactions
  // Ex : window.ga('send', 'social', 'Facebook', 'like', 'http://myownpersonaldomain.com');
  sendSocial(socialNetwork, socialAction, socialTarget) {
    window.window.ga('send', 'social', socialNetwork, socialAction, socialTarget);
  }
}

// Export as singleton
const googleAnalyticsService = new GoogleAnalyticsServiceFactory();
Object.freeze(googleAnalyticsService);
export { googleAnalyticsService as GoogleAnalyticsService };