import * as frenchMessages from './locales/fr-FR';
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
    sameElse: 'L',
  },
});

const datetimeFormats: IntlDateTimeFormats = {
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
};

const numberFormats: IntlNumberFormats = {
  'fr-FR': {
    currency: {
      style: 'currency',
      currency: 'EUR',
    },
  },
};

const defaultLang = import.meta.env.VUE_APP_DEFAULT_LOCALE || 'fr-FR';

export const i18nInstance = createI18n({
  globalInjection: true,
  locale: defaultLang,
  fallbackLocale: defaultLang,
  messages: { [defaultLang]: frenchMessages },
  datetimeFormats,
  numberFormats,
});

const setI18nLanguage = async (locale: string): Promise<string> => {
  const language = locale.substring(0, 2);
  dayjs.locale(language);
  i18nInstance.global.locale.value = locale;
  return locale;
};

export const changeLocale = async (lang: string): Promise<string> => {
  if (
    i18nInstance.global.locale.value !== lang &&
    !Object.keys(i18nInstance.global.messages).includes(lang)
  ) {
    const messages = await import(/* @vite-ignore */ `../locales/${lang}/index.ts`);
    i18nInstance.global.setLocaleMessage(lang, messages);
  }

  return setI18nLanguage(lang);
};

setI18nLanguage(defaultLang);
