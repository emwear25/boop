// Medallion collection: 4 photos per design (flat lay, dog, cat, detail). Text-only prompts.
import { writeFile } from 'node:fs/promises'

const STYLE = 'Premium editorial product photography, photorealistic, natural light. Multi-colour 3D print (multi-material), matte surfaces with fine layer lines, crisp colour borders. Names spelled exactly in Cyrillic capitals on ONE single line, chunky rounded letters. No other text, no logos.'
const OAK = 'on a light oak board with warm low sunlight and soft dappled leaf shadows'
const HOME = 'bright calm modern apartment, warm window light with leaf shadows, shallow depth of field'

// key: [tag description (fn of colourway text), flat lay trio, dog shot, cat shot, detail]
const D = {
  'tag-dyga': {
    desc: n => `a puffy bubble-letter name tag cut in the outline of the name "${n}": a thick cream base outline following the letters, and every raised letter printed in a different pastel colour (pink, butter yellow, mint, sky blue, lavender, peach), small steel ring at the left`,
    flat: ['ЛУНА', 'БАЛКАН', 'ПУХИ'], dog: ['a happy golden retriever', 'СЛЪНЧО'], cat: ['a calico cat', 'ПИПА'], detail: 'РОКИ',
  },
  'tag-bone': {
    desc: (n, c = 'sage green with a cream rim') => `a dog-bone shaped name tag, two colours: ${c}, chunky white raised letters "${n}" in the middle, a small hole with a steel ring in the left knob`,
    flat: [['БАЛКАН', 'sage green with a cream rim'], ['РЕКС', 'terracotta with a butter-yellow rim'], ['ШАРО', 'sky blue with a navy rim']],
    dog: ['a tricolour beagle', 'БАЛКАН', 'sage green with a cream rim'], cat: ['a ginger tabby cat', 'РИЖКО', 'terracotta with a butter-yellow rim'], detail: ['ШАРО', 'sky blue with a navy rim'],
  },
  'tag-paw': {
    desc: (n, c = 'moss green base with blush pink beans') => `a paw-print shaped name tag, two colours: ${c} (four round toe beans and a big pad raised in the second colour), chunky white raised letters "${n}" on the big pad, a small hole with a steel ring in one toe`,
    flat: [['ЛУНА', 'moss green base with blush pink beans'], ['МАКС', 'butter yellow base with terracotta beans'], ['ТАРА', 'lavender base with cream beans']],
    dog: ['a small Shih Tzu', 'ЛУНА', 'moss green base with blush pink beans'], cat: ['a grey British Shorthair cat', 'ТАРА', 'lavender base with cream beans'], detail: ['МАКС', 'butter yellow base with terracotta beans'],
  },
  'tag-heart': {
    desc: (n, c = 'cherry red heart inside a blush pink rim') => `a puffy heart-shaped name tag, two colours: ${c}, chunky white raised letters "${n}" in the middle, a small hole with a steel ring at the top of the left lobe`,
    flat: [['МИЛА', 'cherry red heart inside a blush pink rim'], ['БЕЛА', 'blush pink heart inside a burgundy rim'], ['ПУХИ', 'lavender heart inside a cream rim']],
    dog: ['a yellow Labrador puppy', 'МИЛА', 'cherry red heart inside a blush pink rim'], cat: ['a white cat with green eyes', 'БЕЛА', 'blush pink heart inside a burgundy rim'], detail: ['ПУХИ', 'lavender heart inside a cream rim'],
  },
  'tag-cloud': {
    desc: (n, c = 'a white cloud with a pink, butter-yellow and sky-blue rainbow arcing behind its top') => `a cloud-shaped name tag in several colours: ${c}, chunky sky-blue raised letters "${n}" on the cloud, a small hole with a steel ring at the left`,
    flat: [['РОКИ', 'a white cloud with a pink, butter-yellow and sky-blue rainbow arcing behind its top'], ['ЧАРЛИ', 'a pale blue cloud with a coral, yellow and mint rainbow arcing behind its top'], ['РИЖКО', 'a cream cloud with a lavender, pink and peach rainbow arcing behind its top']],
    dog: ['an apricot toy poodle', 'РОКИ'], cat: ['a black-and-white tuxedo cat', 'ЧАРЛИ', 'a pale blue cloud with a coral, yellow and mint rainbow arcing behind its top'], detail: ['РИЖКО', 'a cream cloud with a lavender, pink and peach rainbow arcing behind its top'],
  },
  'tag-cat': {
    desc: (n, c = 'lavender head with blush pink inner ears and a small pink nose') => `a cat-head shaped name tag with two pointed ears, several colours: ${c}, chunky white raised letters "${n}" across the face, a small hole with a steel ring in the left ear`,
    flat: [['МУРКА', 'lavender head with blush pink inner ears and a small pink nose'], ['ПИСИ', 'terracotta head with cream inner ears and a cream nose'], ['ТОМИ', 'graphite head with butter-yellow inner ears and a yellow nose']],
    dog: ['a fawn French bulldog puppy, looking funny wearing a cat tag', 'ТОМИ', 'graphite head with butter-yellow inner ears and a yellow nose'], cat: ['a brown tabby cat', 'МУРКА'], detail: ['ПИСИ', 'terracotta head with cream inner ears and a cream nose'],
  },
  'tag-fish': {
    desc: (n, c = 'sky blue body with coral stripes, a coral tail fin and a round white eye') => `a fish-shaped name tag in several colours: ${c}, chunky white raised letters "${n}" along the body, a small hole with a steel ring in the tail`,
    flat: [['ПИСИ', 'sky blue body with coral stripes, a coral tail fin and a round white eye'], ['МУРО', 'butter yellow body with teal stripes, a teal tail fin and a round white eye'], ['ЛИЛИ', 'blush pink body with lavender stripes, a lavender tail fin and a round white eye']],
    dog: ['a Welsh Corgi', 'МУРО', 'butter yellow body with teal stripes, a teal tail fin and a round white eye'], cat: ['a Siamese cat with blue eyes', 'ПИСИ'], detail: ['ЛИЛИ', 'blush pink body with lavender stripes, a lavender tail fin and a round white eye'],
  },
  'tag-mushroom': {
    desc: (n, c = 'a red cap with white dots on a cream stem') => `a mushroom-shaped name tag in several colours: ${c}, chunky white raised letters "${n}" across the cap, a small hole with a steel ring at the top left of the cap`,
    flat: [['БОНИ', 'a red cap with white dots on a cream stem'], ['ЛИЛИ', 'a blush pink cap with white dots on a cream stem'], ['ГОШО', 'a sage green cap with cream dots on a butter-yellow stem']],
    dog: ['a Bernese Mountain Dog puppy', 'БОНИ'], cat: ['a grey cat with yellow eyes', 'ЛИЛИ', 'a blush pink cap with white dots on a cream stem'], detail: ['ГОШО', 'a sage green cap with cream dots on a butter-yellow stem'],
  },
  'tag-berry': {
    desc: (n, c = 'a red strawberry with tiny yellow seeds and a green leafy top') => `a strawberry-shaped name tag in several colours: ${c}, chunky white raised letters "${n}" across the middle, a small hole with a steel ring through the leaves`,
    flat: [['БЕРИ', 'a red strawberry with tiny yellow seeds and a green leafy top'], ['ЯГОДКА', 'a pink strawberry with tiny white seeds and a green leafy top'], ['МАЛИНА', 'a deep raspberry-red berry with tiny cream seeds and a moss green leafy top']],
    dog: ['a fluffy Pomeranian', 'БЕРИ'], cat: ['a ginger kitten', 'ЯГОДКА', 'a pink strawberry with tiny white seeds and a green leafy top'], detail: ['МАЛИНА', 'a deep raspberry-red berry with tiny cream seeds and a moss green leafy top'],
  },
}

const arr = x => (Array.isArray(x) ? x : [x])
const jobs = []
for (const [k, d] of Object.entries(D)) {
  const flat = d.flat.map(f => d.desc(...arr(f))).join('; ')
  jobs.push({ out: `${k}-1`, prompt: `Flat lay ${OAK} of three 3D-printed pet name tags with small steel split rings: ${flat}. ${STYLE}` })
  const [dog, dn, dc] = d.dog
  jobs.push({ out: `${k}-2`, prompt: `Close lifestyle portrait of ${dog} wearing a tan leather collar with ONE 3D-printed name tag hanging from it by a small steel ring: ${d.desc(dn, dc)}. The tag is clearly visible and in focus, ${HOME}. ${STYLE}` })
  const [cat, cn, cc] = d.cat
  jobs.push({ out: `${k}-3`, prompt: `Close lifestyle portrait of ${cat} wearing a soft fabric collar with ONE 3D-printed name tag hanging from it by a small steel ring: ${d.desc(cn, cc)}. The tag is clearly visible and in focus, ${HOME}. ${STYLE}` })
  jobs.push({ out: `${k}-4`, prompt: `Macro detail at a low angle of ONE 3D-printed pet name tag: ${d.desc(...arr(d.detail))}, lying ${OAK}, showing the separate colour layers, the raised letters and fine layer lines. ${STYLE}` })
}
// Balonche gets a cat photo
jobs.push({ out: 'name-tag-3', prompt: `Close lifestyle portrait of a black cat with amber eyes wearing a soft fabric collar with ONE 3D-printed name tag cut in the outline of the name "МИЛА" in chunky rounded bubble letters, lavender base layer with white raised letters, hanging from a small steel ring, ${HOME}. ${STYLE}` })

await writeFile(new URL('./jobs-8.json', import.meta.url), JSON.stringify(jobs, null, 1))
console.log(jobs.length, 'jobs')
