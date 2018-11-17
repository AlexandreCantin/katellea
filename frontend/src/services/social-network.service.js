import { environment } from '../environment';

class SocialNetworksServiceFactory {
  constructor() {
    this.width = 640;
    this.height = 320;
    this.windowLeft = window.screenLeft || window.screenX;
    this.windowTop = window.screenTop || window.screenY;
    this.windowWidth = window.innerWidth || document.documentElement.clientWidth;
    this.windowHeight = window.innerHeight || document.documentElement.clientHeight;
    this.popupLeft = this.windowLeft + this.windowWidth / 2 - this.width / 2;
    this.popupTop = this.windowTop + this.windowHeight / 2 - this.height / 2;
  }


  createPopup(url, title) {
    const popup = window.open(url, title, 'scrollbars=yes, width=' + this.width + ', height=' + this.height + ', top=' + this.popupTop + ', left=' + this.popupLeft);
    popup.focus();
  }

  shareByEmail(url, subject, text) {
    // Note: we only generate the email body and title. The e-mail will be added by user on his email application
    let mailtoLink = `mailto:?subject=${subject}&body=${text + ' ' + url}`;

    let win = window.open(mailtoLink, subject);
    if (win && win.open && !win.closed) win.close();
  }

  shareOnTwitter(url, title, text) {
    let shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}&via=${environment.applicationName}`;
    this.createPopup(shareUrl, title);
  }

  shareOnFacebook(url, title, text) {
    // FIXME ? Facebook can't handle text when sharing...
    let shareUrl = `https://www.facebook.com/dialog/feed?app_id=${environment.FACEBOOK_APP_ID}&display=popup&description=text&redirect_uri=${url}`;
    this.createPopup(shareUrl, title);
  }
}

// Export as singleton
const socialNetworksService = new SocialNetworksServiceFactory();
Object.freeze(socialNetworksService);
export { socialNetworksService as SocialNetworksService };