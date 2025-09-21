import { useSettingsStore } from '@/store/settings';
import { usePreferredDark } from '@vueuse/core';
import { computed } from 'vue';

export const SUPPORTED_THEMES = ['auto', 'light', 'dark'] as const;
export type AppTheme = (typeof SUPPORTED_THEMES)[number];

export const applyTheme = (theme: AppTheme) => {
  if (
    theme === 'dark' ||
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useTheme = () => {
  const prefersDarkMode = usePreferredDark();
  const settingsStore = useSettingsStore();

  const theme = computed(() =>
    settingsStore.theme === 'dark' || (settingsStore.theme === 'auto' && prefersDarkMode.value)
      ? 'dark'
      : 'light',
  );

  return theme;
};
