import { useTheme } from '@/services/theme';
import { theme } from '@/styles/colors';
import { computed } from 'vue';

export const useStatsColors = () => {
  const currentTheme = useTheme();

  return computed(() => ({
    subscription: currentTheme.value === 'dark' ? theme.maizeCrayola : theme.peachYellow,
    ticket: currentTheme.value === 'dark' ? theme.blueCrayola : theme.babyBlueEyes,
    debt: currentTheme.value === 'dark' ? theme.frenchSkyBlue : theme.azureishWhite,
    charges: currentTheme.value === 'dark' ? '#78716c' : theme.charlestonGreen,

    subscriptionOrder:
      currentTheme.value === 'dark'
        ? '#eab308' // yellow-500
        : '#ca8a04', // yellow-600
    ticketOrder:
      currentTheme.value === 'dark'
        ? '#3b82f6' // sky-500
        : '#93c5fd', // sky-300
    membershipOrder: '#14b8a6', // teal-500

    member:
      currentTheme.value === 'dark'
        ? '#4338ca' // indigo-700
        : '#6366f1', // indigo-500
    newMember:
      currentTheme.value === 'dark'
        ? '#a78bfa' // indigo-400
        : '#a5b4fc', // indigo-300'
    activity:
      currentTheme.value === 'dark'
        ? '#f59e0b' // amber-500
        : '#fbbf24', // amber-400,
  }));
};
