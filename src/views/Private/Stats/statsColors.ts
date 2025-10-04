import { useTheme } from '@/services/theme';
import { theme } from '@/styles/colors';
import { computed } from 'vue';

export const useStatsColors = () => {
  const currentTheme = useTheme();

  return computed(() => ({
    subscription: currentTheme.value === 'dark' ? theme.maizeCrayola : theme.peachYellow,
    ticket: currentTheme.value === 'dark' ? theme.blueCrayola : theme.babyBlueEyes,
    debt: currentTheme.value === 'dark' ? theme.frenchSkyBlue : theme.azureishWhite,
    charges: currentTheme.value === 'dark' ? theme.silverSand : theme.charlestonGreen,
  }));
};
