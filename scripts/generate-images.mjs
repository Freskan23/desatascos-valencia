// Genera imágenes de marca para Desatascos Valencia (marca: lajenuco)
// Uso: node scripts/generate-images.mjs <slug>
// Si no pasas slug, lista los disponibles.
//
// Requiere: OPENAI_API_KEY en env.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'img');

// === BRAND SYSTEM PROMPT ===
// Esto se prepone a cada imagen para garantizar consistencia.
const BRAND = `
Editorial documentary photography. Shot on a 35mm prime lens (f/2.8),
natural Mediterranean late-afternoon sunlight raking from the left,
subtle film grain (Kodak Portra 400 look), shallow but realistic depth of field.
Warm muted color grading: dusty amber highlights (#e1a31d), deep navy shadows (#0f172a),
desaturated background tones, terracotta accents.
Setting: present-day Valencia, Spain — Mediterranean architecture, tiled floors,
exposed brick or aged plaster walls, working-class neighborhood vibe.
Composition: off-center, candid, real-world clutter visible, NOT posed for camera.
Mood: confident, calm, working hands, real professionals.

STRICTLY AVOID: stock-photo aesthetic, perfect symmetry, smooth digital airbrush skin,
fake bokeh, lens flare, HDR overprocessing, hyperreal glossy water, oversaturated colors,
logos or text in the image, generic suburban USA setting, smiling-to-camera poses,
overly clean studio look, plastic-looking surfaces, motion blur as decoration.

Brand context: this is for "lajenuco" — a Valencian drain unblocking company.
The visual language should feel like a documentary photo essay,
not a marketing brochure.
`.trim().replace(/\s+/g, ' ');

// === IMAGE MANIFEST ===
const IMAGES = {
  'hero': {
    size: '1536x1024',
    quality: 'high',
    file: 'hero-tubolimp-valencia.webp',
    prompt: `Wide shot through a doorway into an old Valencian apartment building's tiled hallway. A bearded technician in his 40s, wearing dark navy work coveralls (no visible logos), kneels next to a hydro-jet machine with bright orange hoses. He is focused on his work, not looking at camera. The hallway has classic Valencian patterned ceramic tiles (azulejos) on the floor, an old wooden door slightly ajar, a single naked bulb hanging. Late afternoon Mediterranean light spills in through the open door from a courtyard with a hint of palm leaves. The technician's tools — a wrench, a flashlight, a notebook — are scattered on a small canvas tarp. Real work-in-progress feeling, not staged.`
  },
  'servicio-tuberias': {
    size: '1024x1024',
    quality: 'high',
    file: 'servicio-tuberias.webp',
    prompt: `Close-up of skilled hands operating a high-pressure hydro-jet hose feeding into a residential plumbing access point in an old Valencian bathroom. The hose is matte yellow, the hands have visible work calluses, wearing nitrile gloves rolled down to the wrist. Background: aged tile wall with subtle water stain, soft shadow play. Tools laid out on a folded towel: pressure gauge, adapter fittings. No faces visible. The image conveys precision and care, not industrial coldness.`
  },
  'servicio-wc': {
    size: '1024x1024',
    quality: 'high',
    file: 'servicio-wc.webp',
    prompt: `Medium shot of a technician's gloved hand placing a clean cotton drop cloth around the base of a vintage white porcelain toilet in a tiled Valencian bathroom (small green-and-white floor tiles). The light is soft, coming from a frosted window. A flexible plumbing snake is coiled neatly on the cloth. No mess visible — the image is about respectful, no-damage service. Off-center composition, slight grain.`
  },
  'servicio-fregadero': {
    size: '1024x1024',
    quality: 'high',
    file: 'servicio-fregadero.webp',
    prompt: `Overhead shot of a stainless steel kitchen sink in a humble but well-kept Valencian kitchen. A pair of hands disassemble the P-trap under the sink (visible through partial cutaway view). Bucket below catches the water. Warm kitchen tones — terracotta countertop, a forgotten coffee cup on the side, a window letting in golden hour light. Real and lived-in.`
  },
  'servicio-canalones': {
    size: '1024x1024',
    quality: 'high',
    file: 'servicio-canalones.webp',
    prompt: `Low angle shot looking up at a Valencian terrazza (rooftop) where a technician on a ladder reaches into a clogged gutter. Below him, the warm yellow facade of a typical Valencian building. Late afternoon, the sky has high cirrus clouds. The gutter is filled with dry leaves and some palm fronds. The technician wears a safety harness, looking up and away from camera. No drama, just craft.`
  },
  'servicio-camara': {
    size: '1024x1024',
    quality: 'high',
    file: 'servicio-camara.webp',
    prompt: `Tight detail shot of a robotic pipe inspection camera being fed into a residential drain. The camera head is matte black with a soft LED ring glowing faintly. Hands in nitrile gloves guide it carefully. A small monitor in the foreground shows a slightly out-of-focus blue-green wet view inside a pipe. Soft window light from the right. Technical but human.`
  },
  'servicio-fosa': {
    size: '1024x1024',
    quality: 'high',
    file: 'servicio-fosa.webp',
    prompt: `Wide shot of a vacuum tanker truck (matte amber yellow body, no visible logos) parked on a quiet road in the Valencian countryside huerta. Olive trees and orange groves in the soft-focus background. A technician unrolls the suction hose toward a septic tank access cover in the foreground (just the edge visible). Late afternoon light, dust in the air. Almost cinematic, but plain.`
  },
  'barrio-ruzafa': {
    size: '1024x1024',
    quality: 'high',
    file: 'barrio-ruzafa.webp',
    prompt: `Street-level wide shot of a residential street in Ruzafa, Valencia: narrow road, modernist 1920s apartment buildings with wrought iron balconies, locked-up bicycle, a corner café with two empty wicker chairs, a faded vintage sign. A small white service van (no logos) parked discreetly mid-frame. Soft golden hour light. The image evokes the neighborhood's identity without screaming it.`
  },
  'barrio-benimaclet': {
    size: '1024x1024',
    quality: 'high',
    file: 'barrio-benimaclet.webp',
    prompt: `Photograph of a low-rise residential corner in Benimaclet, Valencia: simpler 1960s apartment blocks, a small mom-and-pop hardware store on the corner with a hand-painted sign, an orange tree in a tiny plaza, a student with backpack walking past (face turned away). Late afternoon. The image carries the working-class university-adjacent character.`
  },
  'barrio-campanar': {
    size: '1024x1024',
    quality: 'high',
    file: 'barrio-campanar.webp',
    prompt: `A residential street in Campanar, Valencia: detached townhouses with small front gardens, the silhouette of the Hospital La Fe in the soft-focus distance, a freshly washed family car in a driveway, a palm tree casting long afternoon shadows. Quiet residential calm.`
  },
  'barrio-patraix': {
    size: '1024x1024',
    quality: 'high',
    file: 'barrio-patraix.webp',
    prompt: `A quiet residential corner in Patraix, Valencia: older single-storey houses with simple tiled facades in soft pastel colors (faded blue and ochre), an elderly couple on a bench under a small awning, a small dog in the foreground, golden afternoon light. Traditional, slightly working-class, calm.`
  },
  'barrio-cabanyal': {
    size: '1024x1024',
    quality: 'high',
    file: 'barrio-cabanyal.webp',
    prompt: `Street view of El Cabanyal, Valencia: characteristic narrow houses with hand-painted ceramic tile facades (azulejos) in faded blues, greens and ochres, a fisherman's vintage bicycle leaning against a wall, salt-air weathered shutters, the Mediterranean breeze implied. Late afternoon. Authentic, maritime, slightly weathered.`
  },
  'barrio-jesus': {
    size: '1024x1024',
    quality: 'high',
    file: 'barrio-jesus.webp',
    prompt: `A small busy street in the Jesús neighborhood of Valencia: a working-class local bar with a chalkboard menu outside, an elderly man drinking a small beer, a delivery scooter parked, a butcher shop sign next door. Late afternoon light, real city texture, not gentrified.`
  },
  'blog-precios': {
    size: '1536x1024',
    quality: 'high',
    file: 'blog-precios.webp',
    prompt: `Editorial table-top still life: a clipboard with a handwritten quote on paper (handwriting blurred, illegible — no real text), a worn measuring tape, a brass plumbing fitting, a calculator with key surfaces visible, all arranged on a warm-toned wooden workshop table. Late afternoon raking light. The image suggests honest, transparent pricing — receipt-and-handshake feeling, not corporate.`
  },
  'blog-fregadero': {
    size: '1536x1024',
    quality: 'high',
    file: 'blog-fregadero.webp',
    prompt: `Overhead flat-lay shot on a wooden kitchen counter of DIY drain-clearing essentials: an open box of baking soda, a bottle of white vinegar, a rubber plunger with red rubber and wooden handle, a kettle, a stainless-steel wire coat hanger partially uncurled, and a folded yellow rubber glove. Warm afternoon kitchen light. Documentary, instructional, not a Pinterest aesthetic.`
  }
};

// ----------------------------------------

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error('Falta OPENAI_API_KEY en el entorno');
  process.exit(1);
}

const slug = process.argv[2];

if (!slug) {
  console.log('Slugs disponibles:');
  console.log('  ALL  → genera todas');
  for (const k of Object.keys(IMAGES)) console.log('  ' + k);
  process.exit(0);
}

const targets = slug === 'ALL' ? Object.keys(IMAGES) : [slug];

await fs.mkdir(OUT, { recursive: true });

for (const k of targets) {
  const spec = IMAGES[k];
  if (!spec) { console.error('Slug desconocido:', k); continue; }

  const fullPrompt = BRAND + '\n\nSPECIFIC IMAGE: ' + spec.prompt;

  console.log(`→ ${k} (${spec.size}, ${spec.quality})`);
  const t0 = Date.now();

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-image-2',
      prompt: fullPrompt,
      size: spec.size,
      quality: spec.quality,
      n: 1
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error(`  ✗ ${res.status}: ${txt.slice(0, 200)}`);
    continue;
  }

  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const buf = Buffer.from(b64, 'base64');

  // Guardamos como .png inicialmente, luego se puede convertir a .webp con sharp si quieres
  const outPath = path.join(OUT, spec.file.replace('.webp', '.png'));
  await fs.writeFile(outPath, buf);

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  ✓ ${outPath} (${(buf.length / 1024).toFixed(0)} KB, ${dt}s)`);
}
