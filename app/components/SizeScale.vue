<script setup lang="ts">
// Three steel-insert diameters drawn to true relative scale, with who each one fits.
const model = defineModel<number>({ default: 16 })
const sizes = [
  { cm: 13, fits: 'Котки и малки кученца', eg: 'Котка, чихуахуа, йорки' },
  { cm: 16, fits: 'Малки и средни породи', eg: 'Бигъл, френски булдог, корги' },
  { cm: 20, fits: 'Средни и големи породи', eg: 'Лабрадор, ретривър, овчарка' },
]
const current = computed(() => sizes.find(s => s.cm === model.value)!)
</script>

<template>
  <div class="scale">
    <div class="rings" role="radiogroup" aria-label="Размер на купата">
      <button
        v-for="s in sizes" :key="s.cm" role="radio" :aria-checked="model === s.cm"
        class="ring" :class="{ on: model === s.cm }" :style="{ '--d': s.cm / 20 }"
        @click="model = s.cm"
      >
        <span class="steel" />
        <b>{{ s.cm }}<small> см</small></b>
      </button>
    </div>
    <div class="info" aria-live="polite">
      <div class="h3">{{ current.fits }}</div>
      <p class="muted">{{ current.eg }}</p>
    </div>
  </div>
</template>

<style scoped>
.rings { display: flex; align-items: flex-end; gap: clamp(12px, 3vw, 36px); }
.ring {
  --size: clamp(110px, 17vw, 220px);
  width: calc(var(--size) * var(--d)); aspect-ratio: 1; border-radius: 50%;
  background: var(--paper); border: 1px solid var(--line); position: relative;
  display: grid; place-items: center;
  transition: transform .5s var(--ease), background .3s, box-shadow .3s;
}
.ring:hover { transform: translateY(-4px); }
.steel {
  position: absolute; inset: 14%; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff 0, #d9dcd6 30%, #9aa19a 70%, #c7cbc4 100%);
  box-shadow: inset 0 4px 10px rgba(0,0,0,.25);
  opacity: 0; transform: scale(.7); transition: opacity .4s, transform .5s var(--ease);
}
.ring b { position: relative; font: 500 clamp(18px, 2vw, 26px) var(--sans); }
.ring small { font-size: .6em; }
.ring.on { background: var(--moss); color: var(--paper); box-shadow: var(--shadow-warm); }
.ring.on .steel { opacity: .9; transform: scale(1); }
.ring.on b { color: var(--moss); background: rgba(248,247,241,.85); padding: 2px 10px; border-radius: 999px; }
.info { margin-top: 28px; min-height: 80px; }
.info p { margin-top: 4px; }
</style>
