<template>
  <main class="max-w-4xl mx-auto py-lg">
    <div class="flex justify-center items-center py-xl">
      <div class="glass-card rounded-xl p-6 text-center max-w-md space-y-4">
        <span class="material-symbols-outlined text-[64px] text-outline dark:text-slate-400 block mx-auto">
          explore_off
        </span>

        <p class="font-display-lg text-display-lg text-primary dark:text-blue-300">404</p>

        <h1 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">
          {{ t('notFoundView.title') }}
        </h1>

        <p class="font-body-md text-body-md text-on-surface-variant dark:text-slate-300">
          {{ t('notFoundView.message') }}
        </p>

        <p class="font-body-sm text-body-sm text-outline dark:text-slate-500 break-all">
          {{ attemptedPath }}
        </p>

        <div class="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors"
            @click="goBack"
          >
            {{ t('common.back') }}
          </button>

          <router-link
            :to="{ name: 'home' }"
            class="flex-1 px-4 py-2 rounded-lg font-label-md text-label-md accent-gradient text-white hover:opacity-90 transition-opacity"
          >
            {{ t('notFoundView.backHome') }}
          </router-link>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const attemptedPath = computed(() => route.fullPath);

function goBack() {
  // `back()` sur une entrée d'historique venue d'ailleurs (lien externe, URL tapée à la main)
  // sortirait de l'app : on retombe sur l'accueil dans ce cas.
  if (window.history.state?.back) {
    router.back();
    return;
  }

  router.replace({ name: 'home' });
}
</script>
