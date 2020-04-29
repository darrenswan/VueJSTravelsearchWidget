import Vue from 'vue'
import VueRouter from 'vue-router'
import SearchBox from '@/views/SearchBox.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'SearchBox',
    component: SearchBox
  },
  {
    path: '/flights/:id/:key',
    name: 'ResultsFlights',
    component: () => import(/* webpackChunkName: "results" */ '../views/ResultsFlights.vue')
  },
  {
    path: '/accommodation/:id/:key',
    name: 'ResultsAccomm',
    component: () => import(/* webpackChunkName: "results" */ '../views/ResultsAccomm.vue')
  },
  {
    path: '/carrental/:id/:key',
    name: 'ResultsCar',
    component: () => import(/* webpackChunkName: "results" */ '../views/ResultsCar.vue')
  },
  {
    path: '/tickets/:id/:key',
    name: 'ResultsTickets',
    component: () => import(/* webpackChunkName: "results" */ '../views/ResultsTickets.vue')
  },
  {
    path: '/accommodation/:id/:key/:rid',
    name: 'DetailsAccomm',
    component: () => import(/* webpackChunkName: "details" */ '../views/DetailsAccomm.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
