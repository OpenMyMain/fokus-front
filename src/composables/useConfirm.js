import { ref } from 'vue'

/**
 * Remplaçant de `confirm()` natif (F-11 / T-39).
 *
 * Sur Android, `confirm()` affiche une popup système intitulée « localhost » : ça casse
 * l'illusion d'app native. Ce composable garde la même ergonomie d'appel — une promesse
 * qui résout `true` ou `false` — mais rend une `AppModal`.
 *
 *   if (!await confirm({ title: t('...'), body: t('...'), danger: true })) return
 *
 * L'état vit dans le module, comme `useToast` : une seule instance d'`AppConfirmModal`
 * est montée dans `App.vue`, aucun écran n'a de `ref` à déclarer.
 */

const request = ref(null)
let resolveCurrent = null

function confirm(options = {}) {
  // Une confirmation déjà ouverte est annulée plutôt que perdue : sans ça, son appelant
  // resterait bloqué sur une promesse jamais résolue.
  if (resolveCurrent) {
    resolveCurrent(false)
    resolveCurrent = null
  }

  request.value = {
    title: options.title ?? null,
    body: options.body ?? '',
    confirmLabel: options.confirmLabel ?? null,
    cancelLabel: options.cancelLabel ?? null,
    danger: options.danger ?? false,
  }

  return new Promise((resolve) => {
    resolveCurrent = resolve
  })
}

function settle(value) {
  request.value = null

  if (!resolveCurrent) return

  const resolve = resolveCurrent
  resolveCurrent = null
  resolve(value)
}

export function useConfirm() {
  return {
    request,
    confirm,
    accept: () => settle(true),
    cancel: () => settle(false),
  }
}
