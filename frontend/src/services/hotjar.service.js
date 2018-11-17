import { environment } from '../environment';
import { RGPDService } from './rgpd.service';

export class HotjarService {

  static initHotjar() {
    if (environment.HOTJAR_CODE && environment.HOTJAR_CODE !== '' && RGPDService.userAcceptsRGPD()) {
      (function (h, o, t, j, a, r) {
        h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments); };
        h._hjSettings = { hjid: environment.HOTJAR_CODE, hjsv: 6 };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script'); r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }
  }

}