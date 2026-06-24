<template>
  <div class="mx-2">
    <form class="app-form-container" @submit.prevent="login">
      <div v-if="errorMsg" class="error-msg-box">
        {{ errorMsg }}
      </div>

      <AppInput type="text" label="Email" v-model="email" required autocomplete="email"></AppInput>

      <AppInput type="password" label="Password" v-model="password" required
                autocomplete="current-password"/>

      <div class="mx-2 flex justify-between items-center mt-2 gap-4">
        <div class="flex items-center gap-2">
          <input type="checkbox" name="remember_me" id="remember_me"/>
          <label class="text-sm" for="remember_me">Remember me</label>
        </div>

        <router-link :to="{ name: 'forgot_password' }" class="text-blue-500 hover:underline">
          Forgot your password?
        </router-link>
      </div>

      <div class="mt-2">
        <button type="submit">Login</button>
      </div>

    </form>
  </div>
</template>
<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/stores/auth.js";
import AppInput from "@/components/Common/Form/AppInput.vue";

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const user = computed(() => authStore.user);

const errorMsg = ref(null);

const login = async () => {
  errorMsg.value = null;
  try {
    await authStore.login(email.value, password.value);
    await router.replace('/');
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
