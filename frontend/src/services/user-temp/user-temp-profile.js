export default class UserTempProfile {
  constructor({ userID, origin, accessToken, firstName, lastName, email, gender }) {
    this.userID = userID;
    this.origin = origin;
    this.accessToken = accessToken;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.gender = gender ? gender.toUpperCase() : undefined;
  }

  hasCompleteInformations() {
    return this.firstName !== undefined && this.lastName !== undefined;
  }
}
