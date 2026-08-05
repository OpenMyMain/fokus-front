<template>
  <!--
    Hôte unique des confirmations (F-11 / T-39), monté une seule fois dans `App.vue` comme
    `ToastContainer`. Les écrans n'instancient rien : ils appellent `confirm()` de
    `composables/useConfirm.js` et attendent la promesse.
  -->
  <AppModal ref="modal" @validate="accept" @close="cancel">
    <template #header>
      <h2>{{ request?.title || t('appConfirmModal.defaultTitle') }}</h2>
    </template>

    <template #body>
      <p class="font-body-md text-body-md text-on-surface dark:text-slate-100">
        {{ request?.body }}
      </p>
    </template>

    <template #footer>
      <button
        type="button"
        class="px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant dark:border-slate-600 text-on-surface dark:text-slate-100 hover:bg-surface-container transition-colors"
        @click="cancel"
      >
        {{ request?.cancelLabel || t('common.cancel') }}
      </button>

      <button
        type="button"
        :class="[
          'px-4 py-2 rounded-lg font-label-md text-label-md text-white hover:opacity-90 transition-opacity',
          request?.danger ? 'bg-error dark:bg-red-900' : 'accent-gradient',
        ]"
        @click="accept"
      >
        {{ request?.confirmLabel || t('common.confirm') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppModal from '@/components/Common/AppModal.vue';
import { useConfirm } from '@/composables/useConfirm.js';

const { t } = useI18n();
const { request, accept, cancel } = useConfirm();

const modal = ref(null);

// `AppModal` est impérative (`open`/`close`), la demande de confirmation est un état :
// on synchronise l'une sur l'autre. `close()` réémet `close` → `cancel()`, sans effet
// puisque la promesse est déjà résolue à ce stade.
watch(request, (value) => {
  if (value) modal.value?.open();
  else modal.value?.close();
});
</script>
