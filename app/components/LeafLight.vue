<script setup lang="ts">
// Dappled sunlight through leaves: the light every boop photo is shot in.
// A slow sway, multiplied over whatever sits beneath it. Static under reduced motion.
withDefaults(defineProps<{ strength?: number }>(), { strength: 0.28 })
const id = `leaf-${useId()}`
</script>

<template>
  <svg class="leaf" :style="{ opacity: strength }" viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true">
    <defs><filter :id="id"><feGaussianBlur stdDeviation="14" /></filter></defs>
    <g :filter="`url(#${id})`" fill="#4a2a10">
      <ellipse cx="40" cy="40" rx="46" ry="12" transform="rotate(-30 40 40)" />
      <ellipse cx="110" cy="70" rx="40" ry="11" transform="rotate(-18 110 70)" />
      <ellipse cx="70" cy="120" rx="52" ry="13" transform="rotate(-40 70 120)" />
      <ellipse cx="20" cy="190" rx="44" ry="12" transform="rotate(-25 20 190)" />
      <ellipse cx="150" cy="20" rx="36" ry="10" transform="rotate(-50 150 20)" />
      <ellipse cx="180" cy="110" rx="30" ry="9" transform="rotate(-35 180 110)" />
    </g>
  </svg>
</template>

<style scoped>
.leaf {
  position: absolute; inset: -10%; width: 120%; height: 120%;
  pointer-events: none; mix-blend-mode: multiply;
  animation: sway 9s ease-in-out infinite alternate;
  transform-origin: 0 0;
}
@keyframes sway {
  0% { transform: translate(0, 0) rotate(0deg) skewX(0deg); }
  60% { transform: translate(1.2%, .8%) rotate(1deg) skewX(-1deg); }
  100% { transform: translate(2%, 1.5%) rotate(1.6deg) skewX(.5deg); }
}
@media (prefers-reduced-motion: reduce) { .leaf { animation: none; } }
</style>
