import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { renderDraftingCanvas } from './engine/drafting.js';
import { exportScaledSVG, exportTechPackJSON, calculateTiles } from './engine/export.js';

// Archetype & Cut Specifications derived directly from NOCIV Spec Sheet
export const GARMENT_ARCHETYPES = {
  pants: {
    id: 'pants',
    name: 'PANTS // UTILITY & WORKWEAR',
    cuts: [
      { id: 'carpenter', name: 'Carpenter Style', desc: 'Hammer loop, utility pockets, reinforced double knee option' },
      { id: 'army_fatigue', name: 'Army Fatigues', desc: 'Side cargo pockets, articulated knees, hem drawstrings' },
      { id: 'wide_leg', name: 'Wide Leg', desc: 'Relaxed seat with a straight wide leg opening' },
      { id: 'extra_wide', name: 'Extra Wide Leg', desc: 'Voluminous silhouette from hip down to hem' },
      { id: 'straight', name: 'Straight Workwear', desc: 'Classic structured straight leg utility cut' }
    ],
    sizeMode: 'pants_quick' // e.g. 30x30 or standard waist/inseam
  },
  tshirt: {
    id: 'tshirt',
    name: 'T-SHIRT // TEE & FITTED BASICS',
    cuts: [
      { id: 'muscle', name: 'Muscle Shirt', desc: 'Sleeveless cut with dropped armholes' },
      { id: 'tank', name: 'Tank Top', desc: 'Scooped neckline with narrow shoulder straps' },
      { id: 'boxy', name: 'Boxy Tee', desc: 'Wide chest, dropped shoulders, square cropped torso' },
      { id: 'cropped', name: 'Cropped Tee', desc: 'Shortened torso hem with relaxed body width' }
    ],
    sizeMode: 'top_standard'
  },
  headwear: {
    id: 'headwear',
    name: 'HEADWEAR',
    cuts: [
      { id: 'cadet_hat', name: 'Cadet Hat', desc: 'Flat crown with structured short visor' },
      { id: 'beanie', name: 'Beanie / Skully', desc: 'Form-fitting multi-panel knit headwear' }
    ],
    sizeMode: 'head_circ'
  },
  bags: {
    id: 'bags',
    name: 'BAGS & GEAR',
    cuts: [
      { id: 'tote_regular', name: 'Tote Bag (Regular)', desc: 'Standard daily canvas utility tote' },
      { id: 'tote_mini', name: 'Tote Bag (Mini)', desc: 'Compact essential carry tote' },
      { id: 'fanny_pack', name: 'Fanny Pack (Double Straps)', desc: 'Dual-webbing hip or crossbody pack' },
      { id: 'camper_backpack', name: 'Camper Flap Backpack', desc: 'Simple canvas backpack with flap closure' }
    ],
    sizeMode: 'bag_dim'
  }
};

// Help Tooltips Data
const HELP_GUIDANCE = {
  archetype: "Select the base garment archetype first. Only cuts relevant to this category will be made available.",
  body_size: "If you don't know your exact anatomical specs, type standard retail sizes (e.g., Men's 30x30 or Women's 6). The engine calibrates pattern baselines automatically.",
  style_arch: "Fine-tune design details such as pocket placement, seam styling, and cut accents.",
  fit_ease: "Ease is the extra space added beyond body measurements for movement and style silhouette."
};

const state = {
  currentStep: 1, // 1: Archetype, 2: Body Size, 3: Style Arch, 4: Fit & Ease, 5: Construction, 6: Export
  archetype: 'pants',
  selectedCut: 'carpenter',
  mode: 'pattern',
  zoom: 1.0,
  quickSize: { mensWaist: 30, mensInseam: 30, womensSize: 6, alphaSize: 'M' },
  values: {
    waist: 30, hip: 38, rise: 11, inseam: 30, thigh: 24, knee: 18, hem: 16,
    chest: 40, length: 28, shoulder: 18, armholeDepth: 9.5, neckCirc: 16.5,
    waistEase: 1.0, hipEase: 2.5, chestEase: 4.0, sa: 0.5
  }
};

export function initApp() {
  renderHeaderControls();
  renderStepNavigation();
  renderSidebarStepContent();
  renderCanvas();
}

function renderHeaderControls() {
  const headerRight = document.getElementById('header-actions');
  if (!headerRight) return;
  headerRight.innerHTML = `
    <button id="btn-fullscreen" class="btn px-3 py-1.5 text-xs mono">FULLSCREEN ⛶</button>
    <button id="btn-global-help" class="btn px-3 py-1.5 text-xs mono bg-yellow-100">HELP (?)</button>
  `;

  document.getElementById('btn-fullscreen')?.addEventListener('click', toggleFullscreen);
  document.getElementById('btn-global-help')?.addEventListener('click', () => {
    showHelpModal('NOCIV Engine Workflow', HELP_GUIDANCE.archetype);
  });
}

function renderStepNavigation() {
  const nav = document.getElementById('step-nav');
  if (!nav) return;
  
  const steps = [
    { num: 1, label: '1. Archetype & Cut' },
    { num: 2, label: '2. Body Baseline' },
    { num: 3, label: '3. Style Architecture' },
    { num: 4, label: '4. Fit & Ease' },
    { num: 5, label: '5. Construction' },
    { num: 6, label: '6. PDF / Export' }
  ];

  nav.innerHTML = steps.map(s => `
    <button class="btn text-left px-2 py-1 text-xs mono ${state.currentStep === s.num ? 'active' : ''}" data-step="${s.num}">
      ${s.label}
    </button>
  `).join('');

  nav.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.currentStep = parseInt(e.currentTarget.getAttribute('data-step'));
      renderStepNavigation();
      renderSidebarStepContent();
    });
  });
}

function renderSidebarStepContent() {
  const container = document.getElementById('controls');
  if (!container) return;

  switch (state.currentStep) {
    case 1:
      renderStep1_Archetype(container);
      break;
    case 2:
      renderStep2_BodySize(container);
      break;
    case 3:
      renderStep3_StyleArchitecture(container);
      break;
    case 4:
      renderStep4_FitEase(container);
      break;
    case 5:
      renderStep5_Construction(container);
      break;
    case 6:
      renderStep6_Export(container);
      break;
  }
}

// STEP 1: Garment Archetype & Isolated Cuts
function renderStep1_Archetype(container) {
  let html = `
    <div class="flex items-center justify-between section-title mb-3">
      <span>1. SELECT GARMENT ARCHETYPE</span>
      <button class="btn-help text-xs px-1" data-help="archetype">(?)</button>
    </div>
    <div class="grid grid-cols-2 gap-2 mb-4">
      ${Object.values(GARMENT_ARCHETYPES).map(arch => `
        <button class="btn p-2 text-left ${state.archetype === arch.id ? 'active' : ''}" data-arch="${arch.id}">
          <div class="font-bold text-xs">${arch.name.split('//')[0]}</div>
          <div class="mini opacity-75">${arch.name.split('//')[1] || ''}</div>
        </button>
      `).join('')}
    </div>

    <div class="flex items-center justify-between section-title mb-3">
      <span>SELECT CUT PROFILE</span>
    </div>
    <div class="space-y-2 mb-4">
      ${GARMENT_ARCHETYPES[state.archetype].cuts.map(cut => `
        <div class="border2 p-2.5 bg-white cursor-pointer hover:bg-gray-50 ${state.selectedCut === cut.id ? 'border-black ring-2 ring-black' : ''}" data-cut="${cut.id}">
          <div class="flex justify-between items-center mb-1">
            <span class="font-bold text-xs mono uppercase">${cut.name}</span>
            <input type="radio" name="cut_select" ${state.selectedCut === cut.id ? 'checked' : ''} class="check">
          </div>
          <p class="mini text-gray-600 leading-tight">${cut.desc}</p>
        </div>
      `).join('')}
    </div>
    <button id="btn-next-step" class="btn w-full py-2.5 text-xs mono bg-black text-white">NEXT: BODY BASELINE SIZE &rarr;</button>
  `;

  container.innerHTML = html;

  // Event Handlers
  container.querySelectorAll('[data-arch]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.archetype = e.currentTarget.getAttribute('data-arch');
      state.selectedCut = GARMENT_ARCHETYPES[state.archetype].cuts[0].id;
      renderSidebarStepContent();
      renderCanvas();
    });
  });

  container.querySelectorAll('[data-cut]').forEach(card => {
    card.addEventListener('click', (e) => {
      state.selectedCut = e.currentTarget.getAttribute('data-cut');
      renderSidebarStepContent();
      renderCanvas();
    });
  });

  document.getElementById('btn-next-step')?.addEventListener('click', () => {
    state.currentStep = 2;
    renderStepNavigation();
    renderSidebarStepContent();
  });

  attachHelpClickListeners(container);
}

// STEP 2: Body Baseline Size & Auto Calibration
function renderStep2_BodySize(container) {
  let html = `
    <div class="flex items-center justify-between section-title mb-3">
      <span>2. BODY BASELINE SIZE</span>
      <button class="btn-help text-xs px-1" data-help="body_size">(?)</button>
    </div>
    <div class="notice p-3 mb-4 text-xs mono">
      <b>QUICK SIZE CALIBRATION</b><br>
      Enter standard off-the-rack sizing. The engine translates these directly into baseline drafting geometry.
    </div>
  `;

  if (state.archetype === 'pants') {
    html += `
      <div class="border2 p-3 bg-white mb-4 space-y-3">
        <label class="block">
          <span class="mini font-bold uppercase block mb-1">Men's Retail Size (Waist x Inseam)</span>
          <div class="flex gap-2">
            <input type="number" id="quick-waist" value="${state.quickSize.mensWaist}" class="field" placeholder="Waist (e.g. 30)">
            <span class="self-center font-bold">x</span>
            <input type="number" id="quick-inseam" value="${state.quickSize.mensInseam}" class="field" placeholder="Inseam (e.g. 30)">
          </div>
        </label>
        <div class="text-center mini text-gray-500 font-bold">&mdash; OR &mdash;</div>
        <label class="block">
          <span class="mini font-bold uppercase block mb-1">US Women's Numeric Size</span>
          <select id="quick-womens" class="field">
            ${[0, 2, 4, 6, 8, 10, 12, 14, 16].map(num => `<option value="${num}" ${state.quickSize.womensSize === num ? 'selected' : ''}>Size ${num}</option>`).join('')}
          </select>
        </label>
      </div>
    `;
  } else {
    html += `
      <div class="border2 p-3 bg-white mb-4 space-y-3">
        <label class="block">
          <span class="mini font-bold uppercase block mb-1">Standard Alpha Size</span>
          <div class="grid grid-cols-4 gap-1">
            ${['S', 'M', 'L', 'XL'].map(s => `
              <button class="btn py-1 text-xs btn-alpha ${state.quickSize.alphaSize === s ? 'active' : ''}" data-size="${s}">${s}</button>
            `).join('')}
          </div>
        </label>
      </div>
    `;
  }

  html += `
    <button id="btn-calibrate" class="btn w-full py-2 text-xs mono mb-3 bg-yellow-50">CALIBRATE BASELINE DRAFT</button>
    <button id="btn-next-step" class="btn w-full py-2.5 text-xs mono bg-black text-white">NEXT: STYLE ARCHITECTURE &rarr;</button>
  `;

  container.innerHTML = html;

  // Auto-calibration triggers
  document.getElementById('btn-calibrate')?.addEventListener('click', calibrateBodyMeasurements);
  document.getElementById('btn-next-step')?.addEventListener('click', () => {
    calibrateBodyMeasurements();
    state.currentStep = 3;
    renderStepNavigation();
    renderSidebarStepContent();
  });

  attachHelpClickListeners(container);
}

function calibrateBodyMeasurements() {
  if (state.archetype === 'pants') {
    const w = parseFloat(document.getElementById('quick-waist')?.value) || 30;
    const ins = parseFloat(document.getElementById('quick-inseam')?.value) || 30;
    state.quickSize.mensWaist = w;
    state.quickSize.mensInseam = ins;

    // Automatic anatomical calculation formula
    state.values.waist = w;
    state.values.hip = w + 8.0; // Standard anatomical ratio
    state.values.inseam = ins;
    state.values.rise = Math.min(13.5, 9.5 + (w * 0.08));
    state.values.thigh = (state.values.hip / 2) + 4.0;
  } else {
    // Top calibration formulas
    const alphaMap = { S: 36, M: 40, L: 44, XL: 48 };
    const chest = alphaMap[state.quickSize.alphaSize] || 40;
    state.values.chest = chest;
    state.values.shoulder = chest * 0.45;
    state.values.length = 26 + (chest * 0.05);
  }
  renderCanvas();
}

function renderStep3_StyleArchitecture(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between section-title mb-3">
      <span>3. STYLE ARCHITECTURE</span>
      <button class="btn-help text-xs px-1" data-help="style_arch">(?)</button>
    </div>
    <div class="notice p-3 mb-4 text-xs mono">
      Cut-specific features for <b>${GARMENT_ARCHETYPES[state.archetype].cuts.find(c => c.id === state.selectedCut)?.name}</b>.
    </div>
    <!-- Detailed pocket, loop, and seam options load here per cut -->
    <button id="btn-next-step" class="btn w-full py-2.5 text-xs mono bg-black text-white mt-4">NEXT: FIT &amp; EASE ALLOWANCE &rarr;</button>
  `;

  document.getElementById('btn-next-step')?.addEventListener('click', () => {
    state.currentStep = 4;
    renderStepNavigation();
    renderSidebarStepContent();
  });
  attachHelpClickListeners(container);
}

function renderStep4_FitEase(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between section-title mb-3">
      <span>4. FIT &amp; EASE ALLOWANCE</span>
      <button class="btn-help text-xs px-1" data-help="fit_ease">(?)</button>
    </div>
    <div class="border2 p-3 bg-white mb-4">
      <label class="block mb-3">
        <span class="mini font-bold uppercase block mb-1">Seam Allowance (SA)</span>
        <input type="range" min="0" max="0.75" step="0.125" value="${state.values.sa}" class="w-full" id="sa-slider">
        <div class="flex justify-between mini text-gray-500"><span>0" (Net)</span><span>0.5" (Standard)</span><span>0.75"</span></div>
      </label>
    </div>
    <button id="btn-next-step" class="btn w-full py-2.5 text-xs mono bg-black text-white">NEXT: CONSTRUCTION &amp; PREVIEW &rarr;</button>
  `;

  document.getElementById('sa-slider')?.addEventListener('input', (e) => {
    state.values.sa = parseFloat(e.target.value);
    renderCanvas();
  });

  document.getElementById('btn-next-step')?.addEventListener('click', () => {
    state.currentStep = 5;
    renderStepNavigation();
    renderSidebarStepContent();
  });
  attachHelpClickListeners(container);
}

function renderStep5_Construction(container) {
  container.innerHTML = `
    <div class="section-title mb-3">5. CONSTRUCTION &amp; PATTERN</div>
    <div class="notice p-3 mb-4 text-xs mono">
      Verify net lines (red dash) and cut boundaries (black solid) in the canvas preview before generation.
    </div>
    <button id="btn-next-step" class="btn w-full py-2.5 text-xs mono bg-black text-white">NEXT: GENERATE PDF / EXPORT &rarr;</button>
  `;

  document.getElementById('btn-next-step')?.addEventListener('click', () => {
    state.currentStep = 6;
    renderStepNavigation();
    renderSidebarStepContent();
  });
}

function renderStep6_Export(container) {
  container.innerHTML = `
    <div class="section-title mb-3">6. EXPORT &amp; DOWNLOAD</div>
    <button class="btn w-full py-2.5 text-xs mono mb-2 bg-yellow-50" id="btn-export-pdf">DOWNLOAD TILED PDF (US LETTER / A4)</button>
    <button class="btn w-full py-2.5 text-xs mono mb-2 bg-white" id="btn-export-svg">EXPORT CAD VECTOR (.SVG)</button>
    <button class="btn w-full py-2.5 text-xs mono bg-gray-100" id="btn-export-json">EXPORT TECH PACK SPEC (.JSON)</button>
  `;

  document.getElementById('btn-export-svg')?.addEventListener('click', () => {
    const svgEl = document.querySelector('#canvas svg');
    exportScaledSVG(svgEl);
  });
  document.getElementById('btn-export-json')?.addEventListener('click', () => exportTechPackJSON(state));
}

function renderCanvas() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  canvas.innerHTML = '';
  const svg = renderDraftingCanvas(state);
  canvas.appendChild(svg);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

function attachHelpClickListeners(container) {
  container.querySelectorAll('.btn-help').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.currentTarget.getAttribute('data-help');
      showHelpModal('Step Guidance', HELP_GUIDANCE[key] || 'Follow the step instructions to calibrate your pattern.');
    });
  });
}

function showHelpModal(title, message) {
  let modal = document.getElementById('guideModal');
  if (!modal) return;
  modal.querySelector('.mono.text-sm').textContent = title;
  modal.querySelector('.space-y-4').innerHTML = `<p class="leading-relaxed text-xs mono">${message}</p>`;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

document.addEventListener('DOMContentLoaded', initApp);
