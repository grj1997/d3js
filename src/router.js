import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "about" */ './views/d3.vue')
    },
    {
      path: '/tree',
      name: 'tree',
      component: () => import(/* webpackChunkName: "about" */ './views/d3Tree.vue')
    },
    {
      path: '/d3',
      name: 'd3',
      component: () => import(/* webpackChunkName: "about" */ './views/d3MeTree.vue')
    }
  ]
})
