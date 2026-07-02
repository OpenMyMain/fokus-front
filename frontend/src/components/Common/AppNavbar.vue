<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
    <div class="flex justify-around items-center h-16">

      <!-- ITEM 1 -->
      <router-link
        :to="{name: 'home'}"
        class="nav-item"
        :class="{ active: $route.name === '#' }"
      >
        <i class="fas fa-dice nav-icon"></i>
        <span>ITEM 1</span>
      </router-link>

      <!-- ITEM 2 -->
      <router-link
        :to="{name: 'home'}"
        class="nav-item"
        :class="{ active: $route.name === 'vinyles' }"
      >
        <i class="fas fa-record-vinyl nav-icon"></i>
        <span>ITEM 2</span>
      </router-link>

      <!-- ITEM 3 -->
      <router-link
        :to="{name: 'home'}"
        class="nav-item"
        :class="{ active: $route.name === 'video_games' }"
      >
        <i class="fas fa-gamepad nav-icon"></i>
        <span>ITEM 3</span>
      </router-link>

      <!-- ITEM 4 -->
      <router-link
        :to="{name: 'home'}"
        class="nav-item"
        :class="{ active: $route.name === 'publications' }"
      >
        <i class="fas fa-newspaper nav-icon"></i>
        <span>ITEM 4</span>
      </router-link>

      <!-- PROFIL -->
      <router-link
        :to="{name: 'social_accounts'}"
        class="nav-item"
        :class="{ active: $route.name === 'social_accounts' }"
      >
        <i class="fas fa-user nav-icon"></i>
        <span>Profil</span>
      </router-link>

    </div>
  </div>
</template>
<style>
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 11px;
  color: #6b7280; /* gray-500 */
  transition: all 0.2s ease-in-out;
}

.nav-item .nav-icon {
  font-size: 20px;
  margin-bottom: 2px;
  transition: transform 0.2s ease-in-out;
}

.nav-item:hover {
  color: #2563eb; /* blue-600 */
}

.nav-item.active {
  color: #2563eb; /* blue-600 */
  font-weight: 600;
}

.nav-item.active .nav-icon {
  transform: scale(1.15);
}
</style>
