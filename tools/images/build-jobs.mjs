// Builds tools/images/jobs.json: 3 images per product + homepage scenes.
import { writeFile } from 'node:fs/promises'

const STYLE = 'Premium editorial photography, photorealistic, natural light, sharp focus, no text, no logos, no watermark.'
const BOWL = 'removable stainless steel insert'

// slug: [description of the exact product, pet for the lifestyle shot, extra scene note]
const P = {
  'heart-hug': ['a round cream pet bowl with two soft sculpted arms hugging a glossy red heart at the front, ' + BOWL, 'a small white Maltese dog eating from it', ''],
  'puffy': ['a puffy coral-terracotta pet bowl with soft pumpkin-like lobes, ' + BOWL, 'a ginger tabby cat eating from it', ''],
  'pudding': ['a cream scalloped pudding-shaped pet bowl with a caramel-coloured dripping top rim, ' + BOWL, 'a happy beagle eating from it', ''],
  'snowy-log': ['a pet bowl shaped like a brown tree-bark log with a thick white snow-drip rim and a small light wooden plaque with a red heart, ' + BOWL, 'a fluffy border collie puppy eating from it', 'A softly blurred Christmas tree with warm lights in the background.'],
  'braid': ['a sage-green pet bowl wrapped in a thick braided rope shape, ' + BOWL, 'a grey tabby cat eating from it', ''],
  'gift-sack': ["a red pet bowl shaped like Santa's gift sack, tied with a cream twisted rope and a small blank cream gift tag, " + BOWL, 'a Jack Russell terrier eating from it', 'Subtle Christmas decorations, warm fairy-light bokeh.'],
  'dipped': ['a pet bowl with a cream base and a chocolate-brown top that drips down the sides like a dipped dessert, ' + BOWL, 'a black-and-white tuxedo cat eating from it', ''],
  'yarn': ['a sage-green pet bowl shaped like a ball of yarn with thick wound strands, ' + BOWL, 'a British shorthair kitten eating from it', ''],
  'wrapped-present': ['a square forest-green pet bowl shaped like a wrapped present with a cream ribbon and bow, ' + BOWL, 'a French bulldog eating from it', 'Subtle Christmas decorations, warm fairy-light bokeh.'],
  'chimney': ['a square pet bowl shaped like a red brick chimney with a white snow top dripping over the edges and a blank cream nameplate, ' + BOWL, 'a Welsh corgi eating from it', 'Subtle Christmas decorations, warm fairy-light bokeh.'],
  'gingerbread': ['a round pet bowl shaped like a gingerbread house with cream icing trim, an arched brown door, two small windows and a red heart, ' + BOWL, 'a dachshund eating from it', 'Subtle Christmas decorations, warm fairy-light bokeh.'],
  'knit-heart': ['two joined round pet bowls with cable-knit sweater texture, one cream and one soft pink, connected by a red heart split in two halves, each with a ' + BOWL, 'two cats, one cream and one ginger, eating side by side from them', ''],
  'modern': ['a minimal pastel sage-green rounded-square pet bowl with a recessed handle slot on the side, ' + BOWL, 'a Siamese cat eating from it', ''],
  'paw-cloud': ['a low cream pet bowl with a soft scalloped cloud or flower outline and a recessed handle slot, ' + BOWL, 'a fluffy Pomeranian eating from it', ''],
  'soft-serve': ['a cream pet bowl made of three soft stacked rounded rings like soft-serve, ' + BOWL, 'a Shiba Inu eating from it', ''],
  'loop': ['a deep burgundy pet bowl formed by a soft twisted loop that wraps around itself, ' + BOWL, 'a Hungarian vizsla eating from it', ''],
  'pancake': ['a pet bowl shaped like a stack of three honey-coloured pancakes with syrup drips and a small cream butter pat on top, ' + BOWL, 'a curly cavapoo puppy eating from it', ''],
}
const W = {
  'bone-depot': ['a bone-shaped wall organiser in warm sand colour with exactly three cream hooks, a cream name plaque reading MILO and a round sand-coloured poop-bag dispenser with a green bag roll', 'a golden retriever sitting below looking up expectantly', 'A tan leather leash hangs from one hook.'],
  'happy-camper': ["a sage-green elongated-octagon wall organiser with a raised cream mountain outline, a winding path, the words LET'S GO, exactly two sage hooks and a round sage poop-bag dispenser with a green roll", 'a fluffy cream mixed-breed dog sitting below, ready for a hike', 'A green leash and a small hiking backpack hang from the hooks.'],
  'walk-club': ['a cream rounded-rectangle wall organiser with raised terracotta letters WALK CLUB, exactly three cream hooks and a square cream poop-bag dispenser with a green roll', 'a black Labrador sitting below wagging its tail', 'A beige woven leash hangs from one hook.'],
  'tail-trail': ['a sage-green pill-shaped wall organiser with exactly two cream hooks shaped like walking dogs with curled-up tails and a square sage poop-bag dispenser with a green roll', 'a small brown mixed-breed terrier sitting below', 'A red leash hangs from one dog-shaped hook.'],
}

const jobs = []
for (const [slug, [desc, pet, extra]] of Object.entries(P)) {
  jobs.push({ out: `${slug}-1`, refs: [`${slug}.jpg`], prompt: `Edit this photo: remove ALL text and lettering from the wall so the wall is clean. Keep the product exactly identical: ${desc}. Same shape, colours, fine matte 3D-printed layer-line texture and kibble. Keep the warm sunlit wall with soft dappled leaf shadows and the oak table. ${STYLE}` })
  jobs.push({ out: `${slug}-2`, refs: [`${slug}.jpg`], prompt: `Image 1 shows a product: ${desc}. Create a new lifestyle photograph using the EXACT same product from image 1 (identical shape, colours, details and matte 3D-printed texture). It stands on a light oak floor in a bright, calm, modern European apartment; ${pet}. ${extra} Soft warm window light with gentle leaf shadows on a warm beige wall, shallow depth of field. ${STYLE}` })
  jobs.push({ out: `${slug}-3`, refs: [`${slug}.jpg`], prompt: `Image 1 shows a product: ${desc}. Create a close-up detail photograph of the EXACT same product from image 1, seen from slightly above at three-quarter angle, filling most of the frame, empty steel insert without food so the polished steel reflects light. Emphasise the fine matte 3D-printed layer-line texture and soft rounded edges. Warm low sunlight with dappled leaf shadows on an oak table, shallow depth of field. ${STYLE}` })
}
for (const [slug, [desc, pet, extra]] of Object.entries(W)) {
  jobs.push({ out: `${slug}-1`, refs: [`${slug}.jpg`], prompt: `Edit this photo: remove ALL text from the wall above the product (keep any lettering that is part of the product itself). Keep the product exactly identical: ${desc}. Keep the warm sunlit terracotta wall with soft dappled leaf shadows. ${STYLE}` })
  jobs.push({ out: `${slug}-2`, refs: [`${slug}.jpg`], prompt: `Image 1 shows a product: ${desc}. Create a new lifestyle photograph with the EXACT same organiser from image 1 (identical shape, colours, number of hooks and lettering) mounted on a warm beige hallway wall next to a front door. ${extra} On the oak floor below: ${pet}. Soft warm afternoon light with dappled leaf shadows. ${STYLE}` })
  jobs.push({ out: `${slug}-3`, refs: [`parts-${slug}.jpg`], prompt: `Edit this photo: remove ALL text, labels and captions so only the product parts remain on the wooden surface. Keep every part exactly identical in shape, colour and position. Keep the warm oak surface and soft leaf shadows. ${STYLE}` })
}
// Homepage scenes (landscape)
jobs.push({ out: 'scene-lineup', size: '2560x1440', refs: ['braid.jpg', 'heart-hug.jpg', 'pudding.jpg', 'puffy.jpg'], prompt: 'Create one wide photograph showing the four EXACT pet bowls from images 1-4 (sage braided bowl, cream bowl with red heart, cream scalloped pudding bowl with caramel drips, coral puffy bowl) standing in a relaxed row on a long oak table against a warm sunlit terracotta wall with soft dappled leaf shadows. Plenty of empty wall space on the left third for a headline. ' + STYLE })
jobs.push({ out: 'scene-holiday', size: '2560x1440', refs: ['snowy-log.jpg', 'gingerbread.jpg', 'chimney.jpg', 'gift-sack.jpg'], prompt: 'Create one wide festive photograph showing the four EXACT pet bowls from images 1-4 (snowy tree-log bowl, gingerbread house bowl, red brick chimney bowl with snow top, red Santa gift sack bowl) arranged on an oak table, a few pine branches and warm fairy lights softly blurred behind, warm cosy evening light. Empty space on the left third for a headline. ' + STYLE })
jobs.push({ out: 'scene-making', size: '2560x1440', prompt: 'A clean modern 3D printer in a bright small Bulgarian design studio printing a sage-green rounded pet bowl, the nozzle mid-layer, visible fine layer lines, a finished cream bowl and a spool of sage filament beside it, warm late-afternoon sunlight with leaf shadows on a pale wall. ' + STYLE })

await writeFile(new URL('./jobs.json', import.meta.url), JSON.stringify(jobs, null, 1))
console.log(jobs.length, 'jobs')
