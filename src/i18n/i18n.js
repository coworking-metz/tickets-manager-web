import * as frenchMessages from './locales/fr-FR/fr-FR.js';
import { createI18n } from 'vue-i18n';

const datetimeFormats = {
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

const numberFormats = {
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

const setI18nLanguage = async (locale) => {
  i18nInstance.global.locale.value = locale;
  return locale;
};

export const changeLocale = async (lang) => {
  if (
    i18nInstance.global.locale.value !== lang &&
    !Object.keys(i18nInstance.global.messages).includes(lang)
  ) {
    const messages = await import(/* @vite-ignore */ `../locales/${lang}/${lang}.js`);
    i18nInstance.global.setLocaleMessage(lang, messages);
  }

  return setI18nLanguage(lang);
};
