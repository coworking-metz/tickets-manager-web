import { routes } from './routes';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.name !== from.name) {
      return { top: 0, left: 0, behavior: 'instant' };
    }
  },
});

export default router;
