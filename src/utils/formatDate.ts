import dayjs, { Dayjs } from 'dayjs';
import { DATE_FORMAT, TimeType } from '@/data/constants';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import updateLocale from 'dayjs/plugin/updateLocale';
dayjs.extend(weekOfYear);
dayjs.extend(quarterOfYear);
dayjs.extend(weekday);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  weekStart: 1,
});

export const formatDate = (date: dayjs.ConfigType, format = DATE_FORMAT.DAY_FIRST) => {
  const dateInstance = dayjs(date);
  if (!date || !dateInstance.isValid()) return null;

  return dateInstance.format(format);
};

const addOrdinalSuffix = (dateNumber: number): string => {
  const ordinalRules = new Intl.PluralRules('en', { type: 'ordinal' });
  const suffixes = {
    one: 'st',
    two: 'nd',
    few: 'rd',
    other: 'th',
  };
  const rule = ordinalRules.select(dateNumber);

  return dateNumber + suffixes[rule as keyof typeof suffixes];
};

export const getQuarter = (quarter: number) => {
  switch (quarter) {
    case 1:
      return 'Q1';
    case 2:
      return 'Q2';
    case 3:
      return 'Q3';
    case 4:
      return 'Q4';
    default:
      return null; // Return null for invalid quarters
  }
};

export const getTime = (type: TimeType, date: Dayjs) => {
  if (!date) return '';

  let convertedDate = null;

  switch (type) {
    case TimeType.DAY:
      convertedDate = date.format(DATE_FORMAT.DAY_FIRST);
      break;
    case TimeType.WEEK:
      convertedDate = `${date.week()}-${date.year()}`;
      break;
    case TimeType.MONTH:
      convertedDate = `${date.month()}-${date.year()}`;
      break;
    case TimeType.QUARTER:
      convertedDate = `${date.quarter()}-${date.year()}`;
      break;
    case TimeType.YEAR:
      convertedDate = date.year();
      break;

    default:
      convertedDate = date.format(DATE_FORMAT.DAY_FIRST);
      break;
  }

  return convertedDate.toString();
};

export const getTimeWithText = (type: TimeType, date: Dayjs) => {
  if (!date) return '';
  let convertedDate = null;

  switch (type) {
    case TimeType.DAY:
      convertedDate = date.format(DATE_FORMAT.DAY_FIRST);
      break;
    case TimeType.WEEK:
      convertedDate = `${addOrdinalSuffix(date.week())}-${date.year()}`;
      break;
    case TimeType.MONTH:
      convertedDate = `${date.month().toString().padStart(2, '0')}-${date.year()}`;
      break;
    case TimeType.QUARTER:
      convertedDate = `${getQuarter(date.quarter())}-${date.year()}`;
      break;
    case TimeType.YEAR:
      convertedDate = date.year();
      break;

    default:
      convertedDate = date.format(DATE_FORMAT.DAY_FIRST);
      break;
  }

  return convertedDate.toString();
};

export const customDateFormat: (type: TimeType) => (date: Dayjs) => string = (type) => (value) => {
  return getTimeWithText(type, value);
};

export const checkIfPastDate = (current: Dayjs) => {
  return current.isBefore(dayjs().startOf('day'));
};

export const checkIfPastQuarter = (current: Dayjs) => {
  return current.isBefore(dayjs().startOf('quarter'));
};

const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

export const checkIfPastTime = (current: Dayjs) => {
  if (!current) {
    return {};
  }

  const isToday = current.isSame(dayjs(), 'day');
  if (isToday) {
    const currentHour = dayjs().hour();
    const currentMinute = dayjs().minute();

    return {
      disabledHours: () => range(0, 24).splice(0, currentHour),
      disabledMinutes: () => range(0, 60).splice(0, currentHour === current.hour() ? currentMinute + 5 : 0),
      disabledSeconds: () => [],
    };
  }

  return {
    disabledHours: () => [],
    disabledMinutes: () => [],
    disabledSeconds: () => [],
  };
};

export const checkIfFutureDate = (current: Dayjs) => {
  const isBeforeToday = current.isAfter(dayjs().endOf('day'));

  return isBeforeToday;
};
