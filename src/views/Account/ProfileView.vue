<template>
  <main class="max-w-4xl mx-auto py-lg">
    <!-- Header -->
    <div class="space-y-md mb-xl">
      <h1 class="font-headline-md text-headline-md md:font-display-lg md:text-display-lg text-on-surface dark:text-slate-100">{{ t('profileView.title') }}</h1>
      <p class="font-body-lg text-body-lg text-outline dark:text-slate-400">{{ t('profileView.subtitle') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-xl">
      <span class="material-symbols-outlined animate-spin text-primary dark:text-blue-300 text-[48px]">
        refresh
      </span>
    </div>


    <!-- Profile Content -->
    <div v-else class="space-y-lg">
      <!-- Profile Information Card -->
      <section class="glass-card rounded-xl p-4 md:p-6 space-y-4 md:space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary dark:text-blue-300">person</span>
            {{ t('profileView.personalInfoTitle') }}
          </h2>
          <button
            v-if="!isEditing"
            @click="toggleEditMode"
            class="text-primary dark:text-blue-300 font-label-md text-label-md flex items-center gap-1 hover:text-primary-fixed-dim transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">edit</span>
            {{ t('profileView.editButton') }}
          </button>
        </div>

        <div v-if="isEditing" class="space-y-4">
          <!-- Firstname Field -->
          <div class="space-y-2">
            <label for="firstname" class="font-label-md text-label-md text-on-surface-variant dark:text-slate-300">
              {{ t('profileView.firstnameLabel') }}
            </label>
            <input
              id="firstname"
              v-model="formData.firstname"
              type="text"
              class="w-full px-4 py-3 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100 font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
              :placeholder="t('profileView.firstnamePlaceholder')"
            />
          </div>

          <!-- Lastname Field -->
          <div class="space-y-2">
            <label for="lastname" class="font-label-md text-label-md text-on-surface-variant dark:text-slate-300">
              {{ t('profileView.lastnameLabel') }}
            </label>
            <input
              id="lastname"
              v-model="formData.lastname"
              type="text"
              class="w-full px-4 py-3 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100 font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
              :placeholder="t('profileView.lastnamePlaceholder')"
            />
          </div>

          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="font-label-md text-label-md text-on-surface-variant dark:text-slate-300">
              {{ t('profileView.emailLabel') }}
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="w-full px-4 py-3 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100 font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
              :placeholder="t('profileView.emailPlaceholder')"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              @click="saveProfile"
              :disabled="savingProfile"
              class="flex-1 accent-gradient text-white px-6 py-3 rounded-lg font-label-md text-label-md shadow hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="savingProfile" class="material-symbols-outlined animate-spin text-[18px]">
                refresh
              </span>
              <span v-else class="material-symbols-outlined text-[18px]">check</span>
              {{ savingProfile ? t('profileView.saving') : t('profileView.saveButton') }}
            </button>
            <button
              @click="toggleEditMode"
              :disabled="savingProfile"
              class="flex-1 px-6 py-3 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t('profileView.cancelButton') }}
            </button>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <p class="font-label-md text-label-md text-outline dark:text-slate-400 uppercase">{{ t('profileView.firstnameLabel') }}</p>
            <p class="font-body-lg text-body-lg text-on-surface dark:text-slate-100">{{ user.firstname }}</p>
          </div>
          <div class="space-y-2">
            <p class="font-label-md text-label-md text-outline dark:text-slate-400 uppercase">{{ t('profileView.lastnameLabel') }}</p>
            <p class="font-body-lg text-body-lg text-on-surface dark:text-slate-100">{{ user.lastname }}</p>
          </div>
          <div class="space-y-2 md:col-span-2">
            <p class="font-label-md text-label-md text-outline dark:text-slate-400 uppercase">{{ t('profileView.emailLabel') }}</p>
            <p class="font-body-lg text-body-lg text-on-surface dark:text-slate-100">{{ user.email }}</p>
          </div>
        </div>
      </section>

      <!-- Change Password Card -->
      <section class="glass-card rounded-xl p-4 md:p-6 space-y-4 md:space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary dark:text-blue-300">vpn_key</span>
            {{ t('profileView.securityTitle') }}
          </h2>
        </div>

        <div v-if="!isChangingPassword" class="space-y-4">
          <p class="font-body-md text-body-md text-on-surface-variant dark:text-slate-300">
            {{ t('profileView.changePasswordDescription') }}
          </p>
          <button
            @click="isChangingPassword = true"
            class="text-primary dark:text-blue-300 font-label-md text-label-md flex items-center gap-1 hover:text-primary-fixed-dim transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">edit</span>
            {{ t('profileView.changePasswordButton') }}
          </button>
        </div>

        <div v-else class="space-y-4">
          <!-- Old Password Field -->
          <div class="space-y-2">
            <label for="oldPassword" class="font-label-md text-label-md text-on-surface-variant dark:text-slate-300">
              {{ t('profileView.oldPasswordLabel') }}
            </label>
            <input
              id="oldPassword"
              v-model="passwordForm.oldPassword"
              type="password"
              class="w-full px-4 py-3 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100 font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
              :placeholder="t('profileView.oldPasswordPlaceholder')"
            />
          </div>

          <!-- New Password Field -->
          <div class="space-y-2">
            <label for="newPassword" class="font-label-md text-label-md text-on-surface-variant dark:text-slate-300">
              {{ t('profileView.newPasswordLabel') }}
            </label>
            <input
              id="newPassword"
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full px-4 py-3 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100 font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
              :placeholder="t('profileView.newPasswordPlaceholder')"
            />
            <p class="font-body-sm text-body-sm text-outline dark:text-slate-400">
              {{ t('profileView.newPasswordHint') }}
            </p>
          </div>

          <!-- Confirm New Password Field -->
          <div class="space-y-2">
            <label for="confirmPassword" class="font-label-md text-label-md text-on-surface-variant dark:text-slate-300">
              {{ t('profileView.confirmPasswordLabel') }}
            </label>
            <input
              id="confirmPassword"
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full px-4 py-3 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100 font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
              :placeholder="t('profileView.confirmPasswordPlaceholder')"
            />
            <p v-if="passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="font-body-sm text-body-sm text-error dark:text-red-400">
              {{ t('profileView.passwordMismatch') }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              @click="changePassword"
              :disabled="!isPasswordFormValid || changingPassword"
              class="flex-1 accent-gradient text-white px-6 py-3 rounded-lg font-label-md text-label-md shadow hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="changingPassword" class="material-symbols-outlined animate-spin text-[18px]">
                refresh
              </span>
              <span v-else class="material-symbols-outlined text-[18px]">check</span>
              {{ changingPassword ? t('profileView.changingPassword') : t('profileView.changeButton') }}
            </button>
            <button
              @click="cancelPasswordChange"
              :disabled="changingPassword"
              class="flex-1 px-6 py-3 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t('profileView.cancelButton') }}
            </button>
          </div>
        </div>
      </section>

      <!-- Preferences Card -->
      <section class="glass-card rounded-xl p-4 md:p-6 space-y-4 md:space-y-6">
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary dark:text-blue-300">palette</span>
          {{ t('profileView.preferencesTitle') }}
        </h2>

        <div class="space-y-4">
          <!-- Dark Mode Toggle -->
          <div class="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant dark:border-slate-600">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary dark:text-blue-300">dark_mode</span>
              <div>
                <p class="font-label-md text-label-md text-on-surface dark:text-slate-100">{{ t('profileView.darkModeLabel') }}</p>
                <p class="font-body-sm text-body-sm text-outline dark:text-slate-400">{{ t('profileView.darkModeDescription') }}</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                :checked="isDark"
                @change="toggleDarkMode"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-outline-variant peer-focus:outline peer-focus:outline-2 peer-focus:outline-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <!-- Language Selector -->
          <div class="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant dark:border-slate-600">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary dark:text-blue-300">language</span>
              <div>
                <p class="font-label-md text-label-md text-on-surface dark:text-slate-100">{{ t('profileView.languageLabel') }}</p>
                <p class="font-body-sm text-body-sm text-outline dark:text-slate-400">{{ t('profileView.languageDescription') }}</p>
              </div>
            </div>
            <select
              v-model="currentLocale"
              @change="onLocaleChange"
              class="px-3 py-2 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100 font-body-sm text-body-sm focus:outline-none focus:border-primary transition-colors"
            >
              <option value="fr">{{ t('profileView.languageFrench') }}</option>
              <option value="en">{{ t('profileView.languageEnglish') }}</option>
            </select>
          </div>

          <!-- Notifications Toggle (bientôt disponible) -->
          <div class="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant dark:border-slate-600">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary dark:text-blue-300">notifications</span>
              <div>
                <p class="font-label-md text-label-md text-on-surface dark:text-slate-100">{{ t('profileView.notificationsLabel') }}</p>
                <p class="font-body-sm text-body-sm text-outline dark:text-slate-400">{{ t('profileView.notificationsComingSoon') }}</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-not-allowed opacity-50">
              <input type="checkbox" disabled class="sr-only peer"/>
              <div class="w-11 h-6 bg-outline-variant rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </section>

      <!-- Account Status Card -->
      <section class="glass-card rounded-xl p-4 md:p-6 space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary dark:text-blue-300">lock</span>
          {{ t('profileView.accountStatusTitle') }}
        </h2>

        <div class="space-y-3">
          <div class="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant dark:border-slate-600">
            <div class="flex items-center gap-3">
              <span v-if="user.disabledAt" class="material-symbols-outlined text-error dark:text-red-400">block</span>
              <span v-else class="material-symbols-outlined text-success dark:text-green-400">check_circle</span>
              <div>
                <p class="font-label-md text-label-md text-on-surface dark:text-slate-100">{{ t('profileView.accountLabel') }}</p>
                <p v-if="user.disabledAt" class="font-body-sm text-body-sm text-error dark:text-red-400">{{ t('profileView.accountDisabled') }}</p>
                <p v-else class="font-body-sm text-body-sm text-success dark:text-green-400">{{ t('profileView.accountActive') }}</p>
              </div>
            </div>
            <button
              v-if="!user.disabledAt"
              @click="deactivateAccount"
              :disabled="deactivatingAccount"
              class="px-4 py-2 rounded-lg font-label-md text-label-md text-error dark:text-red-400 border border-error dark:border-red-900 hover:bg-error-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ deactivatingAccount ? t('profileView.deactivating') : t('profileView.deactivateButton') }}
            </button>
            <button
              v-else
              @click="reactivateAccount"
              :disabled="reactivatingAccount"
              class="px-4 py-2 rounded-lg font-label-md text-label-md text-primary dark:text-blue-300 border border-primary dark:border-blue-600 hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ reactivatingAccount ? t('profileView.reactivating') : t('profileView.reactivateButton') }}
            </button>
          </div>
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="glass-card danger-zone rounded-xl p-4 md:p-6 space-y-4 border border-error-container dark:border-red-700">
        <h2 class="font-headline-sm text-headline-sm text-error dark:text-red-400 flex items-center gap-2">
          <span class="material-symbols-outlined">warning</span>
          {{ t('profileView.dangerZoneTitle') }}
        </h2>

        <p class="font-body-md text-body-md text-on-surface dark:text-slate-100">
          {{ t('profileView.dangerZoneDescription') }}
        </p>

        <button
          @click="showDeleteConfirmation = true"
          :disabled="deletingAccount"
          class="w-full px-6 py-3 rounded-lg font-label-md text-label-md text-white bg-error dark:bg-red-900 border border-error dark:border-red-900 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-[18px]">delete</span>
          {{ deletingAccount ? t('profileView.deleting') : t('profileView.deleteAccountButton') }}
        </button>
      </section>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="glass-card rounded-xl p-4 md:p-6 max-w-md w-full space-y-4">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-error dark:text-red-400 text-[32px]">warning</span>
              <h2 class="font-headline-sm text-headline-sm text-on-surface dark:text-slate-100">{{ t('profileView.deleteConfirmTitle') }}</h2>
            </div>

            <p class="font-body-md text-body-md text-on-surface-variant dark:text-slate-300">
              {{ t('profileView.deleteConfirmMessage') }}
            </p>

            <div class="space-y-2">
              <p class="font-label-sm text-label-sm text-outline dark:text-slate-400">{{ t('profileView.deleteConfirmEmailPrompt') }}</p>
              <input
                v-model="deleteConfirmationEmail"
                type="email"
                class="w-full px-4 py-2 rounded-lg border border-outline-variant dark:border-slate-600 bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100 font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
                :placeholder="user.email"
              />
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="deleteAccount"
                :disabled="deleteConfirmationEmail !== user.email || deletingAccount"
                class="flex-1 px-4 py-2 rounded-lg font-label-md text-label-md text-white bg-error dark:bg-red-900 border border-error dark:border-red-900 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ deletingAccount ? t('profileView.deleting') : t('profileView.deleteButton') }}
              </button>
              <button
                @click="cancelDelete"
                :disabled="deletingAccount"
                class="flex-1 px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ t('profileView.cancelButton') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm.js'
import { useDarkMode } from '@/composables/useDarkMode'
import { getLocale, setLocale } from '@/plugins/i18n.js'
import api from '@/plugins/api'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const { confirm } = useConfirm()
const { isDark, toggleDarkMode } = useDarkMode()

const currentLocale = ref(getLocale())

function onLocaleChange() {
  setLocale(currentLocale.value)
}

const loading = ref(true)
const isEditing = ref(false)
const savingProfile = ref(false)
const isChangingPassword = ref(false)
const changingPassword = ref(false)
const deactivatingAccount = ref(false)
const reactivatingAccount = ref(false)
const deletingAccount = ref(false)
const showDeleteConfirmation = ref(false)
const deleteConfirmationEmail = ref('')

const user = reactive({
  id: null,
  firstname: '',
  lastname: '',
  email: '',
  disabledAt: null,
})

const formData = reactive({
  firstname: '',
  lastname: '',
  email: '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const loadUserProfile = async () => {
  try {
    loading.value = true

    const response = await api.get('me')
    const data = response.data.data || response.data

    Object.assign(user, {
      id: data.id,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      disabledAt: data.disabledAt,
    })

    // Initialize form data
    formData.firstname = user.firstname
    formData.lastname = user.lastname
    formData.email = user.email
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('profileView.loadProfileError'))
    console.error(err)
  } finally {
    loading.value = false
  }
}

const toggleEditMode = () => {
  if (isEditing.value) {
    // Reset form data when canceling
    formData.firstname = user.firstname
    formData.lastname = user.lastname
    formData.email = user.email
  }
  isEditing.value = !isEditing.value
}

const saveProfile = async () => {
  try {
    savingProfile.value = true

    const response = await api.patch(`users/${user.id}`, {
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
    })

    const data = response.data.data || response.data
    Object.assign(user, {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
    })

    // Update auth store user data
    authStore.user.firstname = data.firstname
    authStore.user.lastname = data.lastname
    authStore.user.email = data.email

    isEditing.value = false
    toast.success(t('profileView.updateProfileSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('profileView.updateProfileError'))
    console.error(err)
  } finally {
    savingProfile.value = false
  }
}

const deactivateAccount = async () => {
  const confirmed = await confirm({
    title: t('profileView.deactivateConfirmTitle'),
    body: t('profileView.deactivateConfirm'),
    confirmLabel: t('profileView.deactivateButton'),
    danger: true,
  })

  if (!confirmed) {
    return
  }

  try {
    deactivatingAccount.value = true

    const response = await api.patch(`users/${user.id}/deactivate`)
    const data = response.data.data || response.data
    user.disabledAt = data.disabledAt
    toast.info(t('profileView.deactivateSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('profileView.deactivateError'))
    console.error(err)
  } finally {
    deactivatingAccount.value = false
  }
}

const reactivateAccount = async () => {
  try {
    reactivatingAccount.value = true

    const response = await api.patch(`users/${user.id}/reactivate`)
    const data = response.data.data || response.data
    user.disabledAt = data.disabledAt
    toast.success(t('profileView.reactivateSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('profileView.reactivateError'))
    console.error(err)
  } finally {
    reactivatingAccount.value = false
  }
}

const deleteAccount = async () => {
  try {
    deletingAccount.value = true

    await api.delete(`users/${user.id}`)

    toast.success(t('profileView.deleteAccountSuccess'))
    // Logout and redirect to login
    setTimeout(() => {
      authStore.reset()
      router.push('/login')
    }, 1000)
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('profileView.deleteAccountError'))
    console.error(err)
  } finally {
    deletingAccount.value = false
    showDeleteConfirmation.value = false
  }
}

const cancelDelete = () => {
  deleteConfirmationEmail.value = ''
  showDeleteConfirmation.value = false
}

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.oldPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword &&
    passwordForm.newPassword.length >= 8
  )
})

const changePassword = async () => {
  if (!isPasswordFormValid.value) {
    toast.warning(t('profileView.passwordFormInvalid'))
    return
  }

  try {
    changingPassword.value = true

    await api.put('me/passwords', {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    })

    // Reset password form
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    isChangingPassword.value = false
    toast.success(t('profileView.changePasswordSuccess'))
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || t('profileView.changePasswordError'))
    console.error(err)
  } finally {
    changingPassword.value = false
  }
}

const cancelPasswordChange = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  isChangingPassword.value = false
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
