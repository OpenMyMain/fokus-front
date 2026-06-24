<template>
  <main class="p-6">

    <!-- HERO SECTION -->
    <section class="text-center mb-10">
      <h1 class="text-3xl font-bold text-gray-800 mb-3">
        Éditeur de Templates
      </h1>

      <p class="text-gray-600 max-w-lg mx-auto">
        Crée, modifie et organise facilement tes templates.
        Un outil simple, rapide et flexible pensé pour les créateurs.
      </p>

      <div class="mt-6 flex justify-center gap-4">
        <router-link
          to="/templates/create"
          class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
        >
          <i class="fas fa-plus mr-2"></i> Nouveau template
        </router-link>

        <router-link
          to="/templates"
          class="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition"
        >
          <i class="fas fa-folder-open mr-2"></i> Voir mes templates
        </router-link>
      </div>
    </section>

    <!-- SECTIONS / FEATURES -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      <!-- Créer -->
      <div class="feature-card">
        <i class="fas fa-pen-nib feature-icon"></i>
        <h3 class="feature-title">Créer un Template</h3>
        <p class="feature-desc">
          Démarre de zéro ou utilise un modèle préconçu.
        </p>
      </div>

      <!-- Modifier -->
      <div class="feature-card">
        <i class="fas fa-edit feature-icon"></i>
        <h3 class="feature-title">Modifier & Personnaliser</h3>
        <p class="feature-desc">
          Une interface simple pour organiser textes, images et blocs.
        </p>
      </div>

      <!-- Bibliothèque -->
      <div class="feature-card">
        <i class="fas fa-layer-group feature-icon"></i>
        <h3 class="feature-title">Bibliothèque</h3>
        <p class="feature-desc">
          Gère tous tes modèles en un endroit, avec aperçu rapide.
        </p>
      </div>

      <!-- Export -->
      <div class="feature-card">
        <i class="fas fa-file-export feature-icon"></i>
        <h3 class="feature-title">Exporter</h3>
        <p class="feature-desc">
          Exporte en JSON, HTML, PDF ou formats personnalisés.
        </p>
      </div>

      <!-- Collaboration -->
      <div class="feature-card">
        <i class="fas fa-users feature-icon"></i>
        <h3 class="feature-title">Collaborer</h3>
        <p class="feature-desc">
          Partage tes templates et travaille à plusieurs.
        </p>
      </div>

      <!-- Historique -->
      <div class="feature-card">
        <i class="fas fa-history feature-icon"></i>
        <h3 class="feature-title">Historique</h3>
        <p class="feature-desc">
          Reviens facilement à la version précédente d’un template.
        </p>
      </div>

    </section>
  </main>
</template>

<style>
.feature-card {
  background: white;
  padding: 22px;
  border-radius: 14px;
  text-align: center;
  border: 1px solid #e5e7eb; /* gray-200 */
  transition: all 0.25s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: #cbd5e1; /* gray-300 */
  box-shadow: 0 6px 12px rgba(0,0,0,0.06);
}

.feature-icon {
  font-size: 32px;
  color: #2563eb; /* blue-600 */
  margin-bottom: 12px;
}

.feature-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 6px;
  color: #1f2937; /* gray-800 */
}

.feature-desc {
  font-size: 14px;
  color: #6b7280; /* gray-500 */
}
</style>

<script setup>
import {computed} from 'vue';
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();

const user = computed(() => authStore.user);
</script>
