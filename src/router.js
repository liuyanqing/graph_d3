import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Home'),
    },
    {
      path: '/tree',
      name: 'tree',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "Tree" */ './views/Tree'),
    },
    {
      path: '/graph',
      name: 'graph',
      component: () => import(/* webpackChunkName: "Graph" */ './views/Graph'),
    },
    {
      path: '/map',
      name: 'map',
      component: () => import(/* webpackChunkName: "Map" */ './views/Map'),
    },
  ],
});
