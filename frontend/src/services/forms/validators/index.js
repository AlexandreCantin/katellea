import ValidatorRequired from './validator-required';
import ValidatorBetween from './validator-between';
import ValidatorPattern from './validator-pattern';
import ValidatorMinInteger from './validator-min-integer';
import ValidatorMaxInteger from './validator-max-integer';
import ValidatorMinLength from './validator-min-length';
import ValidatorMaxLength from './validator-max-length';
import ValidatorDateBefore from './validator-date-before';
import ValidatorDateAfter from './validator-date-after';

import { getToday } from '../date-helpers';

export default class Validators {
  static minInteger(number) { return new ValidatorMinInteger(number); }
  static maxInteger(number) { return new ValidatorMaxInteger(number); }
  static between(min, max) { return new ValidatorBetween(min, max); }

  static minLength(length) { return new ValidatorMinLength(length); }
  static maxLength(length) { return new ValidatorMaxLength(length); }

  static required() { return new ValidatorRequired(); }

  static pattern(pattern) { return new ValidatorPattern('pattern', pattern); }
  static email() { return new ValidatorPattern('email', /^([a-zA-Z0-9.-]+)@([\da-zA-Z0-9.-]+)\.([a-z.]{2,6})$/); }
  static url() { return new ValidatorPattern('url', /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/); }
  static alpha() { return new ValidatorPattern('alpha', /^[a-zA-Z ]*$/); }
  static alphaDash() { return new ValidatorPattern('alphaDash', /^[a-zA-Z_ ]*$/); }
  static alphaNumericDash() { return new ValidatorPattern('alphaNumericDash', /^[a-zA-Z_0-9 ]*$/); }
  static numeric() { return new ValidatorPattern('numeric', /^[0-9]*$/); }

  static dateBefore(date) { return new ValidatorDateBefore('dateBefore', date); }
  static dateAfter(date) { return new ValidatorDateAfter('dateAfter', date); }
  static dateBeforeToday() { return new ValidatorDateBefore('dateBeforeToday', getToday()); }
  static dateAfterToday() { return new ValidatorDateAfter('dateAfterToday', getToday()); }
}