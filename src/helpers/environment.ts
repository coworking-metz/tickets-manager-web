import { version as packageVersion, name as packageName } from '../../package.json';

const currentEnvironment = import.meta.env.MODE;

export const LOCALE_STORAGE_KEY = 'tickets-manager-web-locale';
export const THEME_STORAGE_KEY = 'tickets-manager-web-theme';

export const APP_VERSION = packageVersion;
export const APP_NAME = packageName;

export const IS_DEV = import.meta.env.DEV;
export const IS_BUILT = import.meta.env.PROD;
export const IS_PRODUCTION = currentEnvironment === 'production';

export const ENVIRONMENT = currentEnvironment === 'development' ? 'local' : currentEnvironment;
