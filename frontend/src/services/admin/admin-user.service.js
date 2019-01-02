import { getKatelleaTokenHeaders } from '../helper';
import { environment } from '../../environment';

class AdminUserServiceFactory {

  getAllUsers({ page, pageSize }) {
    let url = `${environment.SERVER_URL}${environment.ADMIN_USER_ENDPOINT}?page=${page}&pageSize=${pageSize}`;
    return this.doRequest(url);
  }

  getUser(userId) {
    let url = `${environment.SERVER_URL}${environment.ADMIN_USER_ENDPOINT}/${userId}`;
    return this.doRequest(url);
  }

  getTotalUserNumber() {
    let url = `${environment.SERVER_URL}${environment.ADMIN_USER_TOTAL_ENDPOINT}`;
    return this.doRequest(url);
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
const adminUserService = new AdminUserServiceFactory();
Object.freeze(adminUserService);
export { adminUserService as AdminUserService };