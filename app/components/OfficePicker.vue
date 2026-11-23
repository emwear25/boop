<script setup lang="ts">
import type { Courier, CourierOffice } from '~/composables/useCourier'
import { normalize, transliterate } from '~/utils/text'

/** Searchable list of Econt / Speedy offices and lockers (combobox pattern). */
const props = defineProps<{ courier: Courier; invalid?: boolean }>()
const model = defineModel<CourierOffice | null>({ required: true })

const { offices } = useCourier()
const all = ref<CourierOffice[]>([])
const loading = ref(false)
const failed = ref(false)
const query = ref('')
const open = ref(false)
const active = ref(0)
const listId = useId()

async function load() {
  loading.value = true
  failed.value = false
  try { all.value = await offices(props.courier) } catch { failed.value = true; all.value = [] } finally { loading.value = false }
}
onMounted(load)
watch(() => props.courier, () => { model.value = null; query.value = ''; load() })

const matches = computed(() => {
  const q = normalize(query.value)
  if (q.length < 2) return []
  const terms = q.split(' ').filter(Boolean)
  return all.value.filter((o) => {
    const hay = normalize(`${o.city} ${o.name} ${o.address} ${o.postCode}`)
    const lat = transliterate(hay)
    return terms.every((t) => hay.includes(t) || lat.includes(transliterate(t)))
  }).slice(0, 40)
})

function choose(o: CourierOffice) { model.value = o; query.value = ''; open.value = false }
function onKey(e: KeyboardEvent) {
  if (!matches.value.length) return
  if (e.key === 'ArrowDown') { e.preventDefault(); open.value = true; active.value = (active.value + 1) % matches.value.length }
  else if (e.key === 'ArrowUp') { e.preventDefault(); active.value = (active.value - 1 + matches.value.length) % matches.value.length }
  else if (e.key === 'Enter' && open.value) { e.preventDefault(); choose(matches.value[active.value]!) }
  else if (e.key === 'Escape') open.value = false
}
watch(query, () => { active.value = 0; open.value = true })
</script>

<template>
  <div class="op">
    <div v-if="model" class="chosen">
      <span>
        <b>{{ model.name }}</b>
        <small>{{ model.address || model.city }}<template v-if="model.locker"> · автомат</template></small>
      </span>
      <button type="button" class="change" @click="model = null">Смени</button>
    </div>
    <label v-else>
      {{ courier === 'econt' ? 'Офис или Еконтомат' : 'Офис или автомат на Спиди' }}
      <input
        id="f-office" v-model="query" type="search" role="combobox" autocomplete="off"
        placeholder="Град, квартал или име на офис"
        :aria-expanded="open && matches.length > 0" :aria-controls="listId"
        :aria-activedescendant="open && matches.length ? `${listId}-${active}` : undefined"
        :aria-invalid="invalid" @keydown="onKey" @focus="open = true"
      >
    </label>
    <template v-if="!model">
      <p v-if="loading" class="hint" role="status">Зареждаме офисите…</p>
      <p v-else-if="failed" class="hint" role="alert">Офисите не се заредиха. <button type="button" class="change" @click="load">Опитай пак</button></p>
      <p v-else-if="query.trim().length >= 2 && !matches.length" class="hint">Няма офис за „{{ query }}“.</p>
      <ul v-show="open && matches.length" :id="listId" class="list" role="listbox">
        <li v-for="(o, i) in matches" :id="`${listId}-${i}`" :key="o.id" role="option" :aria-selected="i === active" :class="{ on: i === active }" @mousedown.prevent="choose(o)">
          <b>{{ o.city }}, {{ o.name }}</b>
          <small>{{ o.address }}<template v-if="o.locker"> · автомат</template></small>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.op { position: relative; display: grid; gap: 8px; }
label { display: grid; gap: 6px; font-size: 14px; font-weight: 500; }
input { height: 52px; border: 1px solid var(--line); border-radius: 14px; background: var(--paper); padding: 0 16px; font-weight: 400; font-size: 16px; }
input:focus { outline: 2px solid var(--moss); outline-offset: 1px; }
input[aria-invalid="true"] { border-color: var(--cherry); }
.hint { font-size: 14px; color: var(--moss-3); }
.list { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 20; max-height: 320px; overflow-y: auto; list-style: none; padding: 6px; border: 1px solid var(--line); border-radius: 16px; background: var(--paper); box-shadow: 0 18px 40px rgb(35 48 31 / 16%); }
.list li { display: grid; gap: 2px; padding: 10px 12px; border-radius: 10px; cursor: pointer; }
.list li.on, .list li:hover { background: var(--mist); }
small { color: var(--moss-3); font-size: 13px; }
.chosen { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1.5px solid var(--moss); border-radius: 14px; background: var(--mist-2); }
.chosen span { display: grid; flex: 1; min-width: 0; }
.change { border: 0; background: none; padding: 0; text-decoration: underline; text-underline-offset: 3px; font-weight: 500; cursor: pointer; color: var(--moss); }
</style>
