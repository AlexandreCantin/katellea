export default class UserTempProfile {
  constructor({ userID, origin, accessToken, name, email, gender }) {
    this.userID = userID;
    this.origin = origin;
    this.accessToken = accessToken;
    this.name = name;
    this.email = email;
    this.gender = gender ? gender.toUpperCase() : undefined;
  }

  hasCompleteInformations() {
    return this.name !== undefined;
  }
}
