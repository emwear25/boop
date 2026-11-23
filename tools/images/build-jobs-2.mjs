// Second batch: personalised (name) products. Writes tools/images/jobs-2.json.
// Products seen only in other shops' screenshots are described in text (no image refs),
// so boop gets its own design and photography rather than a copy.
import { writeFile } from 'node:fs/promises'

const STYLE = 'Premium editorial product photography, photorealistic, natural light, sharp focus, no logos, no watermark. Any lettering must be spelled exactly as given, in Cyrillic capitals.'
const SET = 'standing on a light oak table against a warm sunlit terracotta wall with soft dappled leaf shadows'
const HOME = 'on a light oak floor in a bright, calm, modern European apartment, soft warm window light with gentle leaf shadows on a warm beige wall, shallow depth of field'
const MAT = 'matte 3D-printed surface with fine horizontal layer lines, removable polished stainless steel bowl insert'

const jobs = [
  // From the user's own photos (refs)
  { out: 'name-ribbed-1', refs: ['name-ribbed.jpg'], prompt: `Image 1 shows a product: a low round pet bowl with vertical ribs around the side and a smooth oval panel with the debossed name. Recreate the EXACT same bowl in sage green with the name "ЛУНА" debossed on the panel, ${MAT}, filled with kibble, ${SET}. ${STYLE}` },
  { out: 'name-ribbed-2', refs: ['name-ribbed.jpg'], prompt: `Image 1 shows a product: a low round ribbed pet bowl with a smooth oval name panel. Lifestyle photo with the EXACT same bowl in cream with the name "РЕКС" debossed on the panel, ${MAT}; a ginger tabby cat is eating from it, ${HOME}. ${STYLE}` },
  { out: 'name-ribbed-3', refs: ['name-ribbed.jpg'], prompt: `Image 1 shows a product: a low round ribbed pet bowl with a smooth oval name panel. Show three of the EXACT same bowls in a relaxed row: sage green with "ЛУНА", cream with "МИЛА", graphite grey with "РЕКС", each name debossed on its panel, ${MAT}, ${SET}. ${STYLE}` },

  { out: 'name-wave-1', refs: ['name-wave.jpg'], prompt: `Image 1 shows a product: a two-tone pet bowl, light top half meeting a darker ribbed bottom half along a soft wave line, with a name in raised letters on the top half. Recreate the EXACT same design in cream over sage green with the name "МАКС" in raised letters, ${MAT}, filled with kibble, ${SET}. ${STYLE}` },
  { out: 'name-wave-2', refs: ['name-wave.jpg'], prompt: `Image 1 shows a product: a two-tone pet bowl with a wave line and a raised name. Lifestyle photo with the EXACT same design in cream over blush pink with the name "ЛУНА" in raised letters, ${MAT}; a small white Maltese dog is eating from it, ${HOME}. ${STYLE}` },
  { out: 'name-wave-3', refs: ['name-wave.jpg'], prompt: `Image 1 shows a product: a two-tone pet bowl with a wave line and a raised name. Show three of the EXACT same design in a row: cream over graphite with "МАКС", cream over terracotta with "БЕЛА", cream over cocoa brown with "РИЧИ", ${MAT}, ${SET}. ${STYLE}` },

  { out: 'name-raised-1', refs: ['name-raised.jpg'], prompt: `Image 1 shows a product: a raised, tall truncated-cone pet bowl stand, cream top with debossed name and a hand slot, olive green wavy bottom. Recreate the EXACT same design in cream over olive green with the name "БРУНО" debossed, ${MAT}, filled with water, ${SET}. ${STYLE}` },
  { out: 'name-raised-2', refs: ['name-raised.jpg'], prompt: `Image 1 shows a product: a raised two-tone pet bowl stand with a debossed name. Lifestyle photo with the EXACT same design in cream over olive green with the name "ЧАРЛИ" debossed, ${MAT}; a beagle is eating from it comfortably without bending low, ${HOME}. ${STYLE}` },
  { out: 'name-raised-3', refs: ['name-raised.jpg'], prompt: `Image 1 shows a product: a raised two-tone pet bowl stand with a debossed name. Close-up three-quarter detail of the EXACT same design in cream over graphite with the name "БАЛКАН" debossed, showing the hand slot, the crisp lettering and the fine layer lines, empty polished steel insert, warm low sunlight and leaf shadows on oak. ${STYLE}` },

  // boop's own designs, described in text only
  { out: 'name-rings-1', prompt: `A raised pet bowl stand made of four soft, plump stacked rings like inflated tubes, sage green, the name "МИЛА" embossed on the second ring, ${MAT}, filled with kibble, ${SET}. ${STYLE}` },
  { out: 'name-rings-2', prompt: `Lifestyle photo: a raised pet bowl stand made of four soft stacked rounded rings in butter yellow with the name "ПУХИ" embossed on the second ring, ${MAT}; a fluffy white Samoyed puppy is eating from it, ${HOME}. ${STYLE}` },
  { out: 'name-rings-3', prompt: `Four raised pet bowl stands made of soft stacked rounded rings, in sage, butter yellow, blush pink and cream, each with a different embossed name: "МИЛА", "ПУХИ", "РОКИ", "ТАРА", arranged at slightly different depths, ${MAT}, ${SET}. ${STYLE}` },

  { out: 'name-cone-1', prompt: `A minimalist raised pet bowl stand shaped like a smooth truncated cone, wider at the base, warm clay colour, a small finger slot near the top on one side, the name "ТЕДИ" debossed in clean sans-serif capitals on the front, ${MAT}, filled with kibble, ${SET}. ${STYLE}` },
  { out: 'name-cone-2', prompt: `Lifestyle photo: a minimalist raised truncated-cone pet bowl stand in warm stone grey with the name "МАРТА" debossed in clean sans-serif capitals, ${MAT}; a Welsh corgi is eating from it, ${HOME}. ${STYLE}` },
  { out: 'name-cone-3', prompt: `Three minimalist raised truncated-cone pet bowl stands of different heights (low, medium, tall) in warm clay, stone grey and cream, with debossed names "ТЕДИ", "МАРТА", "ВИЛМА" in clean sans-serif capitals, ${MAT}, ${SET}. ${STYLE}` },

  { out: 'food-water-1', prompt: `A pair of matching minimalist raised truncated-cone pet bowl stands side by side, one sand colour with "ВОДА" debossed, one cocoa brown with "ХРАНА" debossed, clean sans-serif capitals, the left filled with water, the right with kibble, ${MAT}, ${SET}. ${STYLE}` },
  { out: 'food-water-2', prompt: `Lifestyle photo: a pair of raised truncated-cone pet bowl stands, sand with "ВОДА" and cocoa brown with "ХРАНА" debossed; a Hungarian vizsla drinks from the water one, ${HOME}. ${STYLE}` },
  { out: 'food-water-3', prompt: `Close-up detail of a cocoa-brown raised pet bowl stand with "ХРАНА" debossed in clean capitals, showing the crisp letter edges, the finger slot and fine 3D-printed layer lines, polished steel rim catching the light, warm low sunlight and leaf shadows. ${STYLE}` },

  { out: 'name-twist-1', prompt: `A sculptural raised pet bowl stand formed by one thick soft rounded tube that loops around itself in a three-lobed pretzel-like twist, terracotta clay colour, the name "РОКИ" embossed along the top loop, ${MAT}, filled with kibble, ${SET}. ${STYLE}` },
  { out: 'name-twist-2', prompt: `Lifestyle photo: a sculptural raised pet bowl stand formed by one thick soft tube twisted into a three-lobed pretzel shape, deep moss green, the name "ЛИСА" embossed on the top loop, ${MAT}; a Shiba Inu is eating from it, ${HOME}. ${STYLE}` },
  { out: 'name-twist-3', prompt: `Two sculptural raised pet bowl stands formed by a thick soft tube twisted into a three-lobed pretzel shape, one terracotta with "РОКИ", one oat beige with "ЛИСА" embossed, ${MAT}, ${SET}. ${STYLE}` },

  { out: 'name-tag-1', prompt: `Flat lay of five 3D-printed pet name tags on a light oak board with soft dappled leaf shadows: puffy rounded two-layer tags, a coloured outline layer with raised cream letters, each with a small ring hole: "БАЛКАН" in sage, "ЛУНА" in blush pink, "МАКС" in terracotta, "РИЖКО" in butter yellow, "МИЛА" in moss green. Matte texture with fine layer lines. ${STYLE}` },
  { out: 'name-tag-2', prompt: `Close-up lifestyle photo: a puffy 3D-printed two-layer name tag in sage with raised cream letters "БАЛКАН" hanging from the tan leather collar of a happy golden mixed-breed dog, ${HOME}. ${STYLE}` },
  { out: 'name-tag-3', prompt: `Macro detail of a puffy 3D-printed pet name tag in blush pink with raised cream letters "ЛУНА" and a small stainless split ring, lying on oak in warm low sunlight with leaf shadows, showing fine layer lines. ${STYLE}` },
]
await writeFile(new URL('./jobs-2.json', import.meta.url), JSON.stringify(jobs, null, 1))
console.log(jobs.length, 'jobs')
