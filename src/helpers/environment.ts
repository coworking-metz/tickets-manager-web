const currentEnvironment = import.meta.env.MODE;

export const ENVIRONMENT =
  currentEnvironment !== 'production'
    ? currentEnvironment === 'development'
      ? 'local'
      : currentEnvironment
    : null;
