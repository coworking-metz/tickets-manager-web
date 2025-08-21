import { doesRouteBelongsTo } from './helpers';
import { ROUTE_NAMES } from './names';
import { routes } from './routes';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

  scrollBehavior(to, from, savedPosition) {
    if (
      !(
        doesRouteBelongsTo(to, ROUTE_NAMES.MEMBERS.DETAIL) &&
        doesRouteBelongsTo(from, ROUTE_NAMES.MEMBERS.DETAIL)
      ) &&
      to.name !== from.name
    ) {
      if (savedPosition) {
        // window.document.body.scrollTo(savedPosition);
        return savedPosition;
      } else {
        // window.document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' }); // if body is the scroll element
        return { top: 0, left: 0, behavior: 'instant' };
      }
    }
  },
});

export default router;
