import { LOCALE_STORAGE_KEY } from '@/store/settings';
import { createI18nMessage } from '@vuelidate/validators';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar.js';
import LocalizedFormat from 'dayjs/plugin/localizedFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import updateLocale from 'dayjs/plugin/updateLocale.js';
import { createI18n, IntlDateTimeFormats, IntlNumberFormats } from 'vue-i18n';
import 'dayjs/locale/fr.js';
import 'dayjs/locale/en-gb.js';
dayjs.extend(updateLocale);
dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.extend(LocalizedFormat);

dayjs.updateLocale('fr', {
  calendar: {
    lastDay: '[Hier à] LT',
    sameDay: "[Aujourd'hui à] LT",
    nextDay: '[Demain à] LT',
    lastWeek: 'dddd [dernier à] LT',
    nextWeek: 'dddd [prochain à] LT',
    sameElse: '[Le] dddd LL',
  },
});

dayjs.updateLocale('en', {
  calendar: {
    sameElse: '[on] dddd LL',
  },
});

export const datetimeFormats: IntlDateTimeFormats = {
  'fr-FR': {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    },
  },
  'en-GB': {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    },
  },
};

export const numberFormats: IntlNumberFormats = {
  'fr-FR': {
    currency: {
      style: 'currency',
      currency: 'EUR',
    },
  },
  'en-GB': {
    currency: {
      style: 'currency',
      currency: 'EUR',
    },
  },
};

export const DEFAULT_LOCALE = import.meta.env.VUE_APP_DEFAULT_LOCALE || 'fr-FR';
export const SUPPORTED_LOCALES = ['fr-FR', 'en-GB'] as const;
const initialLocale = localStorage.getItem(LOCALE_STORAGE_KEY) || DEFAULT_LOCALE;

export const i18nInstance = createI18n({
  globalInjection: true,
  locale: initialLocale,
  // fallbackLocale: DEFAULT_LOCALE,
  // messages: { [initialLocale]: messages },
  datetimeFormats,
  numberFormats,
});

// @see https://vuelidate-next.netlify.app/advanced_usage.html#i18n-support
export const withAppI18nMessage = createI18nMessage({
  // had to fix it this way, I'm sorry
  t: i18nInstance.global.t.bind(i18nInstance) as () => string,
});
