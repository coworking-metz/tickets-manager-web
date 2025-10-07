import { ROUTE_NAMES, ROUTE_QUERY_ARRAY_SEPARATOR } from './names';
import { WEEK_DAYS_INDEXES } from '@/helpers/dates';
import { compact } from 'lodash';
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
        props: (route) => ({
          loggedOut: route.query.loggedOut === 'true',
        }),
      },
    ],
  },
  {
    path: '',
    component: () => import('@/views/Private/PrivateLayout.vue'),
    children: [
      { path: '', name: ROUTE_NAMES.HOME, redirect: { name: ROUTE_NAMES.MEMBERS.LIST } },
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
              slice: route.query.slice,
            }),
          },
          {
            path: ':memberId',
            name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
            component: () => import('@/views/Private/Members/MembersDetail.vue'),
            props: (route) => ({
              memberId: route.params.memberId,
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
                path: 'memberships/new',
                name: ROUTE_NAMES.MEMBERS.DETAIL.MEMBERSHIPS.NEW,
                component: () =>
                  import('@/views/Private/Members/Detail/Memberships/MembershipsNew.vue'),
              },
              {
                path: 'memberships/:membershipId',
                name: ROUTE_NAMES.MEMBERS.DETAIL.MEMBERSHIPS.DETAIL,
                component: () =>
                  import('@/views/Private/Members/Detail/Memberships/MembershipsDetail.vue'),
                props: (route) => ({
                  id: route.params.membershipId,
                }),
              },
              {
                path: 'activity/new',
                name: ROUTE_NAMES.MEMBERS.DETAIL.ACTIVITY.NEW,
                component: () => import('@/views/Private/Members/Detail/Activity/ActivityNew.vue'),
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
            redirect: { name: ROUTE_NAMES.STATS.USAGE },
          },
          {
            path: 'usage/:date?',
            name: ROUTE_NAMES.STATS.USAGE,
            component: () => import('@/views/Private/Stats/Usage/StatsUsage.vue'),
            props: (route) => ({
              from: route.query.from,
              to: route.query.to,
              net: Boolean(route.query.net === 'true'),
              frequency: route.query.frequency,
              date: route.params.date,
            }),
          },
          {
            path: 'income',
            name: ROUTE_NAMES.STATS.INCOME,
            component: () => import('@/views/Private/Stats/Income/StatsIncome.vue'),
            props: (route) => ({
              from: route.query.from,
              to: route.query.to,
              net: Boolean(route.query.net === 'true'),
              frequency: route.query.frequency,
            }),
          },
          {
            path: 'activity',
            name: ROUTE_NAMES.STATS.ACTIVITY,
            component: () => import('@/views/Private/Stats/Activity/StatsActivity.vue'),
            props: (route) => ({
              from: route.query.from,
              to: route.query.to,
              frequency: route.query.frequency,
              weekDays: compact(`${route.query.weekDays || ''}`.split(ROUTE_QUERY_ARRAY_SEPARATOR)),
            }),
          },
        ],
      },
      {
        path: 'history',
        name: ROUTE_NAMES.HISTORY,
        component: () => import('@/views/Private/History/HistoryEventsList.vue'),
        props: (route) => ({
          search: route.query.search,
          sort: route.query.sort,
          slice: route.query.slice,
          from: route.query.from,
          to: route.query.to,
        }),
      },
      {
        path: 'attendance/:date?',
        name: ROUTE_NAMES.ATTENDANCE,
        component: () => import('@/views/Private/Attendance/AttendancePage.vue'),
        props: (route) => ({
          month: route.query.month,
          date: route.params.date,
          search: route.query.search,
          sort: route.query.sort,
        }),
      },
      {
        path: 'settings',
        name: ROUTE_NAMES.SETTINGS,
        component: () => import('@/views/Private/Settings/SettingsPage.vue'),
        props: (route) => ({
          macAddress: route.query.macAddress,
        }),
      },
      {
        path: 'miscellaneous',
        name: ROUTE_NAMES.MISCELLANEOUS,
        component: () => import('@/views/Private/Miscellaneous/MiscellaneousPage.vue'),
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
