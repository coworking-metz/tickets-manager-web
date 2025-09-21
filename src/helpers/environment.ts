const currentEnvironment = import.meta.env.MODE;

export const ENVIRONMENT =
  currentEnvironment !== 'production'
    ? currentEnvironment === 'development'
      ? 'local'
      : currentEnvironment
    : null;

export const LOCALE_STORAGE_KEY = 'tickets-manager-web-locale';
export const THEME_STORAGE_KEY = 'tickets-manager-web-theme';
