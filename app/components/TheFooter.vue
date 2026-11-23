<template>
  <footer class="foot wrap">
    <div class="brand">
      <img src="/logo.png" alt="boop" width="96" height="54">
      <p>Купички, медальони и закачалки за кучета и котки, направени с любов в България.</p>
      <SocialLinks class="foot-social" />
    </div>
    <div>
      <h2>Магазин</h2>
      <ul>
        <li><NuxtLink :to="'/category/kupichki-za-kucheta-i-kotki'">Купички</NuxtLink></li>
        <li><NuxtLink :to="'/category/kupichki-s-ime'">С име</NuxtLink></li>
        <li><NuxtLink :to="'/category/zakachalki-za-povod'">Закачалки за разходка</NuxtLink></li>
        <li><NuxtLink :to="'/category/koledni-kupichki'">Коледна колекция</NuxtLink></li>
      </ul>
    </div>
    <div>
      <h2>Помощ</h2>
      <ul>
        <li><NuxtLink to="/about#delivery">Доставка и плащане</NuxtLink></li>
        <li><NuxtLink to="/about#sizes">Кой размер да избера</NuxtLink></li>
        <li><NuxtLink to="/about#care">Грижа за купичката</NuxtLink></li>
        <li><NuxtLink to="/terms">Общи условия</NuxtLink></li>
        <li><NuxtLink to="/privacy">Поверителност</NuxtLink></li>
      </ul>
    </div>
    <div>
      <h2>boop.bg</h2>
      <ul>
        <li><NuxtLink to="/about">За нас</NuxtLink></li>
        <li><a href="https://www.instagram.com/boop_bg/" target="_blank" rel="noopener">Instagram</a></li>
        <li><a href="https://www.facebook.com/profile.php?id=61596606881457" target="_blank" rel="noopener">Facebook</a></li>
        <li><a href="mailto:info@boop.bg">info@boop.bg</a></li>
      </ul>
    </div>
    <p class="legal">© {{ new Date().getFullYear() }} boop.bg. Всички цени са в евро и включват ДДС.</p>
  </footer>
</template>

<style scoped>
.foot { border-top: 1px solid var(--line); margin-top: clamp(64px, 9vw, 120px); padding-block: 56px 36px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 32px; font-size: 15px; }
.brand img { width: 96px; height: auto; }
.brand p { color: var(--moss-2); max-width: 24em; margin-top: 16px; }
.foot-social { margin-top: 18px; }
h2 { font: 500 15px var(--sans); margin-bottom: 12px; }
li { list-style: none; color: var(--moss-2); padding: 4px 0; }
li a:hover { color: var(--moss); text-decoration: underline; text-underline-offset: 4px; }
.legal { grid-column: 1 / -1; font-size: 13px; color: var(--moss-3); padding-top: 24px; border-top: 1px solid var(--line); }
@media (max-width: 760px) { .foot { grid-template-columns: 1fr 1fr; } .brand { grid-column: 1 / -1; } }
</style>
