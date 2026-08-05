<template>
  <div class="md-content" v-html="html"></div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  source: {
    type: String,
    default: '',
  },
})

// gfm : tableaux, ~~barré~~, etc. — breaks : un simple retour à la ligne devient <br>.
marked.setOptions({ gfm: true, breaks: true })

// Le HTML produit par marked est TOUJOURS nettoyé par DOMPurify avant d'être
// injecté (v-html) : c'est ce qui rend l'affichage de markdown utilisateur sûr
// vis-à-vis des injections (XSS).
const html = computed(() => DOMPurify.sanitize(marked.parse(props.source ?? '')))
</script>

<!-- Non scopé : les styles ciblent le HTML généré par v-html (qui ne porte pas
     l'attribut de scope), mais tout est préfixé par .md-content pour rester contenu. -->
<style>
.md-content {
  color: var(--color-on-surface, #1d1b20);
  font-size: 0.95rem;
  line-height: 1.65;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.dark .md-content {
  color: #f1f5f9; /* slate-100 */
}

.md-content > :first-child {
  margin-top: 0;
}
.md-content > :last-child {
  margin-bottom: 0;
}

.md-content h1,
.md-content h2,
.md-content h3,
.md-content h4 {
  font-weight: 600;
  line-height: 1.3;
  margin: 1.4em 0 0.5em;
}
.md-content h1 {
  font-size: 1.6rem;
}
.md-content h2 {
  font-size: 1.35rem;
}
.md-content h3 {
  font-size: 1.15rem;
}
.md-content h4 {
  font-size: 1rem;
}

.md-content p {
  margin: 0.75em 0;
}

.md-content a {
  color: #2563eb; /* blue-600 */
  text-decoration: underline;
}
.dark .md-content a {
  color: #93c5fd; /* blue-300 */
}

.md-content ul,
.md-content ol {
  margin: 0.75em 0;
  padding-left: 1.5em;
}
.md-content ul {
  list-style: disc;
}
.md-content ol {
  list-style: decimal;
}
.md-content li {
  margin: 0.25em 0;
}
.md-content li > ul,
.md-content li > ol {
  margin: 0.25em 0;
}

.md-content blockquote {
  margin: 1em 0;
  padding: 0.25em 1em;
  border-left: 3px solid #cbd5e1; /* slate-300 */
  color: #64748b; /* slate-500 */
}
.dark .md-content blockquote {
  border-left-color: #475569; /* slate-600 */
  color: #94a3b8; /* slate-400 */
}

.md-content code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.875em;
  background: rgba(148, 163, 184, 0.18); /* slate-400 @ 18% */
  padding: 0.15em 0.35em;
  border-radius: 0.25rem;
}
.md-content pre {
  margin: 1em 0;
  padding: 0.9em 1em;
  border-radius: 0.5rem;
  background: #f1f5f9; /* slate-100 */
  overflow-x: auto;
}
.dark .md-content pre {
  background: #1e293b; /* slate-800 */
}
.md-content pre code {
  background: transparent;
  padding: 0;
  font-size: 0.85em;
}

.md-content hr {
  margin: 1.5em 0;
  border: 0;
  border-top: 1px solid #e2e8f0; /* slate-200 */
}
.dark .md-content hr {
  border-top-color: #334155; /* slate-700 */
}

.md-content table {
  width: 100%;
  margin: 1em 0;
  border-collapse: collapse;
  font-size: 0.9em;
}
.md-content th,
.md-content td {
  border: 1px solid #e2e8f0; /* slate-200 */
  padding: 0.5em 0.75em;
  text-align: left;
}
.dark .md-content th,
.dark .md-content td {
  border-color: #334155; /* slate-700 */
}
.md-content th {
  background: rgba(148, 163, 184, 0.14);
  font-weight: 600;
}

.md-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

.md-content strong {
  font-weight: 600;
}
</style>
