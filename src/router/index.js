import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../views/Index'
import Login from '../views/Login'
import InitSystem from '../views/InitSystem'
import QuestionManagerUsed  from '../views/QuestionManagerUsed'
import QuestionManager from '../views/QuestionManager'
import RubbishManager from '../views/RubbishManager'
import RankManager from '../views/RankManager'

import Router from 'vue-router'


Vue.use(VueRouter)
const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error=> error)
}

const routes = [
  {
    path: '/Login',
    component: Login
  },
  {
    path: '/',
    component: Login
  },
  {
    path: '/Index',
    component: Index,
    children:[
      {
        path: '/InitSystem',
        name: 'InitSystem',
        component: InitSystem,
        
      },
      
      {
        path: '/QuestionManagerUsed',
        name: 'QuestionManagerUsed',
        component: QuestionManagerUsed
      },
      {
        path: '/QuestionManager',
        name: 'QuestionManager',
        component: QuestionManager
      },
      {
        path: '/RubbishManager',
        name: 'RubbishManager',
        component: RubbishManager
      },
      {
        path: '/RankManager',
        name: 'RankManager',
        component: RankManager
      }
      
    ]
  }
  
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
