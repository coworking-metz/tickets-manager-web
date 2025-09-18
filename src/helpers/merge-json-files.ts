import { merge } from 'lodash';

export const mergeJSONFiles = (jsonFiles: any, directories: any) => {
  const prefixedJsonTranslations = Object.entries(jsonFiles).reduce(
    (acc, [path, translations]) => ({
      ...acc,
      // prefix translations by its filename
      [path.replace(/\.\/(.*)\.json/, '$1')]: translations,
    }),
    {},
  );

  const prefixedDirectories = Object.entries(directories).reduce(
    (acc, [path, directoryModule]) => ({
      ...acc,
      // prefix translations by its directory name
      [path.replace(/\.\/(.*)\/index\.ts/, '$1')]: (directoryModule as { default: any }).default,
    }),
    {},
  );

  return merge(prefixedJsonTranslations, prefixedDirectories);
};
