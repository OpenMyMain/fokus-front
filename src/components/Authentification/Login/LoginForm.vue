<template>
  <div class="mx-2">
    <form class="app-form-container" @submit.prevent="login">
      <div v-if="errorMsg" class="error-msg-box">
        {{ errorMsg }}
      </div>

      <AppInput type="text" :label="t('loginForm.emailLabel')" v-model="email" required autocomplete="email"></AppInput>

      <AppInput type="password" :label="t('loginForm.passwordLabel')" v-model="password" required
                autocomplete="current-password"/>

      <div class="mx-2 flex justify-between items-center mt-2 gap-4">
        <div class="flex items-center gap-2">
          <input type="checkbox" name="remember_me" id="remember_me"/>
          <label class="text-sm text-on-surface-variant dark:text-slate-300" for="remember_me">{{ t('loginForm.rememberMe') }}</label>
        </div>

        <router-link :to="{ name: 'forgot_password' }" class="text-blue-500 dark:text-blue-400 hover:underline">
          {{ t('loginForm.forgotPassword') }}
        </router-link>
      </div>

      <div class="mt-2">
        <button type="submit" class="primary-btn">{{ t('loginForm.submit') }}</button>
      </div>

    </form>
  </div>
</template>
<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from 'vue-i18n';
import {useAuthStore} from "@/stores/auth.js";
import AppInput from "@/components/Common/Form/AppInput.vue";

const {t} = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Destination après connexion : celle que la garde du routeur avait interceptée, sinon
// l'accueil. Seuls les chemins internes sont acceptés — un `redirect` fabriqué à la main
// (`//evil.tld`, `https://…`) ne doit pas pouvoir emmener l'utilisateur hors de l'app.
function redirectTarget() {
  const requested = route.query.redirect;

  if (typeof requested !== 'string' || !requested.startsWith('/') || requested.startsWith('//')) {
    return '/';
  }

  return requested;
}

const email = ref('');
const password = ref('');

const user = computed(() => authStore.user);

const errorMsg = ref(null);

const login = async () => {
  errorMsg.value = null;
  try {
    await authStore.login(email.value, password.value);
    await router.replace(redirectTarget());
  } catch (error) {
    errorMsg.value = error;
  }
}

function checkUserAlreadyLoggedIn() {
  if (user.value) {
    router.push('/');
  }
}

onMounted(() => {
  checkUserAlreadyLoggedIn();
});

watch(user, () => {
  checkUserAlreadyLoggedIn();
});
</script>
