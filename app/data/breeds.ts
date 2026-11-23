// Homepage "every breed" strip: one photo per breed, linked to the product in it.
// Images are the 4th product photo (tools/images/build-jobs-5.mjs).
export interface BreedShot { breed: string; slug: string; img: string; size?: string }

export const breedShots: BreedShot[] = [
  { breed: 'Немска овчарка', slug: 'povdignata-kupichka-s-ime-visoka-valna', img: 'name-raised', size: '20 см' },
  { breed: 'Чихуахуа', slug: 'koledna-kupichka-torbata-na-dyado-koleda', img: 'gift-sack', size: '13 см' },
  { breed: 'Каракачанско куче', slug: 'povdignata-kupichka-s-ime-prasteni', img: 'name-rings', size: '20 см' },
  { breed: 'Мейн кун', slug: 'kupichka-za-kuche-vazel', img: 'loop', size: '16 см' },
  { breed: 'Сибирски хъски', slug: 'kupichka-za-kuche-sladoled', img: 'soft-serve', size: '20 см' },
  { breed: 'Френски булдог', slug: 'kupichka-za-kuche-puding', img: 'pudding', size: '16 см' },
  { breed: 'Немска овчарка', slug: 'povdignata-kupichka-s-ime-lapa', img: 'lapa', size: '20 см' },
  { breed: 'Немска овчарка', slug: 'medalyon-s-ime-balonche', img: 'name-tag' },
  { breed: 'Бернско планинско куче', slug: 'koledna-kupichka-snezhen-pan', img: 'snowy-log', size: '20 см' },
  { breed: 'Йоркширски териер', slug: 'kupichka-za-kuche-glazura', img: 'dipped', size: '13 см' },
  { breed: 'Доберман', slug: 'kupichka-za-kuche-moderna', img: 'modern', size: '20 см' },
  { breed: 'Шотландска клепоуха котка', slug: 'kupichka-za-kuche-puhche', img: 'puffy', size: '13 см' },
  { breed: 'Бордър коли', slug: 'kupichka-s-ime-valna', img: 'name-wave', size: '16 см' },
  { breed: 'Мопс', slug: 'kupichka-za-kuche-pregradka', img: 'heart-hug', size: '13 см' },
  { breed: 'Ротвайлер', slug: 'dve-kupichki-s-ime-hrana-i-voda', img: 'food-water', size: '20 см' },
  { breed: 'Самоед', slug: 'koledna-kupichka-komin', img: 'chimney', size: '20 см' },
  { breed: 'Два дакела', slug: 'dvoyna-kupichka-za-kuche-pleteno-sartse', img: 'knit-heart', size: '13 см' },
  { breed: 'Немска овчарка', slug: 'zakachalka-za-povod-s-ime-kokalche', img: 'bone-depot' },
  { breed: 'Персийска котка', slug: 'kupichka-za-kuche-kalbo', img: 'yarn', size: '13 см' },
  { breed: 'Далматинец', slug: 'kupichka-s-ime-gevrek', img: 'name-twist', size: '20 см' },
  { breed: 'Кокер шпаньол', slug: 'kupichka-za-kuche-palachinki', img: 'pancake', size: '16 см' },
]
