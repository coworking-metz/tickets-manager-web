import { flatMapDeep, isEqual } from 'lodash';

// order matters as it will determine transition direction in ./helpers#isRouteAfter()
const RAW_ROUTE_NAMES = {
  LOGIN: 'LOGIN',
  STATS: {
    INDEX: 'STATS.INDEX',
    INCOMES: {
      INDEX: 'STATS.INCOMES.INDEX',
      YEARLY: 'STATS.INCOMES.YEARLY',
      MONTHLY: 'STATS.INCOMES.MONTHLY',
      WEEKLY: 'STATS.INCOMES.WEEKLY',
      DAILY: 'STATS.INCOMES.DAILY',
    },
    ACTIVITY: {
      INDEX: 'STATS.ACTIVITY.INDEX',
    },
  },
  MEMBERS: {
    LIST: 'MEMBERS.LIST',
    DETAIL: {
      INDEX: 'MEMBERS.DETAIL.INDEX',
      TICKETS: {
        NEW: 'MEMBERS.DETAIL.TICKETS.NEW',
        DETAIL: 'MEMBERS.DETAIL.TICKETS.DETAIL',
      },
      SUBSCRIPTIONS: {
        NEW: 'MEMBERS.DETAIL.SUBSCRIPTIONS.NEW',
        DETAIL: 'MEMBERS.DETAIL.SUBSCRIPTIONS.DETAIL',
      },
      ACTIVITY: {
        NEW: 'MEMBERS.DETAIL.ACTIVITY.NEW',
        DETAIL: 'MEMBERS.DETAIL.ACTIVITY.DETAIL',
      },
    },
  },
  USER: {
    PROFILE: 'USER.PROFILE',
  },
};

export const ROUTE_NAME_SEPARATOR = '.';

/**
 * Recursively build names from an object keys
 * to be really safe when running through the route tree
 * as values should always match the key path in the object
 */
const buildRouteNamesFromObject = <Type>(parent: Object, prefix: string = ''): Type => {
  return Object.entries(parent).reduce((accumulator, [key, value]) => {
    const builtValue =
      typeof value === 'string'
        ? prefix.concat(key)
        : buildRouteNamesFromObject(value, prefix.concat(key).concat(ROUTE_NAME_SEPARATOR));
    if (typeof value === 'string' && !isEqual(value, builtValue)) {
      // force myself to write safer code
      console.warn(`Route name ${builtValue} mismatch: ${value}`);
    }
    return {
      ...accumulator,
      [key]: builtValue,
    };
  }, {} as Type);
};

export const ROUTE_NAMES = buildRouteNamesFromObject<typeof RAW_ROUTE_NAMES>(RAW_ROUTE_NAMES);

// https://stackoverflow.com/a/56889859/15183871
export const flattenDeepObject = (item: any): string[] => {
  if (typeof item === 'string') return [item];
  return [...flatMapDeep(Object.values(item), flattenDeepObject)];
};
