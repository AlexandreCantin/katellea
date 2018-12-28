export const DATE_HOUR_FORMAT = 'ddd. DD/MM/YYYY HH:ss:ms';
import dayjs from 'dayjs';

export const addWeeksToDate = function(date, weekNumber) {
  return dayjs(date).add(weekNumber, 'week');
};

export const computNextYearFirstJanuary = function() {
  return dayjs().add(1, 'year').startOf('year');
};

export const keepOnlyYearMonthDay = function(date) {
  return dayjs(date).format('YYYY-MM-DD');
};

export function dateFormatDayMonthYear(date) {
  return dayjs(date).format('DD/MM/YYYY');
}

export function dateFormatDayMonthYearHourMinutSecond(date) {
  return dayjs(date).format('DD/MM/YYYY à HH:mm:ss');
}
