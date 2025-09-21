import { LOCALE_STORAGE_KEY, THEME_STORAGE_KEY } from '@/helpers/environment';
import { AppLocale, DEFAULT_LOCALE, SUPPORTED_LOCALES, i18nInstance } from '@/i18n';
import { AppTheme } from '@/services/theme';
import { useLocalStorage } from '@vueuse/core';
import dayjs from 'dayjs';
import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    locale: useLocalStorage<AppLocale>(LOCALE_STORAGE_KEY, DEFAULT_LOCALE),
    theme: useLocalStorage<AppTheme>(THEME_STORAGE_KEY, 'auto'),
  }),
  actions: {
    async setLocale(locale: (typeof SUPPORTED_LOCALES)[number]) {
      if (!Object.keys(i18nInstance.global.messages).includes(locale)) {
        const messages = await import(`@/i18n/locales/${locale}/index.ts`);
        i18nInstance.global.setLocaleMessage(locale, messages.default);
      }

      const language = locale.substring(0, 2);
      dayjs.locale(language);
      i18nInstance.global.locale.value = locale;
      this.locale = locale;
    },
    async setTheme(theme: AppTheme) {
      this.theme = theme;
    },
  },
});
