import ReactGA from 'react-ga';

import { environment } from '../environment';
import { RGPDService } from '../services/rgpd.service';

export const GA_DIMENSIONS = {
  REGISTER_ORIGIN: 1, // Which service did user used for register ? facebook/twitter/instagram/google
};


/**
 * ReactGA: https://github.com/react-ga/react-ga
 * */
class GoogleAnalyticsServiceFactory {

  constructor() {
    this.started = false;
  }

  initGoogleAnalytics() {
    if (environment.GA_ID && environment.GA_ID !== '') {
      ReactGA.initialize(environment.GA_ID, { gaOptions: { cookieExpires: 31536000 }});

      window.ga('create', environment.GA_ID, 'auto');
      // Anonymous mode if user not accept RGPD : https://developers.google.com/analytics/devguides/collection/analyticsjs/ip-anonymization
      if (!RGPDService.getRGPDValue('tracking')) window.ga('set', 'anonymizeIp', true);
    }

    this.started = true;
  }

  isGASetup() {
    return environment.GA_ID && environment.GA_ID !== '' && this.started;
  }

  setDimension(number, value) {
    ReactGA.ga('set', `dimension${number}`, value);
  }

  // https://developers.google.com/analytics/devguides/collection/analyticsjs/pages
  sendPageView(url) {
    if(!url) url = window.location.pathname + window.location.search;
    ReactGA.pageview(url);
  }

  // https://developers.google.com/analytics/devguides/collection/analyticsjs/events
  // Ex : window.ga('send', 'event', 'Videos', 'play', 'Fall Campaign');
  sendEvent(eventCategory, eventAction, eventLabel, eventValue) {
    ReactGA.event({ category: eventCategory, action: eventAction, label: eventLabel, value: eventValue });
  }

  sendModalView(modalUrl) {
    ReactGA.modalview(modalUrl);
  }

  // https://developers.google.com/analytics/devguides/collection/analyticsjs/social-interactions
  // Ex : window.ga('send', 'social', 'Facebook', 'like', 'http://myownpersonaldomain.com');
  sendSocial(socialNetwork, socialAction, socialTarget) {
    ReactGA.ga('send', 'social', socialNetwork, socialAction, socialTarget);
  }
}

// Export as singleton
const googleAnalyticsService = new GoogleAnalyticsServiceFactory();
export { googleAnalyticsService as GoogleAnalyticsService };