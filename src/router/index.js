import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import ChatView from '../views/ChatView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'chat',
          component: ChatView
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsView
        }
      ]
    }
  ]
})

export default router