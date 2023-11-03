import { ROUTE_NAMES, ROUTE_NAME_SEPARATOR } from '@/router/names';
import { isObject } from 'lodash';
import { RouteLocation } from 'vue-router';

/**
 * Check whether the next route is after or before the previous one.
 * @param to next route
 * @param from current route
 * @returns boolean
 */
export const isRouteAfter = (to: RouteLocation, from: RouteLocation) => {
  const toDepth = to.path.split('/').filter((subpath) => !!subpath).length;
  const fromDepth = from.path.split('/').filter((subpath) => !!subpath).length;
  if (toDepth === fromDepth) {
    if (to.name && from.name) {
      const toNameParts = (to.name as string).split(ROUTE_NAME_SEPARATOR).filter((part) => !!part);
      const fromNameParts = (from.name as string)
        .split(ROUTE_NAME_SEPARATOR)
        .filter((part) => !!part);
      if (toNameParts.length === fromNameParts.length) {
        // find common part to determine which parentRouteName they have in common
        const commonNameParts = toNameParts.filter(
          (value, index) => fromNameParts.indexOf(value) === index,
        );
        const commonParent = commonNameParts.reduce(
          (acc: any, part) => (Object.keys(acc).includes(part) ? acc[part] : acc),
          ROUTE_NAMES,
        );
        // compare indexes from the common parent children
        const childrenNames = Object.entries(commonParent);
        const toIndexInCommonParent = childrenNames.findIndex(([childNamePart, childValue]) =>
          typeof childValue === 'string'
            ? to.name === childValue
            : toNameParts.includes(childNamePart),
        );
        const fromIndexInCommonParent = childrenNames.findIndex(([childNamePart, childValue]) =>
          typeof childValue === 'string'
            ? from.name === childValue
            : fromNameParts.includes(childNamePart),
        );
        // should not be the case but I don't trust my future self
        if (toIndexInCommonParent !== fromIndexInCommonParent) {
          return toIndexInCommonParent > fromIndexInCommonParent;
        }
      }
      return toNameParts.length > fromNameParts.length;
    }
    return to.path.length > from.path.length;
  }
  return toDepth > fromDepth;
};

/**
 * Whether the currentRoute belongs is one of the other's children,
 * by comparing their names.
 * @param currentRoute
 * @param parentRouteName
 * @returns boolean
 */
export const doesRouteBelongsTo = (
  currentRoute: RouteLocation,
  parentRouteName: object | string,
): boolean => {
  if (typeof parentRouteName === 'string') return parentRouteName === currentRoute.name;
  if (isObject(parentRouteName))
    return Object.values(parentRouteName).some((childRouteName): boolean =>
      doesRouteBelongsTo(currentRoute, childRouteName),
    );
  return false;
};
