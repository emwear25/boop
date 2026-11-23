<script setup lang="ts">
import { social } from '~/config/social'
withDefaults(defineProps<{ labels?: boolean }>(), { labels: false })
</script>

<template>
  <ul class="social" :class="{ labels }">
    <li v-for="s in social" :key="s.id">
      <a :href="s.url" target="_blank" rel="noopener" :aria-label="`boop в ${s.name}`">
        <svg v-if="s.id === 'instagram'" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1.1" class="dot" /></svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8.5V7c0-.8.5-1.2 1.2-1.2H17V3h-2.5C11.8 3 11 4.8 11 7v1.5H8.5V11.5H11V21h3v-9.5h2.6l.4-3H14Z" class="fill" /></svg>
        <span v-if="labels">{{ s.name }} <small>{{ s.handle }}</small></span>
      </a>
    </li>
  </ul>
</template>

<style scoped>
.social { list-style: none; display: flex; gap: 10px; }
.social a { display: inline-flex; align-items: center; gap: 10px; }
.social svg { width: 40px; height: 40px; padding: 9px; border-radius: 50%; border: 1px solid var(--line); stroke: var(--moss); stroke-width: 1.6; fill: none; transition: background .2s, border-color .2s; }
.social svg .dot, .social svg .fill { fill: var(--moss); stroke: none; }
.social a:hover svg { background: var(--moss); border-color: var(--moss); stroke: var(--paper); }
.social a:hover svg .dot, .social a:hover svg .fill { fill: var(--paper); }
.labels { flex-direction: column; gap: 12px; }
.labels span { font-weight: 500; }
.labels small { font-weight: 400; color: var(--moss-3); margin-left: 6px; }
</style>
