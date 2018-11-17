export const DATE_HOUR_FORMAT = 'ddd. DD/MM/YYYY HH:ss:ms';
import { dayjs } from 'dayjs';

export const addWeeksToDate = function(date, weekNumber) {
  return dayjs(date).add(weekNumber, 'week');
};

export const keepOnlyYearMonthDay = function(date) {
  return dayjs(date).format('YYYY-MM-DD');
};
