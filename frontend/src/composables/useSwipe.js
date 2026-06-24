// src/composables/useSwipe.js
import {ref, onUnmounted} from 'vue';

export function useSwipe() {
  const touchStartX = ref(0);
  const touchEndX = ref(0);
  const swipeThreshold = 50;

  // Retourne une fonction pour enregistrer un élément swipeable
  const registerSwipe = (el, callbacks = {}) => {
    if (!el) return;

    const handleTouchStart = (e) => {
      touchStartX.value = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      touchEndX.value = e.changedTouches[0].clientX;
      const diff = touchEndX.value - touchStartX.value;
      if (Math.abs(diff) < swipeThreshold) return;


      if (diff < 0) {
        callbacks.onSwipeLeft?.();  // Appelle la fonction si elle existe
      } else {
        callbacks.onSwipeRight?.();
      }
    };

    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchend', handleTouchEnd);

    onUnmounted(() => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    });
  };

  return {registerSwipe};
}
