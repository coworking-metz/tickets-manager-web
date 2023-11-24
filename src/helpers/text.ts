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
