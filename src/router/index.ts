import { createRouter, createWebHistory } from 'vue-router'
import HorseRaceGame from '../views/HorseRaceGame.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HorseRaceGame,
    },
  ],
})

export default router
