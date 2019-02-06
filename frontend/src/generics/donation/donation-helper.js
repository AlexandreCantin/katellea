import dayjs from 'dayjs';
import { isEmpty } from "../../services/helper";

export function datesValidationMultipleDays(values, fieldName) {
  let errors = {};
  errors[fieldName] = [];

  // 1 - Check all date are set
  values.forEach((ps, index) => {
    if (isEmpty(errors) && !ps.date) errors[fieldName][index] = { error: 'required' }; // errors.push('Certaines dates ne sont pas renseignées.');
  });
  if (!isEmpty(errors[fieldName])) return errors;

  // 2 - Check all date are in the future
  let today = dayjs();
  values.forEach((ps, index) => {
    if (errors.length > 0) return;
    if (dayjs(ps.date).isBefore(today)) errors[fieldName][index] = { error: 'noFutureDate' }; // errors.push('Certaines dates ne sont pas dans le futur.');
  });
  if (!isEmpty(errors[fieldName])) return errors;

  // 3 - Check all date are distinct
  let length = values.length;
  for (let i = 0; i < length; i++) {
    if (errors.length > 0) break;

    for (let j = i + 1; j < length; j++) {
      if (errors.length > 0) break;

      let date1 = dayjs(values[i].date);
      let date2 = dayjs(values[j].date);

      if (dayjs(date1).isSame(date2)) errors[fieldName][j] = { error: 'sameDate' }; // errors.push('Certaines dates sont identiques');
    }
  }
  if (!isEmpty(errors[fieldName])) return errors;


  return {};
}


export function datesValidationOneDay(values, fieldName) {

  let errors = {};
  errors[fieldName] = [];

  // 1 - Check all date are set
  values.forEach((val, index) => {
    if (isEmpty(errors) && !val) errors[fieldName][index] = { error: 'required' }; // errors.push('Certaines dates ne sont pas renseignées.');
  });
  if (!isEmpty(errors[fieldName])) return errors;

  // 2 - Check all date are distinct
  for (let i = 0; i < values.length; i++) {
    if (errors.length > 0) break;

    for (let j = i + 1; j < values.length; j++) {
      if (errors.length > 0) break;

      if (values[i] === values[j]) errors[fieldName][j] = { error: 'sameDate' };
    }
  }
  if (!isEmpty(errors[fieldName])) return errors;

  return {};
}