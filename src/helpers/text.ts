export const normalize = (value?: string | number | null) =>
  `${value ?? ''}`
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();

export const searchIn = (
  needle: string | null,
  ...elements: (string | number | false | undefined | null)[]
): boolean =>
  !needle ||
  elements.some((element) => !!element && normalize(element).includes(normalize(needle.trim())));

export const getInitials = (name?: string, email?: string): string => {
  let words: string[] = [];
  if (name) {
    words = name.split(' ') ?? [];
  } else if (email) {
    const [username] = email.split('@');
    words = username?.split('.') ?? [];
  }

  const wordsInitials = words.map((part: string) => part.substring(0, 1));
  const uppercaseInitials = wordsInitials.filter(
    (initial: string) => initial === initial.toUpperCase(),
  );
  if (uppercaseInitials.length > 0) return uppercaseInitials.splice(0, 3).join('');

  return wordsInitials
    .map((initial: string) => initial.toUpperCase())
    .splice(0, 3)
    .join('');
};

export const formatConjonction = (
  list: (string | boolean | null | undefined)[],
  locale: string,
  // @ts-ignore
  options?: Intl.ListFormatOptions,
) => {
  try {
    // https://github.com/microsoft/TypeScript/issues/46907
    // @ts-ignore
    return new Intl.ListFormat(locale, {
      style: 'long',
      type: 'conjunction',
      ...options,
    }).format(list.filter(Boolean) as string[]);
  } catch (error) {
    // fallback to a simple string
    // as ListFormat isn't supported on all browsers yet
    return list.join(' - ');
  }
};

export const formatDisjunction = (
  list: (string | boolean | null | undefined)[],
  locale: string,
  // @ts-ignore
  options?: Intl.ListFormatOptions,
) => {
  try {
    // https://github.com/microsoft/TypeScript/issues/46907
    // @ts-ignore
    return new Intl.ListFormat(locale, {
      style: 'long',
      type: 'disjunction',
      ...options,
    }).format(list.filter(Boolean) as string[]);
  } catch (error) {
    // fallback to a simple string
    // as ListFormat isn't supported on all browsers yet
    return list.join(' - ');
  }
};
