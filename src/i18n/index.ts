import { LOCALE_STORAGE_KEY } from '@/store/settings';
import { createI18nMessage } from '@vuelidate/validators';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import duration from 'dayjs/plugin/duration.js';
import isBetween from 'dayjs/plugin/isBetween.js';
import LocalizedFormat from 'dayjs/plugin/localizedFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import updateLocale from 'dayjs/plugin/updateLocale.js';
import weekday from 'dayjs/plugin/weekday.js';
import { createI18n, IntlDateTimeFormats, IntlNumberFormats, PluralizationRule } from 'vue-i18n';
import 'dayjs/locale/fr.js';
import 'dayjs/locale/en-gb.js';
dayjs.extend(updateLocale);
dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.extend(LocalizedFormat);
dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
dayjs.extend(weekday);

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

// `choiceOptions` relates to the number of options for the specified translation
// `i18n.tc()` accepts 2 or 3 options, so the code is covering both cases
// In case of translation having only 2 options, empty and plural options will be the same
// `choiceOptions` value is the length of options for that translation
const getOptionsByTranslationChoices = (choiceOptions: number) =>
  choiceOptions === 3
    ? {
        returnAsEmpty: 0,
        returnAsSingle: 1,
        returnAsPlural: 2,
      }
    : {
        returnAsEmpty: 1,
        returnAsSingle: 0,
        returnAsPlural: 1,
      };

/**
 * A helper function for applying decimals as plural for english speakers
 * @param {number} [choice] - Number passed to `i18n.tc()` function as value to be resolved
 * @param {number} [choiceOptions] - `3` or `2`: Number of options available on the translation file to that specific key
 * @returns {number} 0: `empty`, 1: `single`, 2: `plural`
 */
const applyingDecimalsAsPluralForEnglishSpeakers: PluralizationRule = (count, choiceOptions) => {
  // These codes are related to `vue-i18n` internals to pluralize resolution
  //  - 0: it should return empty value as result
  //  - 1: it should return single value as result
  //  - 2: it should return plural value as result
  const { returnAsEmpty, returnAsSingle, returnAsPlural } =
    getOptionsByTranslationChoices(choiceOptions);

  // Returns empty if receives `0` as value
  if (count === 0) {
    return returnAsEmpty;
  }

  // NOTE: In english, decimals are also plural
  // This function always receives value as `number`, so it's safe to assume
  // decimal values as result of `!Number.isInteger()` and return as plural
  if (!Number.isInteger(count)) {
    return returnAsPlural;
  }

  // Otherwise, check if number is more than 1 to return as plural or single
  return count > 1 ? returnAsPlural : returnAsSingle;
};

const applyingDecimalsAsPluralForFrenchSpeakers: PluralizationRule = (count, choiceOptions) => {
  const { returnAsEmpty, returnAsSingle, returnAsPlural } =
    getOptionsByTranslationChoices(choiceOptions);

  if (count === 0) {
    return returnAsEmpty;
  }

  // NOTE: In french, decimals are plurals only if they are 2 or more
  return count >= 2 ? returnAsPlural : returnAsSingle;
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
  pluralRules: {
    // https://github.com/kazupon/vue-i18n/issues/620#issuecomment-1660638535
    ['en-GB']: applyingDecimalsAsPluralForEnglishSpeakers,
    ['fr-FR']: applyingDecimalsAsPluralForFrenchSpeakers,
  },
});

// @see https://vuelidate-next.netlify.app/advanced_usage.html#i18n-support
export const withAppI18nMessage = createI18nMessage({
  // had to fix it this way, I'm sorry
  t: i18nInstance.global.t.bind(i18nInstance) as () => string,
});
