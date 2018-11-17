import { environment } from '../environment';
import { getKatelleaTokenHeaders } from './helper';

export class ContactServiceFactory {

  send(formValues) {
    let url = `${environment.SERVER_URL}${environment.CONTACT_ENDPOINT_URL}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method: 'POST', body: JSON.stringify(formValues) });
      if (response.status === 200) {
        resolve();
        return;
      }
      reject();
    });
  }

}

// Export as singleton
const contactServiceFactory = new ContactServiceFactory();
Object.freeze(contactServiceFactory);
export { contactServiceFactory as ContactService };