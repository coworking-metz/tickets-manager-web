export type Frequency = 'year' | 'month' | 'week' | 'day';

export const getChildFrequency = (frequency: Frequency): Frequency => {
  switch (frequency) {
    case 'year':
      return 'month';
    case 'month':
      return 'week';
    case 'week':
      return 'day';
    default:
      return frequency;
  }
};
