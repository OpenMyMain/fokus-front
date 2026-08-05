import {createRouter, createWebHistory} from 'vue-router'
import {useAuthStore} from '@/stores/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/AuthLayout.vue'),
      // `requiresAuth` est porté par le parent : toutes les routes de la coquille
      // authentifiée en héritent, y compris celles ajoutées plus tard.
      meta: { requiresAuth: true },
      children: [
        {
          name: 'home',
          path: '',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          name: 'focus',
          path: 'focus',
          component: () => import('@/views/Focus/FocusView.vue'),
        },
        {
          name: 'profile',
          path: 'profile',
          component: () => import('@/views/Account/ProfileView.vue'),
        },
        // Arborescence à plat : chaque domaine est une entrée de la navbar, donc une route de
        // premier niveau. Le conteneur `manage` et ses onglets Projets/Habitudes doublonnaient
        // la navigation principale (F-14) et ont été retirés.
        {
          name: 'habits',
          path: 'habits',
          component: () => import('@/views/Habit/HabitListView.vue'),
        },
        {
          name: 'projects',
          path: 'projects',
          component: () => import('@/views/Project/ProjectListView.vue'),
        },
        // `/manage` a existé jusqu'au 2026-07-26 : on redirige plutôt que de renvoyer une page
        // blanche à un signet ou à un onglet resté ouvert.
        {
          path: 'manage',
          redirect: { name: 'projects' },
        },
        {
          path: 'manage/projects',
          redirect: { name: 'projects' },
        },
        {
          path: 'manage/habits',
          redirect: { name: 'habits' },
        },
        {
          name: 'project_show',
          path: 'projects/:id',
          component: () => import('@/views/Project/ProjectDetailView.vue'),
        },
        {
          name: 'task_show',
          path: 'tasks/:id',
          component: () => import('@/views/Task/TaskDetailView.vue'),
        },
        {
          name: 'planning',
          path: 'planning',
          component: () => import('@/views/Planning/PlanningView.vue'),
        },
        // Les RDV appartiennent au domaine « temps » : pas d'onglet propre dans la navbar
        // mobile (déjà à quatre entrées), on y accède depuis le planning et le header.
        {
          name: 'appointments',
          path: 'appointments',
          component: () => import('@/views/Appointment/AppointmentListView.vue'),
        },
        // Catch-all (T-40) : une URL inconnue affichait une page blanche. Il est *dans* la
        // coquille authentifiée pour garder le header et la navbar — se tromper d'URL ne doit
        // pas donner l'impression d'avoir quitté l'app. Un visiteur non connecté est renvoyé
        // vers /auth par la garde, comme pour n'importe quelle autre URL protégée.
        {
          name: 'not_found',
          path: ':pathMatch(.*)*',
          component: () => import('@/views/Common/NotFoundView.vue'),
        },
      ],
    },
    {
      name: 'auth',
      path: '/auth',
      meta: { guestOnly: true },
      component: () => import('@/views/Authentification/SelectActionView.vue'),
    },
    {
      name: 'login',
      path: '/login',
      meta: { guestOnly: true },
      component: () => import('@/views/Authentification/LoginView.vue'),
    },
    {
      name: 'logout',
      path: '/logout',
      component: () => import('@/views/Authentification/LogoutView.vue'),
    },
    {
      name: 'register_methods',
      path: '/register',
      meta: { guestOnly: true },
      component: () => import('@/views/Authentification/RegisterChoiceView.vue'),
    },
    {
      name: 'register_email',
      path: '/register/form',
      meta: { guestOnly: true },
      component: () => import('@/views/Authentification/RegisterView.vue'),
    },
    // Pas de `guestOnly` sur ces deux-là : on arrive sur /reset-password depuis un lien reçu
    // par mail, parfois en étant déjà connecté ailleurs. Rediriger vers l'accueil ferait
    // perdre le jeton de réinitialisation.
    {
      name: 'forgot_password',
      path: '/forget-password',
      component: () => import('@/views/Authentification/ForgetPasswordView.vue'),
    },
    {
      name: 'reset_password',
      path: '/reset-password',
      component: () => import('@/views/Authentification/ResetPasswordView.vue'),
    },

    {
      name: 'kit_ui',
      path: '/kit-ui',
      component: () => import('@/views/Common/KitUiView.vue'),
    },

    // Banc d'essai de l'alarme native (T-13b). Hors AuthLayout, comme /kit-ui : les
    // notifications locales ne dépendent d'aucun appel API, donc d'aucune session.
    {
      name: 'notification_lab',
      path: '/notification-lab',
      component: () => import('@/views/Debug/NotificationLabView.vue'),
    },
  ],
})

// Garde d'authentification (T-40). Jusqu'ici elle vivait dans un `watchEffect` d'AuthLayout :
// le composant se montait, puis redirigeait — la vue protégée avait déjà commencé à charger
// ses données. La décision se prend maintenant avant la navigation.
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Au premier chargement, la session n'est pas encore connue : la garde attend le /api/me
  // plutôt que de conclure « non authentifié » et de rejeter un utilisateur qui l'était.
  await authStore.ensureFetched()

  if (to.meta.requiresAuth && !authStore.isAuth) {
    // `redirect` permet de revenir sur la page demandée après la connexion.
    return { name: 'auth', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && authStore.isAuth) {
    return { name: 'home' }
  }

  return true
})

export default router
