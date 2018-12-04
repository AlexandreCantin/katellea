import dayjs from 'dayjs';

// Based on day-js : https://github.com/iamkun/dayjs/blob/master/docs/en/API-reference.md
export const dateFormat = 'YYYY-MM-DD';
export const simpleDateFormat = 'DD/MM/YYYY';
export const prettydateFormat = 'ddd. DD/MM/YYYY';
export const prettyLongDateFormat = 'dddd DD/MM/YYYY';
export const prettyFullDateFormat = 'DD/MM/YYYY à HH:mm:ss';
export const prettyVeryFullDateFormat = 'dddd DD/MM/YYYY à HH[h]mm';
export const prettyHourFormat = 'HH:mm';


export function dateFormatYearMonthDay(date) {
  return dayjs(date).format(dateFormat);
}

export function dateFormatDayMonthYear(date) {
  return dayjs(date).format(simpleDateFormat);
}

export function dateFormatShortDayDayMonthYear(date) {
  return dayjs(date).format(prettydateFormat);
}

export function dateFormatLongDayDayMonthYear(date) {
  return dayjs(date).format(prettyLongDateFormat);
}

export function dateFormatDayMonthYearHourMinutSecond(date) {
  return dayjs(date).format(prettyFullDateFormat);
}

export function dateFormatLongDayDayMonthYearHourMinut(date) {
  return dayjs(date).format(prettyVeryFullDateFormat);
}

// prettyHourFormat
export function dateFormatHourMinut(date) {
  return dayjs(date).format(prettyHourFormat);
}