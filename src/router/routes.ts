import { ROUTE_NAMES } from './names';
import { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/Public/PublicLayout.vue'),
    meta: {
      allowAnonymous: true,
    },
    children: [
      { path: '', redirect: { name: ROUTE_NAMES.LOGIN } },
      {
        path: 'login',
        name: ROUTE_NAMES.LOGIN,
        component: () => import('@/views/Public/LoginPage.vue'),
      },
    ],
  },
  {
    path: '',
    component: () => import('@/views/Private/PrivateLayout.vue'),
    children: [
      { path: '', redirect: { name: ROUTE_NAMES.MEMBERS.LIST } },
      {
        path: 'members',
        component: () => import('@/views/Private/Members/MembersPage.vue'),
        children: [
          {
            path: '',
            name: ROUTE_NAMES.MEMBERS.LIST,
            component: () => import('@/views/Private/Members/MembersList.vue'),
            props: (route) => ({
              tab: route.hash.replace('#', ''),
              search: route.query.search,
              sort: route.query.sort,
            }),
          },
          {
            path: ':id',
            name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
            component: () => import('@/views/Private/Members/MembersDetail.vue'),
            props: (route) => ({
              id: route.params.id,
            }),
            children: [
              {
                path: 'tickets/new',
                name: ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.NEW,
                component: () => import('@/views/Private/Members/Detail/Tickets/TicketsNew.vue'),
              },
              {
                path: 'tickets/:ticketId',
                name: ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.DETAIL,
                component: () => import('@/views/Private/Members/Detail/Tickets/TicketsDetail.vue'),
                props: (route) => ({
                  id: route.params.ticketId,
                }),
              },
              {
                path: 'subscriptions/new',
                name: ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.NEW,
                component: () =>
                  import('@/views/Private/Members/Detail/Subscriptions/SubscriptionsNew.vue'),
              },
              {
                path: 'subscriptions/:subscriptionId',
                name: ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.DETAIL,
                component: () =>
                  import('@/views/Private/Members/Detail/Subscriptions/SubscriptionsDetail.vue'),
                props: (route) => ({
                  id: route.params.subscriptionId,
                }),
              },
              {
                path: 'activity/:date',
                name: ROUTE_NAMES.MEMBERS.DETAIL.ACTIVITY.DETAIL,
                component: () =>
                  import('@/views/Private/Members/Detail/Activity/ActivityDetail.vue'),
                props: (route) => ({
                  date: route.params.date,
                }),
              },
              { path: ':catchAll(.*)', redirect: { name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX } },
            ],
          },
        ],
      },
      {
        path: 'stats',
        component: () => import('@/views/Private/Stats/StatsPage.vue'),
        children: [
          {
            path: '',
            name: ROUTE_NAMES.STATS.INDEX,
            redirect: { name: ROUTE_NAMES.STATS.INCOMES.INDEX },
          },
          {
            path: 'incomes',
            component: () => import('@/views/Private/Stats/Incomes/StatsIncomes.vue'),
            props: (route) => ({
              from: route.query.from,
              to: route.query.to,
            }),
            children: [
              {
                path: '',
                name: ROUTE_NAMES.STATS.INCOMES.INDEX,
                redirect: {
                  name: ROUTE_NAMES.STATS.INCOMES.DAILY,
                },
              },
              {
                path: 'daily',
                name: ROUTE_NAMES.STATS.INCOMES.DAILY,
                component: () => import('@/views/Private/Stats/Incomes/StatsIncomesDaily.vue'),
              },
              {
                path: 'weekly',
                name: ROUTE_NAMES.STATS.INCOMES.WEEKLY,
                component: () => import('@/views/Private/Stats/Incomes/StatsIncomesWeekly.vue'),
              },
              {
                path: 'monthly',
                name: ROUTE_NAMES.STATS.INCOMES.MONTHLY,
                component: () => import('@/views/Private/Stats/Incomes/StatsIncomesMonthly.vue'),
              },
              {
                path: 'yearly',
                name: ROUTE_NAMES.STATS.INCOMES.YEARLY,
                component: () => import('@/views/Private/Stats/Incomes/StatsIncomesYearly.vue'),
              },
            ],
          },
        ],
      },
      {
        path: 'profile',
        name: ROUTE_NAMES.USER.PROFILE,
        component: () => import('@/views/Private/User/UserProfile.vue'),
      },
    ],
  },
  { path: '/:catchAll(.*)', redirect: '/' },
];
