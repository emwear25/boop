<script setup lang="ts">
useHead({ title: 'За нас' })
const size = ref(16)
</script>

<template>
  <div class="wrap page">
    <header class="top">
      <h1 class="display">Правим неща, които искаш да оставиш на пода.</h1>
      <p class="lead">boop е малко българско студио за купички и закачалки за кучета и котки. Проектираме всяка форма сами и я изработваме едва когато някой я поръча. Така няма склад, няма излишни бройки и всяка купичка е нова.</p>
    </header>

    <div class="hero-img"><img src="/img/scene-lineup.webp" alt="Купички boop в различни цветове" loading="lazy"></div>

    <section id="sizes" class="block">
      <h2 class="h2">Кой размер да избера</h2>
      <div class="cols">
        <p class="lead">Размерът е диаметърът на иноксовата купа. Обвивката е с около 5 см по-широка. Ако любимецът ти е между два размера, вземи по-големия.</p>
        <SizeScale v-model="size" />
      </div>
    </section>

    <section id="delivery" class="block">
      <h2 class="h2">Доставка и плащане</h2>
      <dl class="facts">
        <div><dt>Изработка</dt><dd>3 до 5 работни дни след поръчката</dd></div>
        <div><dt>Куриер</dt><dd>Еконт или Спиди, до офис или адрес</dd></div>
        <div><dt>Безплатна доставка</dt><dd>До офис на Еконт при поръчка над 60&nbsp;€</dd></div>
        <div><dt>Плащане</dt><dd>С карта или наложен платеж</dd></div>
        <div><dt>Връщане</dt><dd>До 14 дни за неперсонализирани продукти</dd></div>
      </dl>
    </section>

    <section id="care" class="block">
      <h2 class="h2">Грижа за купичката</h2>
      <dl class="facts">
        <div><dt>Иноксовата купа</dt><dd>Мие се в съдомиялна</dd></div>
        <div><dt>Обвивката</dt><dd>Влажна кърпа и малко препарат, вода до 50°C</dd></div>
        <div><dt>Материал</dt><dd>PLA, растителна пластмаса</dd></div>
      </dl>
    </section>

    <section class="block contact">
      <h2 class="h2">Пиши ни</h2>
      <p class="lead">Искаш друг цвят, име върху купичката или идея за нова форма? <a href="mailto:info@boop.bg">info@boop.bg</a> или ни пиши в социалните мрежи.</p>
      <SocialLinks labels class="about-social" />
    </section>
  </div>
</template>

<style scoped>
.page { padding-top: clamp(24px, 4vw, 56px); }
.top { max-width: 980px; }
.top .lead { margin-top: 24px; }
.hero-img { margin-top: 56px; border-radius: 32px; overflow: hidden; aspect-ratio: 16/8; }
.hero-img img { width: 100%; height: 100%; object-fit: cover; }
.block { padding-top: clamp(64px, 8vw, 104px); scroll-margin-top: 24px; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; margin-top: 28px; }
.facts { margin-top: 28px; border-top: 1px solid var(--line); max-width: 860px; }
.facts div { display: flex; justify-content: space-between; gap: 24px; padding: 18px 0; border-bottom: 1px solid var(--line); }
.facts dd { color: var(--moss-2); text-align: right; }
.contact .lead { margin-top: 18px; }
.contact .lead a { text-decoration: underline; text-underline-offset: 5px; }
.about-social { margin-top: 24px; }
@media (max-width: 760px) { .cols { grid-template-columns: 1fr; gap: 32px; } .hero-img { aspect-ratio: 4/3; } .facts div { flex-direction: column; gap: 2px; } .facts dd { text-align: left; } }
</style>
