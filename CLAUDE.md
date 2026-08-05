# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Fokus** is the frontend of a personal productivity app — a Vue 3 SPA also packaged as an Android app via Capacitor.

Au-delà du socle d'authentification, l'app couvre aujourd'hui **quatre domaines** :

| Domaine | Écrans | État |
|---------|--------|------|
| Compte | login, register, mot de passe oublié/réinitialisé, logout, profil | complet |
| Projets | liste + détail (sprints, lots, tâches, drag entre lots), détail de tâche | fonctionnel |
| Habitudes | liste + création avec récurrence complète | **incomplet** : ni édition, ni archivage, et **les occurrences du jour ne sont jamais affichées ni cochables** |
| Planning | grille semaine/jour en quarts d'heure, création de créneau, suppression d'occurrence | **incomplet** : un créneau ne peut être ni renommé ni supprimé |
| RDV | liste par période (à venir / passés / tous), création, édition, suppression | fonctionnel (T-32 back + front, 2026-07-26) — **pas encore intégré** à l'agenda du jour ni à la grille de planning (reste de T-34) |

⚠️ **`views/HomeView.vue` — l'écran d'accueil — est encore entièrement factice** : `streak`, liste d'items et
progression sont des constantes locales, cocher un item ne fait aucun appel API. C'est le premier écran de l'app
et le principal chantier ouvert (T-12 de `../ROADMAP.md`).

L'app parle au backend Symfony de `../back` (voir son `CLAUDE.md` : couches Controller/Handler/DTO, voters, routes REST).
La feuille de route produit et la liste des bugs connus vivent dans `../ROADMAP.md` — **la consulter avant d'ouvrir un
chantier**, les références `T-nn` / `F-nn` y sont utilisées comme identifiants de tâches.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # Production build
npm run preview   # Preview a production build locally
npm run lint      # ESLint, auto-fix
```

`npm run lint` remonte **8 erreurs**, toutes préexistantes et triviales (imports inutilisés,
`vue/multi-word-component-names` sur `Toast.vue`, clé dupliquée dans `tailwind.config.js`). Les ~600 erreurs que ce
fichier annonçait jusqu'au 2026-07-26 venaient en réalité de `android/`, désormais exclu du linter (dossier généré,
il contient une copie buildée de `dist/`). Vérifier tout de même que les fichiers qu'on touche sont propres
(`npx eslint <fichiers>`).

Le linter refuse les dialogues natifs (`no-alert` : `confirm`/`alert`/`prompt`) — voir « Kit UI et composables ».

Android (Capacitor) : `android/` est un projet généré (aucun plugin natif maison à ce jour). Le resynchroniser après une
modification web avant de l'ouvrir dans Android Studio.

## Architecture

### Stack

Vue 3 (`<script setup>`), Vite, Pinia, vue-router, vue-i18n, Tailwind CSS 4, `axios`. Côté Capacitor,
`@aparajita/capacitor-secure-storage` persiste les tokens JWT mobiles (voir le client API plus bas).

### Layout et routing

`router/index.js` définit deux branches :
- `/` (via `layouts/AuthLayout.vue`) — la coquille authentifiée, **à plat** : `home`, `focus`, `profile`, `habits`,
  `projects`, `project_show`, `task_show`, `planning`, `appointments`, plus le catch-all `not_found`. Les anciennes URL
  `/manage/*` sont redirigées (le conteneur à onglets a été retiré par T-42).
- Les écrans non authentifiés : `/login`, `/register` (+ `/register/form`), `/forget-password`, `/reset-password`,
  `/auth`, `/logout`. Plus `/kit-ui`, la vitrine des composants génériques, et `/notification-lab`, le banc d'essai
  de l'alarme native.

`AuthLayout.vue` rend `components/Common/AppHeader.vue` et `AppNavbar.vue` autour de la vue routée.

**Garde d'authentification** (`router.beforeEach`, T-40) : `meta.requiresAuth` est porté par la branche `AuthLayout`,
donc **toute route ajoutée sous `/` est protégée sans rien déclarer**. `meta.guestOnly` renvoie à l'accueil un
utilisateur déjà connecté qui ouvrirait `/login`, `/register` ou `/auth` — mais **pas** `/forget-password` ni
`/reset-password`, qu'on atteint depuis un lien reçu par mail.

La garde commence par `await authStore.ensureFetched()` : au premier chargement la session n'est pas encore connue,
et conclure trop vite rejetterait un utilisateur authentifié. **Utiliser `ensureFetched()` et non `refresh()`** dès
qu'on a besoin de l'état d'auth au démarrage — la promesse est mémoïsée, donc un seul `/api/me`.

Le catch-all `not_found` (`views/Common/NotFoundView.vue`) est **dans** la coquille authentifiée : une faute de
frappe dans l'URL garde le header et la navbar. Un visiteur non connecté est donc renvoyé vers `/auth`, comme pour
n'importe quelle URL protégée.

Une URL protégée interceptée par la garde repart en `?redirect=`, relayée par `LoginLink` puis honorée par
`LoginForm` — qui n'accepte que des chemins internes (`/…` et pas `//…`), pour ne pas ouvrir une redirection externe.

### Stores Pinia

Un store par ressource, tous en *setup store* (`ref`/`computed` retournés), tous suivant la même forme
(`state`, `loading`, `fetchAll`/`fetchOne`, `create`, `update`, `delete`) :

| Store | Expose | Manques |
|-------|--------|---------|
| `auth.js` | `user`, `isFetched`, `isAuth`, `login`, `refresh`, `reset` | — |
| `projects.js` | `fetchAll`, `fetchOne`, `create` | **ni `update` ni `delete`** alors que les routes existent (T-35) |
| `projectTypes.js` | `fetchAll`, `create` | ni édition ni suppression (T-37) |
| `sprints.js` | + les transitions `plan`/`start`/`complete`/`reopen`, `fetchTreeForProject` | — |
| `lots.js`, `tasks.js` | CRUD complet | — |
| `habits.js` | CRUD complet | `update` n'est appelé par aucun écran ; **aucun store ne consomme les occurrences** (T-11) |
| `timeSlots.js` | CRUD + `addOccurrence`/`deleteOccurrence` | `update`/`delete` écrits mais jamais appelés (T-38) |
| `appointments.js` | CRUD complet ; `fetchAll({ from, to })` passe la plage en query string | — |

**Aucun cache** : chaque `fetchAll` écrase le state, donc chaque navigation refait tous les appels (F-17).

### Auth store (`stores/auth.js`)

Source de vérité unique de la session. `login()`, `refresh()` et `reset()` sont **asynchrones et doivent être `await`és** —
ils pilotent le stockage des tokens (`setTokens`/`loadTokens`/`clearTokens`). Deux branches :
- **web** — `POST /api/login` renvoie l'utilisateur sérialisé (`data.data`), la session vit dans un cookie, rien n'est stocké côté client.
- **mobile** — le même appel renvoie `{token, refresh_token}` et *pas* d'utilisateur : `login()` stocke les tokens puis
  appelle `refresh()` pour lire `/api/me` avec le `Bearer` en place. Si ce `/me` échoue, il lève plutôt que de laisser
  l'app avec un `user` vide (qui la renverrait silencieusement vers `/auth`).

`refresh()` commence par `loadTokens()` : sur mobile, rien n'est restauré automatiquement entre deux lancements.

`App.vue` appelle `refresh()` une fois au montage et affiche `AppLoader` jusqu'à ce que `isFetched` bascule.

### API client (`plugins/api.js`)

Une seule instance axios (`withCredentials: true`, base URL depuis `VITE_API_URL`) qui doit fonctionner avec les **deux
firewalls** du backend (voir `back/CLAUDE.md` → Authentication) : session sur web, JWT stateless sur mobile.

- Chaque requête porte **`X-Platform: web|mobile`** (dérivé une fois de `Capacitor.getPlatform()`) — c'est ce header qui
  fait choisir le firewall mobile côté backend ; sans lui, l'app mobile s'authentifie contre le firewall session et
  récolte un `401` à chaque appel après le login.
- Sur mobile uniquement, un intercepteur de requête ajoute `Authorization: Bearer <accessToken>`.
- Les tokens vivent dans l'état du module et sont persistés dans **`SecureStorage`** — jamais `localStorage`. Le module
  les possède et expose `loadTokens()`/`setTokens()`/`clearTokens()`/`getRefreshToken()` ; le store d'auth est le seul appelant.
- Intercepteur de réponse : sur un `401` mobile avec refresh token disponible, il appelle `POST /api/token/refresh`
  **une seule fois** par requête (drapeau `_retry`) et rejoue l'appel. Les `401` concurrents partagent un unique refresh
  (`refreshPromise`). `login` et `token/refresh` sont exclus (`AUTH_PATHS`).
- Si le refresh échoue — ou sur web — et que le store pense encore l'utilisateur connecté, il `await`s `authStore.reset()`
  (l'`await` compte : `reset()` efface `SecureStorage`) puis redirige en dur vers `/`.
  **Ne pas ajouter de gestion du 401 dans les composants** : cet intercepteur couvre déjà le cas.

**Se déconnecter** (`views/Authentification/LogoutView.vue`) doit appeler `authStore.reset()`, pas seulement
`GET /api/logout` : le firewall mobile est stateless, l'endpoint n'invalide rien et l'app reviendrait authentifiée au
prochain `loadTokens()`. Le refresh token reste d'ailleurs valide **côté serveur** jusqu'à son TTL de 30 jours.

### Connexion tierce (Google/Facebook)

`components/Authentification/{Login/LoginWithTierce,Register/RegisterWithTierce}.vue` affichent un bouton par entrée de
`VITE_APP_TIERCE`. **Le backend n'expose aucune route OAuth** (`/auth/google` n'existe pas), donc le flag est
**vide par défaut** et les boutons sont masqués — cliquer dessus menait à une erreur (F-5, corrigé par T-06).

Le parsing passe par `utils/oauthProviders.js`, tolérant aux valeurs absentes ou mal formées. Pour réactiver les boutons
le jour où la route existera : `VITE_APP_TIERCE=[{"app":"google"},{"app":"facebook"}]`. **Ne pas câbler un faux parcours
de succès** : implémenter d'abord la route backend.

### i18n

Les traductions vivent sous `locales/{fr,en}/`, en miroir de l'arborescence `views/`/`components/` :
`locales/{lang}/views/account/profile.json`, `locales/{lang}/components/appHeader.json`, etc. La clé racine de chaque
fichier est le nom du composant/vue en camelCase (`profileView`, `appHeader`). `plugins/i18n.js` découvre tout seul
chaque JSON via `import.meta.glob` — un nouveau fichier ne demande aucun enregistrement, juste le bon chemin.
`fallbackLocale` vaut `fr`.

Structure auditée le 2026-07-26 (T-41) : **`fr` et `en` sont symétriques** — mêmes fichiers, mêmes clés, et aucune
clé appelée par le code sans exister en locale. Ajouter les deux langues ensemble pour que ça reste vrai.

Les libellés à quantité variable passent par un paramètre, jamais par de la concaténation :
`t('habitListView.everyNDays', { count: interval })`. Trois libellés de récurrence étaient écrits en français en dur
(F-2) — l'app anglaise affichait du français.

### Kit UI et composables

`components/Common/` regroupe les briques sans logique métier : `AppModal`, `AppConfirmModal`, `AppLoader`,
`Toast`/`ToastContainer` (avec le composable `useToast()`), `AppNavbar`, `AppHeader`, `MarkdownRenderer`,
`QuickAddTaskModal`, `Button/AppFloatButton`, `Form/{AppInput,AppTextarea,AppSelect,AppCheckbox}`.
`views/Common/KitUiView.vue` les rend toutes — **la consulter avant de construire un nouveau formulaire** pour éviter de
dupliquer un motif existant.

Composables : `useDarkMode`, `useToast`, `useConfirm`, `useQuickAdd`, `useSwipe`, `useFocusTimer`,
`useLocalNotifications`, `useWebNotifications`. Utilitaires : `utils/dateUtils.js`, `utils/oauthProviders.js`.

🚫 **Aucun dialogue natif du navigateur, jamais** — ni `confirm()`, ni `alert()`, ni `prompt()`, ni leur forme
`window.*`. Dans la WebView Capacitor, Android les affiche dans une popup système intitulée « localhost » : ça casse
l'illusion d'app native (F-11), et ces dialogues bloquent le thread JS, ignorent le thème sombre et échappent à l'i18n.
Un équivalent maison existe pour les trois cas :

| Besoin | À utiliser | Interdit |
|--------|-----------|----------|
| Confirmer une action destructive | `confirm()` de `composables/useConfirm.js` | `window.confirm()` |
| Informer, signaler une erreur ou un succès | `useToast()` (`success` / `warning` / `error`) | `window.alert()` |
| Demander une saisie | une `AppModal` avec les champs de `Form/` | `window.prompt()` |

Le `confirm()` du composable renvoie une promesse, donc l'appel reste aussi court que la version native :

```js
const { confirm } = useConfirm()

if (!await confirm({ title: t('…Title'), body: t('…Confirm'), confirmLabel: t('common.delete'), danger: true })) {
  return
}
```

`AppConfirmModal` est monté **une seule fois** dans `App.vue` (comme `ToastContainer`) : ne pas en instancier dans
un écran, ne pas déclarer de `ref`. `danger: true` donne le bouton rouge. `AppModal` reste la brique pour les
modales de formulaire.

Note pour qui touche `AppModal` : il émet `close` à **chaque** fermeture (fond, Échap, footer). `AppConfirmModal`
s'en sert pour résoudre sa promesse à `false` — sans cet événement, un clic sur le fond laisserait l'appelant
bloqué sur une promesse jamais résolue.

### Rendez-vous (`views/Appointment/AppointmentListView.vue`)

Écran unique : liste groupée par jour, filtre de période (**à venir / passés / tous**), FAB de création, et une seule
`AppModal` qui sert à la fois la création et l'édition — `editingId` fait la différence. La suppression passe par
`useConfirm`. Trois points à connaître avant d'y toucher :

- **Les heures sont « murales », jamais converties.** Le backend ignore le fuseau de l'utilisateur : il stocke et
  renvoie l'heure saisie telle quelle (`2026-08-03T09:30:00+00:00` pour un RDV de 9 h 30). Lire ça avec `new Date()`
  puis l'afficher en heure locale décalerait de l'offset du navigateur — 11 h 30 à Paris. La vue extrait donc les
  composants de la chaîne (`parseWallClock`) et reconstruit une date **locale**, comme `HabitListView` le fait déjà
  pour l'heure de rappel. Même règle pour tout nouvel écran daté.
- **Le formulaire est date + heures, le backend attend des date-heures.** On envoie `startAt: "YYYY-MM-DD HH:MM"` et
  `endAt` sur la **même journée** (`null` si l'heure de fin est vide). Un RDV à cheval sur minuit n'est donc pas
  saisissable aujourd'hui. `reminderMinutesBefore` doit être un **nombre** (`Number(...)`) : le DTO backend est typé
  `?int` strictement et rejette `"30"` en 422.
- **Pas d'onglet dans la navbar mobile** (déjà à quatre entrées + focus) : on accède aux RDV depuis le bouton
  « Mes RDV » de `PlanningView` et depuis le lien du header desktop, et l'onglet Planning reste actif grâce à son
  `match: ['planning', 'appointments']`. C'est cohérent avec T-42, qui ne prévoit pas d'entrée RDV.

`reminderMinutesBefore` est enregistré mais **aucun rappel n'est encore envoyé** (T-23) : le badge de la carte porte
un `title` qui le dit, ne pas laisser croire l'inverse dans l'UI. Reste de T-34 : afficher les RDV dans l'agenda du
jour (`HomeView`) et dans la grille de planning.

### Ajouter une fonctionnalité

Ajouter la ou les vues sous `views/`, les routes en enfants de la branche `AuthLayout` dans `router/index.js`, un store
Pinia sous `stores/` s'il faut un état partagé, et les fichiers de locale (fr **et** en). Réutiliser le kit
`components/Common/` plutôt que de créer de nouvelles primitives. Vérifier dans `../ROADMAP.md` qu'une référence `T-nn`
ne couvre pas déjà le sujet — et **ne jamais laisser derrière soi un bouton qui ne fait rien** : c'est la dette
principale de ce front aujourd'hui.
