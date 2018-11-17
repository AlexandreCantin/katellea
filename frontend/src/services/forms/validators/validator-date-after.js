import { isValidDate, toSimpleDate } from '../date-helpers';

export default class ValidatorDateAfter {

  constructor(name, date) {
    this.errorName = name;

    if (!isValidDate(date)) throw new Error(date + ' is an invalid date. Make sure to respect the \'yyyy-MM-dd\' format');

    this.date = date instanceof Date ? date : toSimpleDate(new Date(date));
  }

  isValid(value) {
    // No data : validation disable
    if (!value) return true;

    let date = new Date(value);
    return toSimpleDate(date) > this.date;
  }
}
