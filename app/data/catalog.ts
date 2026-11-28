import { tagDesigns, tagBySlug, type TagDesignId } from './tagDesigns'

// Local catalogue for the visual build. Shaped so it can later be served by the
// shared backend as store "boop" (Product.storefront) without changing components.

export type CategoryId = 'kupichki-za-kucheta-i-kotki' | 'kupichki-s-ime' | 'medalyoni-s-ime' | 'lazhichki-za-granuli' | 'zakachalki-za-povod' | 'koledni-kupichki'

export interface Category {
  id: CategoryId
  name: string
  title: string
  intro: string
}

export interface SizeOption {
  /** Size id: bowl insert in cm (13/16/20) or scoop volume in ml (120/240/480). */
  cm: number
  /** Shown instead of "<cm> см" when set. */
  label?: string
  fits: string
  price: number
}

export interface Product {
  slug: string
  name: string
  tagline: string
  category: CategoryId
  colour: { name: string; hex: string }
  description: string
  badge?: 'Ново' | 'Коледа' | 'С име' | 'Многоцветен'
  /** Medallion design shown by the live preview. */
  tagDesign?: TagDesignId
  /** Bowls come in three steel-insert sizes; wall organisers have one price. */
  sizes?: SizeOption[]
  price?: number
  /** Optional name printed on the product (e.g. the Кокалче plaque, engraved bowls). */
  personalise?: { label: string; max: number; placeholder: string; required?: boolean; hint?: string }
  /** Colour choices; the photos show the first one. */
  colours?: { name: string; hex: string; hex2?: string; /** Photo of this colour (replaces the first photo). */ img?: string }[]
  /** Mounting guide image for wall organisers. */
  mount?: string
  details: string[]
}

export const categories: Category[] = [
  { id: 'kupichki-za-kucheta-i-kotki', name: 'Купички', title: 'Купички за всеки ден', intro: 'Меки форми и иноксова купа, която се вади и мие в съдомиялна.' },
  { id: 'kupichki-s-ime', name: 'С име', title: 'С името на любимеца', intro: 'Купички, повдигнати стойки и медальони с гравирано име. Пишем го на кирилица или латиница.' },
  { id: 'medalyoni-s-ime', name: 'Медальони', title: 'Медальони с име', intro: 'Десет форми, много цветове и името на любимеца. В един или няколко цвята.' },
  { id: 'lazhichki-za-granuli', name: 'Лъжички', title: 'Лъжички за гранули с име', intro: 'Мерителна лъжичка с името на любимеца. Около една чаша гранули, винаги една и съща порция.' },
  { id: 'zakachalki-za-povod', name: 'За разходка', title: 'Закачалки за разходка', intro: 'Повод, нагръдник и торбички на едно място до вратата.' },
  { id: 'koledni-kupichki', name: 'Коледа', title: 'Коледна колекция', intro: 'Празнични купички и играчки за елхата с името на любимеца.' },
]

// Bowl prices: list price minus 10%, rounded to 10 cents (e.g. 24,90 -> 22,40)
const off = (n: number) => Math.round(n * 0.9 * 10) / 10
const sizes = (a: number, b: number, c: number): SizeOption[] => [
  { cm: 13, fits: 'Котки и малки кученца', price: off(a) },
  { cm: 16, fits: 'Малки и средни породи', price: off(b) },
  { cm: 20, fits: 'Средни и големи породи', price: off(c) },
]
// Kibble scoops: the common retail sizes, ½, 1 and 2 cups (a cup is about 240 ml)
// List price minus 30%, rounded to 10 cents
const scoopOff = (n: number) => Math.round(n * 0.7 * 10) / 10
const scoopSizes = (a: number, b: number, c: number): SizeOption[] => [
  { cm: 120, label: '½ чаша · 120 мл', fits: 'Котки и малки кучета', price: scoopOff(a) },
  { cm: 240, label: '1 чаша · 240 мл', fits: 'Малки и средни породи', price: scoopOff(b) },
  { cm: 480, label: '2 чаши · 480 мл', fits: 'Големи породи', price: scoopOff(c) },
]
// Scoop colours: two-tone like the bowls they go with, or one colour for the shaped handles
const M = '#efe6d6'
const twoTone = (first: [string, string]) => [first, ['графит', '#45484a'], ['салвия', '#8c9e7a'], ['розово', '#e8b9b4'], ['какао', '#6e4630'], ['теракота', '#c4704f']]
  .filter((c, i, all) => all.findIndex(x => x[0] === c[0]) === i).slice(0, 5)
  .map(([n, h]) => ({ name: `Мляко и ${n}`, hex: M, hex2: h }))
const solid = (list: [string, string][]) => list.map(([name, hex]) => ({ name, hex }))
const everyday = sizes(24.9, 29.9, 34.9)
const special = sizes(29.9, 34.9, 39.9)
const holiday = sizes(27.9, 32.9, 37.9)

const nameField = (max: number, placeholder: string) => ({ label: 'Име за гравиране', max, placeholder, required: true, hint: `До ${max} букви, на кирилица или латиница. Провери правописа: изработваме точно каквото напишеш.` })

const ORN_PRICE = 8.9 // final price; ornaments are kept out of the discount rounds below
const ornName = { label: 'Име на любимеца', max: 7, placeholder: 'напр. Ричи', required: true, hint: 'До 7 букви, на кирилица или латиница. Изработваме точно каквото напишеш.' }
const ornDetails = ['Около 8 см, с панделка за закачане', 'Името е релефно, в цвета на рамката', 'Изработена в България', 'Красив подарък за стопаните на куче или котка']

const bowlDetails = [
  'Иноксова купа, която се вади и мие в съдомиялна',
  'Неплъзгаща се основа',
  'Изработена в България',
  'Обвивката се избърсва с влажна кърпа',
]
const nameDetails = [
  'Името е гравирано в самата купичка, не е стикер',
  'Иноксова купа, която се вади и мие в съдомиялна',
  'Изработена в България',
  'Персонализираните продукти не подлежат на връщане',
]
const scoopDetails = [
  'Три размера: ½ чаша (120 мл), 1 чаша (240 мл) и 2 чаши (480 мл)',
  'Една чаша е мярката от таблицата на повечето торби с храна',
  'Изработена в България',
  'Мие се на ръка с топла вода, не в съдомиялна',
  'Персонализираните продукти не подлежат на връщане',
]
const raisedDetails = [
  'Иноксова купа, която се вади и мие в съдомиялна',
  'Повдигната височина, по-удобна за врата и гърба',
  'Неплъзгаща се основа',
  'Персонализираните продукти не подлежат на връщане',
]
const wallDetails = [
  'Монтира се на скрита планка с два винта',
  'Диспенсър за стандартна ролка торбички',
  'Изработена в България',
  'Винтовете и дюбелите не са включени',
]

export const products: Product[] = [
  { slug: 'kupichka-za-kuche-pregradka', name: 'Прегръдка', tagline: 'Малко обич при всяко хранене.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Мляко', hex: '#efe6d6' }, badge: 'Ново', sizes: everyday,
    description: 'Две меки ръчички прегръщат купата и държат червено сърце отпред. За любимеца, който заслужава прегръдка три пъти на ден.', details: bowlDetails },
  { slug: 'kupichka-za-kuche-puhche', name: 'Пухче', tagline: 'По-меко място за всяка купа.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Корал', hex: '#cf7a58' }, sizes: everyday,
    description: 'Заоблена като тиквичка, с меки гънки по стените. Ниска и стабилна, удобна и за котки с къси муцунки.', details: bowlDetails },
  { slug: 'kupichka-za-kuche-puding', name: 'Пудинг', tagline: 'Малко сладост в часа за храна.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Крем и карамел', hex: '#e9dcc4' }, sizes: special,
    description: 'Набраздена основа и карамелен ръб, който „се стича“ по стените. Изглежда като десерт, а е най-практичната купичка у дома.', details: bowlDetails },
  { slug: 'kupichka-za-kuche-plitka', name: 'Плитка', tagline: 'Изплетена за всеки ден.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Салвия', hex: '#8c9e7a' }, badge: 'Ново', sizes: everyday,
    description: 'Дебела плитка обикаля купата като въже. Тежка основа, която не се плъзга, и цвят, който стои спокойно в кухнята.', details: bowlDetails },
  { slug: 'kupichka-za-kuche-glazura', name: 'Глазура', tagline: 'По-сладко място за всяко хранене.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Крем и шоколад', hex: '#6e4630' }, sizes: everyday,
    description: 'Кремава основа и шоколадов ръб, потопен като глазура. Широкият ръб пази пода от разпиляни гранули.', details: bowlDetails },
  { slug: 'kupichka-za-kuche-sladoled', name: 'Сладолед', tagline: 'Меки извивки, всеки ден.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Мляко', hex: '#efe6d6' }, sizes: everyday,
    description: 'Три меки пръстена, наредени един върху друг. Най-простата форма в колекцията и най-трудната за неглижиране.', details: bowlDetails },
  { slug: 'kupichka-za-kuche-vazel', name: 'Възел', tagline: 'Едно извиване. По-хубаво хранене.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Бордо', hex: '#7a1f2b' }, sizes: special,
    description: 'Мека лента се завива около купата и се връзва на възел отпред. Тъмно бордо, което не показва следи от лапи.', details: bowlDetails },
  { slug: 'kupichka-za-kuche-kalbo', name: 'Кълбо', tagline: 'Увита в ежедневен уют.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Салвия', hex: '#8c9e7a' }, sizes: everyday,
    description: 'Като кълбо прежда, навито около купата. Котките го харесват, преди да разберат, че е за храна.', details: bowlDetails },
  { slug: 'kupichka-za-kuche-palachinki', name: 'Палачинки', tagline: 'Закуската изглежда по-добре тук.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Мед', hex: '#e7b884' }, sizes: special,
    description: 'Три палачинки, сироп, който се стича, и малко парче масло отгоре. Широка и ниска, удобна за вода.', details: bowlDetails },
  { slug: 'kupichka-za-kuche-oblache', name: 'Облаче', tagline: 'Меки извивки. Щастливи лапи.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Мляко', hex: '#efe6d6' }, sizes: everyday,
    description: 'Ниска купичка с форма на облаче и вдлъбната дръжка отстрани, за да я вдигаш с една ръка.', details: bowlDetails },
  { slug: 'kupichka-za-kuche-moderna', name: 'Модерна', tagline: 'Просто място за всяко хранене.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Мента', hex: '#c6d3b4' }, sizes: everyday,
    description: 'Заоблен квадрат без украса и вдлъбната дръжка отстрани. За дом, в който всичко има място.', details: bowlDetails },
  { slug: 'dvoyna-kupichka-za-kuche-pleteno-sartse', name: 'Плетено сърце', tagline: 'Две купички. Едно малко сърце.', category: 'kupichki-za-kucheta-i-kotki', colour: { name: 'Мляко и розово', hex: '#efc7c8' }, badge: 'Ново', sizes: sizes(44.9, 52.9, 59.9),
    description: 'Две купички с плетена текстура, свързани със сърце, разделено на две половинки. За храна и вода, или за двама приятели.', details: ['Две иноксови купи, които се вадят и мият в съдомиялна', ...bowlDetails.slice(1)] },

  // Personalised: name engraved on the product
  { slug: 'kupichka-s-ime-raie', name: 'Райе с име', tagline: 'Името му, всеки ден на пода.', category: 'kupichki-s-ime', colour: { name: 'Салвия', hex: '#8c9e7a' }, badge: 'С име', sizes: sizes(22.9, 26.9, 30.9),
    colours: [{ name: 'Салвия', hex: '#8c9e7a' }, { name: 'Мляко', hex: '#efe6d6' }, { name: 'Графит', hex: '#45484a' }, { name: 'Розово', hex: '#e8b9b4' }],
    personalise: nameField(8, 'напр. Луна'),
    description: 'Ниска купичка с релефни ребра и гладка табелка отпред, на която гравираме името на любимеца.', details: nameDetails },
  { slug: 'kupichka-s-ime-valna', name: 'Вълна с име', tagline: 'Два цвята и едно име.', category: 'kupichki-s-ime', colour: { name: 'Мляко и салвия', hex: '#efe6d6', }, badge: 'С име', sizes: sizes(24.9, 28.9, 32.9),
    colours: [{ name: 'Мляко и салвия', hex: '#efe6d6', hex2: '#8c9e7a' }, { name: 'Мляко и графит', hex: '#efe6d6', hex2: '#45484a' }, { name: 'Мляко и розово', hex: '#efe6d6', hex2: '#e8b9b4' }, { name: 'Мляко и теракота', hex: '#efe6d6', hex2: '#c4704f' }, { name: 'Мляко и какао', hex: '#efe6d6', hex2: '#6e4630' }],
    personalise: nameField(8, 'напр. Макс'),
    description: 'Светла горна част, която се среща с по-тъмна набраздена основа по мека вълна. Името е изпъкнало, отпред.', details: nameDetails },
  { slug: 'povdignata-kupichka-s-ime-visoka-valna', name: 'Висока вълна', tagline: 'Храна на удобна височина.', category: 'kupichki-s-ime', colour: { name: 'Мляко и маслина', hex: '#efe6d6' }, badge: 'С име', sizes: sizes(29.9, 34.9, 39.9),
    colours: [{ name: 'Мляко и маслина', hex: '#efe6d6', hex2: '#6f7f4f' }, { name: 'Мляко и графит', hex: '#efe6d6', hex2: '#45484a' }, { name: 'Мляко и какао', hex: '#efe6d6', hex2: '#6e4630' }, { name: 'Мляко и розово', hex: '#efe6d6', hex2: '#e8b9b4' }],
    personalise: nameField(8, 'напр. Бруно'),
    description: 'Повдигната стойка с форма на пресечен конус и вдлъбната дръжка. Кучето яде без да се навежда ниско, което пази врата и гърба.', details: raisedDetails },
  { slug: 'povdignata-kupichka-s-ime-lapa', name: 'Лапа', tagline: 'Лапичка, име и правилна височина.', category: 'kupichki-s-ime', colour: { name: 'Мляко и графит', hex: '#efe6d6' }, badge: 'Ново', sizes: sizes(22.9, 27.9, 32.9),
    colours: [{ name: 'Мляко и графит', hex: '#efe6d6', hex2: '#45484a' }, { name: 'Пясък и какао', hex: '#d9b892', hex2: '#6e4630' }, { name: 'Мляко и салвия', hex: '#efe6d6', hex2: '#8c9e7a' }, { name: 'Мляко и мента', hex: '#efe6d6', hex2: '#9fd3c0' }, { name: 'Пясък и праскова', hex: '#d9b892', hex2: '#f0a58c' }],
    personalise: nameField(8, 'напр. Ричи'),
    description: 'Повдигната стойка с гладка горна част, малка лапичка и името отпред, и набраздена основа под мека вълна. Иноксовата купа се вдига с два пръста.', details: raisedDetails },
  { slug: 'povdignata-kupichka-s-ime-prasteni', name: 'Пръстени с име', tagline: 'Четири меки пръстена, едно име.', category: 'kupichki-s-ime', colour: { name: 'Салвия', hex: '#8c9e7a' }, badge: 'Ново', sizes: sizes(27.9, 32.9, 37.9),
    colours: [{ name: 'Салвия', hex: '#8c9e7a' }, { name: 'Масло', hex: '#f1d98f' }, { name: 'Розово', hex: '#e8b9b4' }, { name: 'Мляко', hex: '#efe6d6' }, { name: 'Мъх', hex: '#3e5236' }],
    personalise: nameField(8, 'напр. Мила'),
    description: 'Повдигната стойка от четири заоблени пръстена, наредени един върху друг. Името е изпъкнало на втория пръстен.', details: raisedDetails },
  { slug: 'povdignata-kupichka-s-ime-konus', name: 'Конус с име', tagline: 'Чиста форма, правилна височина.', category: 'kupichki-s-ime', colour: { name: 'Глина', hex: '#c08a68' }, badge: 'С име', sizes: sizes(27.9, 32.9, 37.9),
    colours: [{ name: 'Глина', hex: '#c08a68' }, { name: 'Камък', hex: '#8b8a83' }, { name: 'Мляко', hex: '#efe6d6' }, { name: 'Какао', hex: '#6e4630' }],
    personalise: nameField(8, 'напр. Теди'),
    description: 'Минималистична повдигната стойка с вдлъбнато име и прорез за пръстите. Подхожда на всеки интериор.', details: raisedDetails },
  { slug: 'dve-kupichki-s-ime-hrana-i-voda', name: 'Храна и вода', tagline: 'Две стойки, които си приличат.', category: 'kupichki-s-ime', colour: { name: 'Пясък и какао', hex: '#d9b892' }, badge: 'С име', sizes: sizes(49.9, 59.9, 69.9),
    colours: [{ name: 'Пясък и какао', hex: '#d9b892', hex2: '#6e4630' }, { name: 'Мляко и камък', hex: '#efe6d6', hex2: '#8b8a83' }, { name: 'Салвия и мъх', hex: '#8c9e7a', hex2: '#3e5236' }],
    personalise: { label: 'Име на любимеца (по желание)', max: 8, placeholder: 'напр. Клайн', hint: 'По подразбиране пишем „ХРАНА“ и „ВОДА“. Ако добавиш име, то стои над тях.' },
    description: 'Комплект от две повдигнати стойки: едната за храна, другата за вода. Цената е за двете.', details: ['Две иноксови купи, които се вадят и мият в съдомиялна', ...raisedDetails.slice(1)] },
  { slug: 'kupichka-s-ime-gevrek', name: 'Геврек с име', tagline: 'Една извивка, вързана на три.', category: 'kupichki-s-ime', colour: { name: 'Теракота', hex: '#c4704f' }, badge: 'Ново', sizes: sizes(32.9, 37.9, 42.9),
    colours: [{ name: 'Теракота', hex: '#c4704f' }, { name: 'Овес', hex: '#d8ccb4' }, { name: 'Мъх', hex: '#3e5236' }, { name: 'Графит', hex: '#45484a' }],
    personalise: nameField(8, 'напр. Роки'),
    description: 'Скулптурна стойка от една мека тръба, завита в три извивки като геврек. Името е изпъкнало по горната извивка.', details: raisedDetails },
  { slug: 'koledna-kupichka-snezhen-pan', name: 'Снежен пън', tagline: 'Малко зимна топлина за тях.', category: 'koledni-kupichki', colour: { name: 'Кора и сняг', hex: '#8a5a3c' }, badge: 'Коледа', sizes: holiday,
    description: 'Пън с релефна кора, затрупан със сняг, и дървена табелка със сърце. Най-уютната купичка в зимната колекция.', details: bowlDetails },
  { slug: 'koledna-kupichka-medenka', name: 'Меденка', tagline: 'Малък дом за празнична вечеря.', category: 'koledni-kupichki', colour: { name: 'Меденка', hex: '#c08158' }, badge: 'Коледа', sizes: special,
    description: 'Къщичка от меденки с глазура, врата, две прозорчета и сърце над входа.', details: bowlDetails },
  { slug: 'koledna-kupichka-komin', name: 'Комин', tagline: 'Уютен ъгъл за празничните вечери.', category: 'koledni-kupichki', colour: { name: 'Тухла', hex: '#b5513f' }, badge: 'Коледа', sizes: holiday,
    description: 'Тухлен комин със сняг отгоре и празна табелка отпред. Дядо Коледа ще знае къде да остави гранулите.', details: bowlDetails },
  { slug: 'koledna-kupichka-torbata-na-dyado-koleda', name: 'Торбата на Дядо Коледа', tagline: 'Малък подарък за всяко хранене.', category: 'koledni-kupichki', colour: { name: 'Коледно червено', hex: '#c7383b' }, badge: 'Коледа', sizes: holiday,
    description: 'Червена торба, вързана с кремав шнур и малко етикетче. Подаръкът, който се пълни всеки ден.', details: bowlDetails },
  { slug: 'koledna-kupichka-podarak', name: 'Подарък', tagline: 'Всяко хранене заслужава панделка.', category: 'koledni-kupichki', colour: { name: 'Ела', hex: '#3e6146' }, badge: 'Коледа', sizes: holiday,
    description: 'Квадратна кутия в тъмнозелено с кремава панделка. Стои под елхата, докато някой не огладнее.', details: bowlDetails },
  { slug: 'koledna-igrachka-s-ime-podarache', name: 'Подаръче', tagline: 'Неговото име на елхата.', category: 'koledni-kupichki', colour: { name: 'Синьо и крем', hex: '#3C718E' }, badge: 'С име', price: ORN_PRICE,
    personalise: ornName, description: 'Синя кутийка с кремава панделка и лапичка. Името стои на табелката отдолу.', details: ornDetails },
  { slug: 'koledna-igrachka-s-ime-rakavichka', name: 'Ръкавичка', tagline: 'Топла лапичка за елхата.', category: 'koledni-kupichki', colour: { name: 'Червено и крем', hex: '#B5303A' }, badge: 'С име', price: ORN_PRICE,
    personalise: ornName, description: 'Плетена червена ръкавичка с кремава лапичка. Името стои на маншета.', details: ornDetails },
  { slug: 'koledna-igrachka-s-ime-snezhna-topka', name: 'Снежна топка', tagline: 'Малка зима с лапичка вътре.', category: 'koledni-kupichki', colour: { name: 'Синьо и крем', hex: '#3C718E' }, badge: 'С име', price: ORN_PRICE,
    personalise: ornName, description: 'Снежна топка със снежинки и лапичка. Името стои на основата.', details: ornDetails },
  { slug: 'koledna-igrachka-s-ime-sartse-s-kaishka', name: 'Сърце с каишка', tagline: 'Всяка разходка води към дома.', category: 'koledni-kupichki', colour: { name: 'Червено и крем', hex: '#B5303A' }, badge: 'С име', price: ORN_PRICE,
    personalise: ornName, description: 'Червено сърце от каишка с катарама. Името стои на кокалчето отдолу.', details: ornDetails },
  { slug: 'koledna-igrachka-s-ime-biskvitka', name: 'Бисквитка', tagline: 'Награда за най-доброто куче.', category: 'koledni-kupichki', colour: { name: 'Меденка и крем', hex: '#B8743E' }, badge: 'С име', price: ORN_PRICE,
    personalise: ornName, description: 'Бисквитка кокалче с глазура и панделка. Името стои на кремавата лента.', details: ornDetails },
  { slug: 'koledna-igrachka-s-ime-puloverche', name: 'Пуловерче', tagline: 'Най-уютното място на елхата.', category: 'koledni-kupichki', colour: { name: 'Крем и червено', hex: '#F0E6CF' }, badge: 'С име', price: ORN_PRICE,
    personalise: ornName, description: 'Плетен пуловер с червено сърце. Името стои отдолу на пуловера.', details: ornDetails },

  { slug: 'zakachalka-za-povod-s-ime-kokalche', name: 'Кокалче', tagline: 'Малък дом за нещата за разходка.', category: 'zakachalki-za-povod', colour: { name: 'Пясък', hex: '#e3c18f' }, badge: 'С име', price: 39.9,
    personalise: { label: 'Име на табелката', max: 10, placeholder: 'напр. Балкан', hint: 'Остави празно за табелка без надпис.' },
    mount: 'bone-depot',
    description: 'Табло с форма на кокал, три куки за повод и нагръдник, диспенсър за торбички и табелка с името на любимеца.', details: wallDetails },
  { slug: 'zakachalka-za-povod-kam-planinata', name: 'Към планината', tagline: 'Направена за следващото приключение.', category: 'zakachalki-za-povod', colour: { name: 'Салвия', hex: '#8c9e7a' }, price: 36.9, mount: 'happy-camper',
    description: 'Релефна планина и пътека, две куки и диспенсър за торбички. За кучета, които предпочитат хижата пред парка.', details: wallDetails },
  { slug: 'zakachalka-za-povod-klub-razhodka', name: 'Клуб „Разходка“', tagline: 'Всичко готово. Всяка разходка.', category: 'zakachalki-za-povod', colour: { name: 'Мляко и теракота', hex: '#efe6d6' }, price: 36.9, mount: 'walk-club',
    description: 'Три куки, квадратен диспенсър за торбички и надпис Walk Club в теракота.', details: wallDetails },
  { slug: 'zakachalka-za-povod-opashchitsi', name: 'Опашчици', tagline: 'Хубавите разходки започват тук.', category: 'zakachalki-za-povod', colour: { name: 'Салвия и мляко', hex: '#a9b79a' }, badge: 'Ново', price: 34.9,
    description: 'Две кученца с вдигнати опашки, на които закачаш повода. Диспенсърът за торбички е до тях.', details: wallDetails },
  // Kibble scoops: one price, name required
  { slug: 'lazhichka-za-granuli-s-ime-plitka', name: 'Лъжичка Плитка', tagline: 'Хранене с усукана дръжка.', category: 'lazhichki-za-granuli', colour: { name: 'Мляко и теракота', hex: '#efe6d6' }, badge: 'Ново', sizes: scoopSizes(24.9, 29.9, 36.9),
    colours: twoTone(['теракота', '#b5513f']),
    personalise: nameField(8, 'напр. Чарли'),
    description: 'Кремава лъжичка с плътна дръжка, усукана в теракота и мляко. Името е на гладката лента отгоре и се хваща удобно с цяла ръка.', details: scoopDetails },
  { slug: 'lazhichka-za-granuli-s-ime-lapa', name: 'Лъжичка Лапа', tagline: 'В комплект с купичката Лапа.', category: 'lazhichki-za-granuli', colour: { name: 'Мляко и графит', hex: '#efe6d6' }, badge: 'Ново', sizes: scoopSizes(19.9, 24.9, 31.9),
    colours: [{ name: 'Мляко и графит', hex: '#efe6d6', hex2: '#45484a' }, { name: 'Пясък и какао', hex: '#d9b892', hex2: '#6e4630' }, { name: 'Мляко и салвия', hex: '#efe6d6', hex2: '#8c9e7a' }, { name: 'Мляко и мента', hex: '#efe6d6', hex2: '#9fd3c0' }, { name: 'Пясък и праскова', hex: '#d9b892', hex2: '#f0a58c' }],
    personalise: nameField(8, 'напр. Ричи'),
    description: 'Същата мека вълна и набраздена основа като купичката Лапа, с малка лапичка и името на дръжката. Двете стоят чудесно една до друга.', details: scoopDetails },
  { slug: 'lazhichka-za-granuli-s-ime-valna', name: 'Лъжичка Вълна', tagline: 'Два цвята и едно име.', category: 'lazhichki-za-granuli', colour: { name: 'Мляко и салвия', hex: '#efe6d6' }, badge: 'С име', sizes: scoopSizes(17.9, 22.9, 28.9),
    colours: twoTone(['салвия', '#8c9e7a']),
    personalise: nameField(8, 'напр. Макс'),
    description: 'Кремава горна част, салвиена набраздена основа и права дръжка с името. Пасва на купичката Вълна с име.', details: scoopDetails },
  { slug: 'lazhichka-za-granuli-s-ime-kokalche', name: 'Лъжичка Кокалче', tagline: 'Дръжка с форма на кокал.', category: 'lazhichki-za-granuli', colour: { name: 'Пясък', hex: '#d9b892' }, badge: 'С име', sizes: scoopSizes(17.9, 22.9, 28.9),
    colours: solid([['Пясък', '#d9b892'], ['Салвия', '#8c9e7a'], ['Теракота', '#c4704f'], ['Мляко', '#efe6d6'], ['Графит', '#45484a']]),
    personalise: nameField(8, 'напр. Роки'),
    description: 'Лъжичка в цвят пясък, чиято дръжка завършва с кокалче. Името е релефно по дължината ѝ.', details: scoopDetails },
  { slug: 'lazhichka-za-granuli-s-ime-lapichka', name: 'Лъжичка Лапичка', tagline: 'Отпечатък от лапа накрая.', category: 'lazhichki-za-granuli', colour: { name: 'Теракота', hex: '#c4704f' }, badge: 'С име', sizes: scoopSizes(17.9, 22.9, 28.9),
    colours: solid([['Теракота', '#c4704f'], ['Пясък', '#d9b892'], ['Салвия', '#8c9e7a'], ['Розово', '#e8b9b4'], ['Графит', '#45484a']]),
    personalise: nameField(8, 'напр. Бони'),
    description: 'Лъжичка в теракота с отпечатък от лапа в края на дръжката и името над него.', details: scoopDetails },
]

// Medallions: one product per design (see tagDesigns.ts)
const tagDetails = (multi: boolean) => [
  multi ? 'Няколко цвята, вградени в самия медальон, не боя' : 'Цветна основа и бели изпъкнали букви',
  'Стоманена халка в комплекта',
  'Изработен в България от PETG, лек и здрав',
  'Около 4 до 6 см според формата и името',
]
for (const d of tagDesigns) {
  products.push({
    slug: d.slug, name: `Медальон ${d.name}`, tagline: d.tagline, category: 'medalyoni-s-ime', tagDesign: d.id,
    colour: { name: d.colourways[0]!.name, hex: d.colourways[0]!.c.a }, badge: d.badge ?? 'С име', price: d.price,
    colours: d.colourways.map(c => ({ name: c.name, hex: c.letters ? c.letters[0]! : c.c.a, hex2: c.letters ? c.letters[3] : c.c.b })),
    personalise: nameField(8, `напр. ${d.demo}`),
    description: d.description, details: tagDetails(d.kind === 'rainbow' || (d.layers.length > 1)),
  })
}

// Extra 10% off every price (Nov 25 2026), rounded to 10 cents. The backend holds the
// authoritative prices: after changing this run tools/products/publish.mjs --update --apply.
const EXTRA_OFF = 0.9
const extra = (n: number) => Math.round(n * EXTRA_OFF * 10) / 10
for (const p of products) {
  if (p.category === 'medalyoni-s-ime' || p.slug.startsWith('koledna-igrachka')) continue // fixed prices elsewhere
  if (p.price != null) p.price = extra(p.price)
  if (p.sizes) p.sizes = p.sizes.map(s => ({ ...s, price: extra(s.price) }))
}

// Second round (2026-11-25): bowls −10%, scoops −15%, walk −15%, on top of the round above
const SECOND_OFF: Record<string, number> = {
  'kupichki-za-kucheta-i-kotki': 0.9, 'kupichki-s-ime': 0.9, 'koledni-kupichki': 0.9,
  'lazhichki-za-granuli': 0.85, 'zakachalki-za-povod': 0.85,
}
for (const p of products) {
  const f = SECOND_OFF[p.category]
  if (!f || p.slug.startsWith('koledna-igrachka')) continue
  const cut = (n: number) => Math.round(n * f * 10) / 10
  if (p.price != null) p.price = cut(p.price)
  if (p.sizes) p.sizes = p.sizes.map(s => ({ ...s, price: cut(s.price) }))
}

// Scoops: every colour has its own main photo (scoop-<key>-c<i>.jpg, same shot recoloured)
for (const p of products) {
  const key = p.slug.startsWith('lazhichka-za-granuli-s-ime-') ? p.slug.slice('lazhichka-za-granuli-s-ime-'.length) : null
  if (key && p.colours) p.colours = p.colours.map((c, i) => (i ? { ...c, img: `scoop-${key}-c${i}` } : c))
}

// Bowls with their own main photo per colour (<photos>-c<i>, same shot recoloured; colour 0 uses <photos>-1)
const colourPhotos: Record<string, string> = {
  'kupichka-s-ime-raie': 'name-ribbed', 'kupichka-s-ime-valna': 'name-wave', 'povdignata-kupichka-s-ime-visoka-valna': 'name-raised',
  'povdignata-kupichka-s-ime-lapa': 'lapa', 'povdignata-kupichka-s-ime-prasteni': 'name-rings', 'povdignata-kupichka-s-ime-konus': 'name-cone',
  'dve-kupichki-s-ime-hrana-i-voda': 'food-water', 'kupichka-s-ime-gevrek': 'name-twist',
}
for (const p of products) {
  const key = colourPhotos[p.slug]
  if (key && p.colours) p.colours = p.colours.map((c, i) => (i ? { ...c, img: `${key}-c${i}` } : c))
}

/** Image folder slug on disk (generated assets are named after the source designs). */
const imageKey: Record<string, string> = {
  'kupichka-za-kuche-pregradka': 'heart-hug', 'kupichka-za-kuche-puhche': 'puffy', 'kupichka-za-kuche-puding': 'pudding', 'kupichka-za-kuche-plitka': 'braid', 'kupichka-za-kuche-glazura': 'dipped', 'kupichka-za-kuche-sladoled': 'soft-serve',
  'kupichka-za-kuche-vazel': 'loop', 'kupichka-za-kuche-kalbo': 'yarn', 'kupichka-za-kuche-palachinki': 'pancake', 'kupichka-za-kuche-oblache': 'paw-cloud', 'kupichka-za-kuche-moderna': 'modern', 'dvoyna-kupichka-za-kuche-pleteno-sartse': 'knit-heart',
  'koledna-kupichka-snezhen-pan': 'snowy-log', 'koledna-kupichka-medenka': 'gingerbread', 'koledna-kupichka-komin': 'chimney', 'koledna-kupichka-torbata-na-dyado-koleda': 'gift-sack', 'koledna-kupichka-podarak': 'wrapped-present',
  'koledna-igrachka-s-ime-podarache': 'orn-present', 'koledna-igrachka-s-ime-rakavichka': 'orn-mitten', 'koledna-igrachka-s-ime-snezhna-topka': 'orn-globe',
  'koledna-igrachka-s-ime-sartse-s-kaishka': 'orn-heart', 'koledna-igrachka-s-ime-biskvitka': 'orn-biscuit', 'koledna-igrachka-s-ime-puloverche': 'orn-sweater',
  'povdignata-kupichka-s-ime-lapa': 'lapa', 'kupichka-s-ime-raie': 'name-ribbed', 'kupichka-s-ime-valna': 'name-wave', 'povdignata-kupichka-s-ime-visoka-valna': 'name-raised', 'povdignata-kupichka-s-ime-prasteni': 'name-rings',
  'povdignata-kupichka-s-ime-konus': 'name-cone', 'dve-kupichki-s-ime-hrana-i-voda': 'food-water', 'kupichka-s-ime-gevrek': 'name-twist',
  'lazhichka-za-granuli-s-ime-plitka': 'scoop-plitka', 'lazhichka-za-granuli-s-ime-lapa': 'scoop-lapa', 'lazhichka-za-granuli-s-ime-valna': 'scoop-valna',
  'lazhichka-za-granuli-s-ime-kokalche': 'scoop-kokalche', 'lazhichka-za-granuli-s-ime-lapichka': 'scoop-lapichka',
  'zakachalka-za-povod-s-ime-kokalche': 'bone-depot', 'zakachalka-za-povod-kam-planinata': 'happy-camper', 'zakachalka-za-povod-klub-razhodka': 'walk-club', 'zakachalka-za-povod-opashchitsi': 'tail-trail',
}

export const productImages = (p: Product, colourIndex = 0) => {
  const k = imageKey[p.slug] ?? tagBySlug(p.slug)?.photos
  const list = [1, 2, 3, 4].map(n => ({ src: `/img/p/${k}-${n}.webp`, sm: `/img/p/${k}-${n}-sm.webp` }))
  const own = p.colours?.[colourIndex]?.img
  if (own) list[0] = { src: `/img/p/${own}.webp`, sm: `/img/p/${own}-sm.webp` }
  return list
}
/** Index of a colour by name (cart lines store the name). */
export const colourIndex = (p: Product, name?: string) => Math.max(0, p.colours?.findIndex(c => c.name === name) ?? 0)

/** Size as shown to people: "16 см" for bowls, "1 чаша · 240 мл" for scoops. */
export const sizeLabel = (p: Product, cm?: number) => (cm ? p.sizes?.find(s => s.cm === cm)?.label ?? `${cm} см` : '')
/** Default size: the middle one. */
export const defaultSize = (p: Product) => p.sizes?.[1]?.cm ?? p.sizes?.[0]?.cm ?? 16
export const fromPrice = (p: Product) => p.price ?? Math.min(...(p.sizes ?? []).map(s => s.price))
export const findProduct = (slug: string) => products.find(p => p.slug === slug)
export const categoryOf = (id: CategoryId) => categories.find(c => c.id === id)!
