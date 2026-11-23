// Fourth image per product: a different breed with each product.
// Also the source of the homepage "every breed" strip (BREEDS export is mirrored in app/data/breeds.ts).
import { writeFile } from 'node:fs/promises'

const STYLE = 'Premium editorial photography, photorealistic, natural light, shallow depth of field, no logos, no watermark, no added text.'
const HOME = 'in a bright, calm, modern European apartment with a light oak floor, soft warm window light and gentle leaf shadows on a warm beige wall'

// key: [breed in the prompt, scene: 'eat' | 'wall' | 'tag']
const B = {
  'heart-hug': ['a pug', 'eat'],
  'puffy': ['a grey Scottish Fold cat', 'eat'],
  'pudding': ['a fawn French bulldog', 'eat'],
  'braid': ['an adult German Shepherd dog', 'eat'],
  'dipped': ['a Yorkshire terrier', 'eat'],
  'soft-serve': ['a Siberian Husky with blue eyes', 'eat'],
  'loop': ['a large tabby Maine Coon cat', 'eat'],
  'yarn': ['a fluffy white Persian cat', 'eat'],
  'pancake': ['a golden English Cocker Spaniel', 'eat'],
  'paw-cloud': ['a white Bichon Frisé', 'eat'],
  'modern': ['a black and tan Dobermann', 'eat'],
  'knit-heart': ['two miniature dachshunds side by side, one at each bowl', 'eat'],
  'snowy-log': ['a Bernese Mountain Dog', 'eat'],
  'gingerbread': ['a Cavalier King Charles Spaniel', 'eat'],
  'chimney': ['a fluffy white Samoyed', 'eat'],
  'gift-sack': ['a long-haired Chihuahua', 'eat'],
  'wrapped-present': ['a golden retriever puppy', 'eat'],
  'name-ribbed': ['a spotted Bengal cat', 'eat'],
  'name-wave': ['a black and white Border Collie', 'eat'],
  'name-raised': ['an adult German Shepherd dog, eating comfortably with its back straight', 'eat'],
  'name-rings': ['a large fluffy black-and-white Karakachan shepherd dog (Bulgarian breed)', 'eat'],
  'name-cone': ['a young German Shepherd dog', 'eat'],
  'food-water': ['a Rottweiler drinking from the water stand', 'eat'],
  'name-twist': ['a Dalmatian', 'eat'],
  'name-tag': ['an adult German Shepherd dog', 'tag'],
  'bone-depot': ['an adult German Shepherd dog sitting below, holding its leash in its mouth, looking at the camera', 'wall'],
  'happy-camper': ['a blue merle Australian Shepherd sitting below, ready for a hike', 'wall'],
  'walk-club': ['a silver Weimaraner sitting below', 'wall'],
  'tail-trail': ['a Jack Russell terrier jumping excitedly below', 'wall'],
}

const jobs = Object.entries(B).map(([k, [breed, scene]]) => {
  const ref = [`c-${k}.jpg`]
  if (scene === 'wall') return { out: `${k}-4`, refs: ref, prompt: `Image 1 shows a product: a wall organiser for dog walks. Create a new lifestyle photo with the EXACT same organiser from image 1 (identical shape, colours, number of hooks and any lettering) mounted on a warm beige hallway wall next to the front door, a leash hanging from one hook; ${breed}. Warm afternoon light with dappled leaf shadows, oak floor. ${STYLE}` }
  if (scene === 'tag') return { out: `${k}-4`, refs: ref, prompt: `Image 1 shows a product: pet name tags cut in the outline of the name in chunky rounded bubble letters, coloured base layer and white raised letters. Create a close portrait of ${breed} wearing a tan leather collar with ONE such tag hanging from it by a small steel ring: moss green base layer, white raised letters spelling "РЕКС" in Cyrillic capitals. ${HOME}. ${STYLE}` }
  return { out: `${k}-4`, refs: ref, prompt: `Image 1 shows a product. Create a new lifestyle photo using the EXACT same product from image 1: identical shape, colours, matte 3D-printed texture, steel insert and any name lettering. It stands on the floor ${HOME}; ${breed} is eating from it. The animal is the hero of the photo, the product clearly visible. ${STYLE}` }
})
await writeFile(new URL('./jobs-5.json', import.meta.url), JSON.stringify(jobs, null, 1))
console.log(jobs.length, 'jobs')
