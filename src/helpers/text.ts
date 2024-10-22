export const normalize = (value?: string | number | null) =>
  `${value ?? ''}`
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();

export const searchIn = (
  needle: string | null,
  ...elements: (string | number | undefined | null)[]
): boolean =>
  !needle ||
  elements.filter(Boolean).some((element) => normalize(element).includes(normalize(needle.trim())));

export const getInitials = (name?: string) => {
  const wordsInitials = (name || '').split(' ').map((part: string) => part.substring(0, 1));
  const uppercaseInitials = wordsInitials.filter(
    (initial: string) => initial === initial.toUpperCase(),
  );
  if (uppercaseInitials.length > 0) return uppercaseInitials.splice(0, 3).join('');

  return wordsInitials
    .map((initial: string) => initial.toUpperCase())
    .splice(0, 3)
    .join('');
};
