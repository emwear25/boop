// boop name-tag (medallion) designs. Each design is a separate product.
// Shapes are plain SVG geometry in a 400 x 280 box, split into colour layers, so the same
// data can later be extruded into multi-colour STL/3MF files: layer 0 is the printed base,
// later layers are raised colour regions, letters are the top layer.

export type TagDesignId = 'balonche' | 'dyga' | 'kokalche' | 'lapichka' | 'surce' | 'oblache' | 'kotence' | 'ribka' | 'gabka' | 'yagoda'
/** Colour slots used by layers: a = base, b/c/d = accents, t = letters. */
export type Slot = 'a' | 'b' | 'c' | 'd' | 't'

export interface Layer {
  slot: Slot
  circles?: [number, number, number][]
  rects?: [number, number, number, number, number][]
  paths?: string[]
  /** Draw paths as thick lines instead of fills (rainbow arcs, whiskers). */
  line?: number
  /** Extra outline that merges pieces into one printable part. */
  merge?: number
}

export interface Colourway { name: string; c: Partial<Record<Slot, string>> & { a: string }; letters?: string[] }

export interface TagDesign {
  id: TagDesignId
  slug: string
  name: string
  tagline: string
  description: string
  price: number
  badge?: 'Ново' | 'Многоцветен'
  kind: 'bubble' | 'rainbow' | 'shape'
  layers: Layer[]
  hole: [number, number, number]
  /** Text box: centre x, centre y, max width, max font size. */
  text: [number, number, number, number]
  colourways: Colourway[]
  /** Image key for the 4 product photos (<key>-1..4). */
  photos: string
  demo: string
}

/** Medallion price (already includes the extra 10% off of Nov 2026); catalog.ts does not discount it again. */
export const TAG_PRICE = 4.1

const W = '#fffdf8'
const single = (pairs: [string, string][]): Colourway[] => pairs.map(([name, a]) => ({ name, c: { a, t: W } }))

export const tagDesigns: TagDesign[] = [
  {
    id: 'balonche', slug: 'medalyon-s-ime-balonche', name: 'Балонче', kind: 'bubble', price: TAG_PRICE, photos: 'name-tag', demo: 'Балкан',
    tagline: 'Изрязан по самото име.', description: 'Медальон във формата на самото име: дебели заоблени букви в цвят по избор, бели изпъкнали букви отгоре и халка за нашийника.',
    layers: [], hole: [0, 0, 0], text: [0, 0, 0, 0],
    colourways: single([['Салвия', '#7f9a72'], ['Розово', '#e7a3b4'], ['Теракота', '#c4603f'], ['Масло', '#ecc85a'], ['Лавандула', '#a993d6'], ['Мъх', '#4c6a3e'], ['Небе', '#7fb3d9'], ['Бордо', '#8a2a35']]),
  },
  {
    id: 'dyga', slug: 'medalyon-s-ime-daga', name: 'Дъга', kind: 'rainbow', price: TAG_PRICE, badge: 'Многоцветен', photos: 'tag-dyga', demo: 'Луна',
    tagline: 'Всяка буква в свой цвят.', description: 'Името е изрязано като балонче с кремав кант, а всяка буква е в различен пастелен цвят. Най-веселият медальон в колекцията.',
    layers: [], hole: [0, 0, 0], text: [0, 0, 0, 0],
    colourways: [
      { name: 'Пастел', c: { a: '#f6efe2' }, letters: ['#ee9fb5', '#ecc85a', '#8fd1b5', '#7fb3d9', '#a993d6', '#f2a47e'] },
      { name: 'Сочно', c: { a: '#fffdf8' }, letters: ['#e2483f', '#f29a2e', '#f2c73a', '#4cab6a', '#3f8fd2', '#8a5bd1'] },
      { name: 'Горско', c: { a: '#efe6d6' }, letters: ['#4c6a3e', '#c4603f', '#8c9e7a', '#a8662f', '#6b7c5a', '#d18b5c'] },
    ],
  },
  {
    id: 'kokalche', slug: 'medalyon-s-ime-kokalche', name: 'Кокалче', kind: 'shape', price: TAG_PRICE, photos: 'tag-bone', demo: 'Балкан',
    tagline: 'Класиката, в два цвята.', description: 'Кокалче с контрастен кант по ръба и бели изпъкнали букви. Изработено в два цвята, така че кантът е част от медальона, а не боя.',
    layers: [
      { slot: 'b', circles: [[78, 92, 56], [78, 188, 56], [322, 92, 56], [322, 188, 56], [200, 64, 26]], rects: [[74, 80, 252, 120, 26]], merge: 10 },
      { slot: 'a', circles: [[78, 92, 44], [78, 188, 44], [322, 92, 44], [322, 188, 44]], rects: [[80, 92, 240, 96, 20]] },
    ],
    hole: [200, 58, 12], text: [200, 146, 224, 70],
    colourways: [
      { name: 'Салвия и крем', c: { a: '#7f9a72', b: '#efe4cc', t: W } },
      { name: 'Теракота и масло', c: { a: '#c4603f', b: '#ecc85a', t: W } },
      { name: 'Небе и нощ', c: { a: '#7fb3d9', b: '#2f4566', t: W } },
      { name: 'Розово и бордо', c: { a: '#e7a3b4', b: '#8a2a35', t: W } },
    ],
  },
  {
    id: 'lapichka', slug: 'medalyon-s-ime-lapichka', name: 'Лапичка', kind: 'shape', price: TAG_PRICE, photos: 'tag-paw', demo: 'Луна',
    tagline: 'С розови възглавнички.', description: 'Лапа с четири пръстчета и голяма възглавничка, в контрастен цвят върху основата. Името е върху възглавничката.',
    layers: [
      { slot: 'a', circles: [[88, 96, 46], [158, 52, 48], [242, 52, 48], [312, 96, 46], [200, 38, 28]], paths: ['M200 108 C 306 108 358 170 348 218 C 338 268 272 268 200 256 C 128 268 62 268 52 218 C 42 170 94 108 200 108 Z'], merge: 16 },
      { slot: 'b', circles: [[88, 96, 32], [158, 52, 34], [242, 52, 34], [312, 96, 32]], paths: ['M200 128 C 292 128 334 178 326 214 C 318 250 266 250 200 240 C 134 250 82 250 74 214 C 66 178 108 128 200 128 Z'] },
    ],
    hole: [200, 30, 11], text: [200, 196, 236, 62],
    colourways: [
      { name: 'Мъх и розово', c: { a: '#4c6a3e', b: '#ee9fb5', t: W } },
      { name: 'Масло и теракота', c: { a: '#ecc85a', b: '#c4603f', t: W } },
      { name: 'Лавандула и крем', c: { a: '#a993d6', b: '#f3ead8', t: '#6d58a8' } },
      { name: 'Графит и праскова', c: { a: '#45484a', b: '#f2a47e', t: W } },
    ],
  },
  {
    id: 'surce', slug: 'medalyon-s-ime-sartse', name: 'Сърце', kind: 'shape', price: TAG_PRICE, photos: 'tag-heart', demo: 'Мила',
    tagline: 'Сърце в сърце.', description: 'Пухкаво сърце с кант в друг цвят. Двата цвята са изработени заедно, а белите букви стоят отгоре.',
    layers: [
      { slot: 'b', circles: [[200, 46, 26]], paths: ['M200 268 C 146 230 36 174 36 96 C 36 40 82 10 130 10 C 166 10 188 30 200 54 C 212 30 234 10 270 10 C 318 10 364 40 364 96 C 364 174 254 230 200 268 Z'], merge: 4 },
      { slot: 'a', paths: ['M200 246 C 156 214 60 166 60 100 C 60 56 94 32 132 32 C 162 32 186 50 200 76 C 214 50 238 32 268 32 C 306 32 340 56 340 100 C 340 166 244 214 200 246 Z'] },
    ],
    hole: [200, 42, 12], text: [200, 140, 210, 60],
    colourways: [
      { name: 'Череша и розово', c: { a: '#c8323a', b: '#f3b6c2', t: W } },
      { name: 'Розово и бордо', c: { a: '#ee9fb5', b: '#8a2a35', t: W } },
      { name: 'Лавандула и крем', c: { a: '#a993d6', b: '#f3ead8', t: W } },
      { name: 'Мента и салвия', c: { a: '#8fd1b5', b: '#4c6a3e', t: W } },
    ],
  },
  {
    id: 'oblache', slug: 'medalyon-s-ime-oblache', name: 'Облаче', kind: 'shape', price: TAG_PRICE, badge: 'Многоцветен', photos: 'tag-cloud', demo: 'Роки',
    tagline: 'С дъга зад него.', description: 'Пухкаво облаче, зад което надниква дъга в три цвята. Буквите са в цвета на небето.',
    layers: [
      { slot: 'b', paths: ['M44 206 A 156 156 0 0 1 356 206'], line: 28 },
      { slot: 'c', paths: ['M72 206 A 128 128 0 0 1 328 206'], line: 28 },
      { slot: 'd', paths: ['M100 206 A 100 100 0 0 1 300 206'], line: 28 },
      { slot: 'a', circles: [[114, 196, 54], [178, 168, 58], [248, 166, 54], [300, 198, 50], [200, 218, 54]], rects: [[66, 192, 282, 74, 37]], merge: 8 },
    ],
    hole: [200, 50, 11], text: [206, 214, 230, 56],
    colourways: [
      { name: 'Бяло и дъга', c: { a: '#fbf8f2', b: '#ee9fb5', c: '#ecc85a', d: '#7fb3d9', t: '#5b8fc2' } },
      { name: 'Синьо и сочно', c: { a: '#cfe4f5', b: '#f07a62', c: '#f2c73a', d: '#8fd1b5', t: '#2f5d8a' } },
      { name: 'Крем и залез', c: { a: '#f6ecd9', b: '#a993d6', c: '#ee9fb5', d: '#f2a47e', t: '#8a5bd1' } },
    ],
  },
  {
    id: 'kotence', slug: 'medalyon-s-ime-kotentse', name: 'Котенце', kind: 'shape', price: TAG_PRICE, badge: 'Многоцветен', photos: 'tag-cat', demo: 'Мурка',
    tagline: 'С розови ушички и носле.', description: 'Котешка главичка с вътрешни ушички и носле в контрастен цвят. Направено за котките, но и кучетата не се оплакват.',
    layers: [
      { slot: 'a', circles: [[200, 168, 108]], paths: ['M104 140 L 98 34 Q 98 20 112 26 L 196 74 Z', 'M296 140 L 302 34 Q 302 20 288 26 L 204 74 Z'], merge: 14 },
      { slot: 'b', paths: ['M118 112 L 116 52 L 166 82 Z', 'M282 112 L 284 52 L 234 82 Z', 'M188 226 Q 200 240 212 226 Q 200 218 188 226 Z'], merge: 8 },
    ],
    hole: [200, 96, 11], text: [200, 176, 186, 58],
    colourways: [
      { name: 'Лавандула и розово', c: { a: '#a993d6', b: '#f3b6c2', t: W } },
      { name: 'Теракота и крем', c: { a: '#c4603f', b: '#f3ead8', t: W } },
      { name: 'Графит и масло', c: { a: '#45484a', b: '#ecc85a', t: W } },
      { name: 'Крем и праскова', c: { a: '#f3ead8', b: '#f2a47e', t: '#c4603f' } },
    ],
  },
  {
    id: 'ribka', slug: 'medalyon-s-ime-ribka', name: 'Рибка', kind: 'shape', price: TAG_PRICE, badge: 'Многоцветен', photos: 'tag-fish', demo: 'Писи',
    tagline: 'Любимото на всяка котка.', description: 'Рибка с ивици, опашка и перка в контрастен цвят и око отпред. Името е по тялото.',
    layers: [
      { slot: 'a', paths: ['M30 140 C 60 60 200 40 300 120 L 372 64 Q 388 56 386 76 L 380 140 L 386 204 Q 388 224 372 216 L 300 160 C 200 240 60 220 30 140 Z'], merge: 10 },
      { slot: 'b', paths: ['M322 128 L 366 86 L 362 140 L 366 194 L 322 152 Z', 'M170 70 Q 200 40 240 70 Q 210 76 170 70 Z'], merge: 6 },
      { slot: 'b', paths: ['M262 92 Q 280 140 262 188', 'M110 76 Q 96 140 110 204'], line: 12 },
      { slot: 'c', circles: [[74, 122, 15]] },
      { slot: 'd', circles: [[78, 122, 7]] },
    ],
    hole: [200, 94, 10], text: [186, 152, 170, 52],
    colourways: [
      { name: 'Небе и корал', c: { a: '#7fb3d9', b: '#f07a62', c: W, d: '#23301f', t: W } },
      { name: 'Масло и тюркоаз', c: { a: '#ecc85a', b: '#2fa39a', c: W, d: '#23301f', t: W } },
      { name: 'Розово и лавандула', c: { a: '#ee9fb5', b: '#8a6fc8', c: W, d: '#23301f', t: W } },
    ],
  },
  {
    id: 'gabka', slug: 'medalyon-s-ime-gabka', name: 'Гъбка', kind: 'shape', price: TAG_PRICE, badge: 'Многоцветен', photos: 'tag-mushroom', demo: 'Бони',
    tagline: 'Червена шапка, бели точки.', description: 'Горска гъбка в три цвята: шапка, точки и пънче. Името е изписано върху шапката.',
    layers: [
      { slot: 'b', rects: [[136, 140, 128, 124, 40]], merge: 6 },
      { slot: 'a', paths: ['M36 152 C 36 56 116 16 200 16 C 284 16 364 56 364 152 Q 364 172 344 172 L 56 172 Q 36 172 36 152 Z'], merge: 6 },
      { slot: 'c', circles: [[72, 124, 15], [326, 120, 17], [146, 46, 12], [258, 44, 14], [338, 76, 9]] },
    ],
    hole: [200, 46, 11], text: [204, 122, 250, 58],
    colourways: [
      { name: 'Червено и крем', c: { a: '#d8392f', b: '#f3ead8', c: W, t: W } },
      { name: 'Розово и крем', c: { a: '#ee9fb5', b: '#f3ead8', c: W, t: W } },
      { name: 'Салвия и масло', c: { a: '#7f9a72', b: '#ecc85a', c: '#f3ead8', t: W } },
    ],
  },
  {
    id: 'yagoda', slug: 'medalyon-s-ime-yagoda', name: 'Ягода', kind: 'shape', price: TAG_PRICE, badge: 'Многоцветен', photos: 'tag-berry', demo: 'Бери',
    tagline: 'Най-сладкото име вкъщи.', description: 'Ягода със семенца и зелени листенца в три цвята. Халката минава през листата.',
    layers: [
      { slot: 'a', paths: ['M200 272 C 118 244 36 172 42 110 C 48 62 98 44 140 54 C 172 38 228 38 260 54 C 302 44 352 62 358 110 C 364 172 282 244 200 272 Z'], merge: 4 },
      { slot: 'b', paths: ['M200 78 L 140 40 L 184 52 L 200 10 L 216 52 L 260 40 Z', 'M200 78 L 122 70 L 164 60 Z', 'M200 78 L 278 70 L 236 60 Z'], merge: 12 },
      { slot: 'c', paths: ['M86 120 l6 -8 l6 8 z', 'M100 196 l6 -8 l6 8 z', 'M150 236 l6 -8 l6 8 z', 'M300 120 l6 -8 l6 8 z', 'M286 196 l6 -8 l6 8 z', 'M238 236 l6 -8 l6 8 z', 'M70 160 l6 -8 l6 8 z', 'M322 160 l6 -8 l6 8 z', 'M194 252 l6 -8 l6 8 z'], merge: 3 },
    ],
    hole: [200, 40, 9], text: [200, 150, 226, 60],
    colourways: [
      { name: 'Ягода', c: { a: '#d8392f', b: '#4cab6a', c: '#f2d14c', t: W } },
      { name: 'Розова ягода', c: { a: '#ee9fb5', b: '#4cab6a', c: W, t: W } },
      { name: 'Малина', c: { a: '#a3243c', b: '#4c6a3e', c: '#f3ead8', t: W } },
    ],
  },
]

export const tagDesign = (id: string) => tagDesigns.find(d => d.id === id) ?? tagDesigns[0]!
export const tagBySlug = (slug: string) => tagDesigns.find(d => d.slug === slug)
