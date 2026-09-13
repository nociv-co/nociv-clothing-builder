import { renderDraftingCanvas } from './engine/drafting.js';
import { exportScaledSVG, exportTechPackJSON } from './engine/export.js';

export const GARMENT_ARCHETYPES = {
  pants: {
    id: 'pants',
    name: 'PANTS // UTILITY & WORKWEAR',
    cuts: [
      { id: 'carpenter', name: 'Carpenter Style', desc: 'Hammer loop, utility rule pocket, optional double-knee patch' },
      { id: 'army_fatigue', name: 'Army Fatigues', desc: 'Side cargo pockets, articulated knee darts, drawstrings at hem' },
      { id: 'wide_leg', name: 'Wide Leg', desc: 'Relaxed seat with straight wide leg drop' },
      { id: 'extra_wide', name: 'Extra Wide Leg', desc: 'Voluminous relaxed silhouette from hip down' },
      { id: 'straight', name: 'Straight Workwear', desc: 'Classic structured straight leg utility cut' }
    ]
  },
  tshirt: {
    id: 'tshirt',
    name: 'T-SHIRT // TEE & FITTED BASICS',
    cuts: [
      { id: 'muscle', name: 'Muscle Shirt', desc: 'Sleeveless cut with deep dropped armholes' },
      { id: 'tank', name: 'Tank Top', desc: 'Scooped neckline with narrow shoulder straps' },
      { id: 'boxy', name: 'Boxy Tee', desc: 'Wide chest, dropped shoulders, square cropped body' },
      { id: 'cropped', name: 'Cropped Tee', desc: 'Shortened torso hem with relaxed body width' }
    ]
  },
  headwear: {
    id: 'headwear',
    name: 'HEADWEAR',
    cuts: [
      { id: 'cadet_hat', name: 'Cadet Hat', desc: 'Flat crown with structured short visor' },
      { id: 'beanie', name: 'Beanie / Skully', desc: 'Form-fitting multi-panel knit headwear' }
    ]
  },
  bags: {
    id: 'bags',
    name: 'BAGS & GEAR',
    cuts: [
      { id: 'tote_regular', name: 'Tote Bag (Regular)', desc: 'Standard daily canvas utility tote' },
      { id: 'tote_mini', name: 'Tote Bag (Mini)', desc: 'Compact essential carry tote' },
      { id: 'fanny_pack', name: 'Fanny Pack (Double Straps)', desc: 'Dual-webbing hip or crossbody pack' },
      { id: 'camper_backpack', name: 'Camper Flap Canvas Backpack', desc: 'Simple canvas backpack with flap closure' }
    ]
  }
};

const HELP_GUIDANCE = {
  archetype: "Select a primary archetype. The cut options below update automatically to isolate features for that category.",
  body_size: "Enter standard retail sizing (e.g. Men's 30x30 or Alpha S/M/L) to calibrate the baseline drafting measurements.",
  style_arch: "Configure archetype-specific elements like pockets, hammer loops, or hem cuffs.",
  fit_ease: "Adjust movement allowances (ease) and seam allowance (SA) added to pattern edges.",
  export: "Select between home tiled printing with step-by-step assembly guides or factory-ready vector and tech pack exports."
};

const DEFAULT_STATE = {
  currentStep: 1,
  archetype: 'pants',
  selectedCut: 'carpenter',
  base: 'pants',
  mode: 'pattern',
  zoom: 1.0,
  showBodyOverlay: true,
  selectedPathway: 'home',
  quickSize: { mensWaist: 30, mensInseam: 30, womensSize: 6, alphaSize: 'M' },
  values: {
    waist: 30, hip: 38, rise: 11, inseam: 30, thigh: 24, knee: 18, hem: 16,
    chest: 40, length: 28, shoulder: 18, armholeDepth: 9.5, neckCirc: 16.5,
    waistEase: 1.0, hipEase: 2.5, chestEase: 4.0, sa: 0.5
  }
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

export function initApp() {
  setupEventListeners();
  renderStepNavigation();
  renderSidebarStepContent();
  renderCanvas();
}

function setupEventListeners() {
  // Navigation & Viewport Controls
  document.getElementById('btn-fullscreen')?.addEventListener('click', toggleFullscreen);
  document.getElementById('btn-reset')?.addEventListener('click', resetApp);
  document.getElementById('btn-global-help')?.addEventListener('click', () => {
    showGuideModal('NOCIV Engine Help', HELP_GUIDANCE.archetype);
  });
  document.getElementById('btn-guide')?.addEventListener('click', () => {
    showGuideModal('Anatomical Rules', `
      <p class="mb-2"><b>Tilted Back Rise Angle (&theta;):</b> Back crotch rise tilts inward by 1.5–2.0 in and extends upward to prevent pull when seated.</p>
      <p class="mb-2"><b>Crotch Extension:</b> Front = Seat / 16; Back = (Seat / 8) + 0.5 in.</p>
      <p><b>Shoulder Slant:</b> Anatomical 15° drop applied from neck root to shoulder point.</p>
    `);
  });
  document.getElementById('btn-close-guide')?.addEventListener('click', hideGuideModal);
  document.getElementById('btn-understand-guide')?.addEventListener('click', hideGuideModal);

  // Overlay Toggle
  document.getElementById('chkBodyOverlay')?.addEventListener('change', (e) => {
    state.showBodyOverlay = e.target.checked;
    renderCanvas();
  });

  // Flat vs Pattern Mode Toggle
  document.getElementById('modeFlat')?.addEventListener('click', () => {
    state.mode = 'flat';
    updateModeUI();
    renderCanvas();
  });
  document.getElementById('modePattern')?.addEventListener('click', () => {
    state.mode = 'pattern';
    updateModeUI();
    renderCanvas();
  });

  // Zoom Controls
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => { state.zoom = Math.min(2.0, state.zoom + 0.15); updateZoom(); });
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => { state.zoom = Math.max(0.4, state.zoom - 0.15); updateZoom(); });
  document.getElementById('btn-zoom-reset')?.addEventListener('click', () => { state.zoom = 1.0; updateZoom(); });

  // Print Modal Controls
  document.getElementById('btn-print-modal')?.addEventListener('click', openPrintModal);
  document.getElementById('btn-close-modal')?.addEventListener('click', closePrintModal);
  document.getElementById('btn-cancel-print')?.addEventListener('click', closePrintModal);
  document.getElementById('btn-execute-print')?.addEventListener('click', () => window.print());
}

function resetApp() {
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  const overlayCheck = document.getElementById('chkBodyOverlay');
  if (overlayCheck) overlayCheck.checked = state.showBodyOverlay;
  updateZoom();
  updateModeUI();
  renderStepNavigation();
  renderSidebarStepContent();
  renderCanvas();
}

function updateModeUI() {
  const btnFlat = document.getElementById('modeFlat');
  const btnPattern = document.getElementById('modePattern');
  if (state.mode === 'flat') {
    btnFlat?.classList.add('active');
    btnPattern?.classList.remove('active');
  } else {
    btnPattern?.classList.add('active');
    btnFlat?.classList.remove('active');
  }
}

function updateZoom() {
  const label = document.getElementById('zoomLabel');
  if (label) label.textContent = `${Math.round(state.zoom * 100)}%`;
  renderCanvas();
}

function renderStepNavigation() {
  const nav = document.getElementById('step-nav');
  if (!nav) return;

  const steps = [
    { num: 1, label: '1. Archetype & Cut' },
    { num: 2, label: '2. Body Baseline' },
    { num: 3, label: '3. Style Arch' },
    { num: 4, label: '4. Fit & Ease' },
    { num: 5, label: '5. Construction' },
    { num: 6, label: '6. PDF / Export' }
  ];

  nav.innerHTML = steps.map(s => `
    <button class="btn text-left px-2 py-1 text-xs mono ${state.currentStep === s.num ? 'active bg-black text-white' : 'bg-white'}" data-step="${s.num}">
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
    case 1: renderStep1_Archetype(container); break;
    case 2: renderStep2_BodySize(container); break;
    case 3: renderStep3_StyleArchitecture(container); break;
    case 4: renderStep4_FitEase(container); break;
    case 5: renderStep5_Construction(container); break;
    case 6: renderStep6_Export(container); break;
  }
}

function renderStep1_Archetype(container) {
  let html = `
    <div class="flex items-center justify-between section-title mb-3">
      <span>1. SELECT GARMENT ARCHETYPE</span>
      <button class="btn-help text-xs px-1 font-bold" data-help="archetype">(?)</button>
    </div>
    <div class="grid grid-cols-2 gap-2 mb-4">
      ${Object.values(GARMENT_ARCHETYPES).map(arch => `
        <button class="btn p-2 text-left ${state.archetype === arch.id ? 'active bg-black text-white' : 'bg-white'}" data-arch="${arch.id}">
          <div class="font-bold text-xs">${arch.name.split('//')[0]}</div>
          <div class="mini opacity-75">${arch.name.split('//')[1] || ''}</div>
        </button>
      `).join('')}
    </div>

    <div class="section-title mb-3">SELECT CUT PROFILE</div>
    <div class="space-y-2 mb-4">
      ${GARMENT_ARCHETYPES[state.archetype].cuts.map(cut => `
        <div class="border2 p-2.5 bg-white cursor-pointer hover:bg-gray-50 ${state.selectedCut === cut.id ? 'ring-2 ring-black' : ''}" data-cut="${cut.id}">
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

  container.querySelectorAll('[data-arch]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.archetype = e.currentTarget.getAttribute('data-arch');
      state.base = (state.archetype === 'pants') ? 'pants' : (state.archetype === 'tshirt' ? 'tshirt' : state.archetype);
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

function renderStep2_BodySize(container) {
  let html = `
    <div class="flex items-center justify-between section-title mb-3">
      <span>2. BODY BASELINE SIZE</span>
      <button class="btn-help text-xs px-1 font-bold" data-help="body_size">(?)</button>
    </div>
    <div class="notice p-3 mb-4 text-xs mono">
      Enter standard off-the-rack sizing to calibrate drafting baselines.
    </div>
  `;

  if (state.archetype === 'pants') {
    html += `
      <div class="border2 p-3 bg-white mb-4 space-y-3">
        <label class="block">
          <span class="mini font-bold uppercase block mb-1">Men's Size (Waist x Inseam)</span>
          <div class="flex gap-2">
            <input type="number" id="quick-waist" value="${state.quickSize.mensWaist}" class="border2 p-1 text-xs w-full" placeholder="Waist">
            <span class="self-center font-bold">x</span>
            <input type="number" id="quick-inseam" value="${state.quickSize.mensInseam}" class="border2 p-1 text-xs w-full" placeholder="Inseam">
          </div>
        </label>
        <div class="text-center mini text-gray-500 font-bold">&mdash; OR &mdash;</div>
        <label class="block">
          <span class="mini font-bold uppercase block mb-1">US Women's Numeric Size</span>
          <select id="quick-womens" class="border2 p-1 text-xs w-full">
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
              <button class="btn py-1 text-xs btn-alpha ${state.quickSize.alphaSize === s ? 'active bg-black text-white' : 'bg-white'}" data-size="${s}">${s}</button>
            `).join('')}
          </div>
        </label>
      </div>
    `;
  }

  html += `
    <button id="btn-calibrate" class="btn w-full py-2 text-xs mono mb-3 bg-yellow-50">CALIBRATE DRAFTING BASELINE</button>
    <button id="btn-next-step" class="btn w-full py-2.5 text-xs mono bg-black text-white">NEXT: STYLE ARCHITECTURE &rarr;</button>
  `;

  container.innerHTML = html;

  container.querySelectorAll('.btn-alpha').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.quickSize.alphaSize = e.currentTarget.getAttribute('data-size');
      renderSidebarStepContent();
    });
  });

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

    state.values.waist = w;
    state.values.hip = w + 8.0;
    state.values.inseam = ins;
    state.values.rise = Math.min(13.5, 9.5 + (w * 0.08));
    state.values.thigh = (state.values.hip / 2) + 4.0;
  } else {
    const alphaMap = { S: 36, M: 40, L: 44, XL: 48 };
    const chest = alphaMap[state.quickSize.alphaSize] || 40;
    state.values.chest = chest;
    state.values.shoulder = chest * 0.45;
    state.values.length = 26 + (chest * 0.05);
  }
  renderCanvas();
}

function renderStep3_StyleArchitecture(container) {
  const currentCutObj = GARMENT_ARCHETYPES[state.archetype].cuts.find(c => c.id === state.selectedCut);
  container.innerHTML = `
    <div class="flex items-center justify-between section-title mb-3">
      <span>3. STYLE ARCHITECTURE</span>
      <button class="btn-help text-xs px-1 font-bold" data-help="style_arch">(?)</button>
    </div>
    <div class="notice p-3 mb-4 text-xs mono">
      Configuring features for <b>${currentCutObj ? currentCutObj.name : state.selectedCut}</b>.
    </div>
    <div class="border2 p-3 bg-white space-y-3 mb-4 text-xs mono">
      <label class="flex items-center justify-between">
        <span>Reinforced Seams</span>
        <input type="checkbox" checked class="check">
      </label>
      <label class="flex items-center justify-between">
        <span>Utility Accents / Straps</span>
        <input type="checkbox" checked class="check">
      </label>
    </div>
    <button id="btn-next-step" class="btn w-full py-2.5 text-xs mono bg-black text-white">NEXT: FIT &amp; EASE ALLOWANCE &rarr;</button>
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
      <button class="btn-help text-xs px-1 font-bold" data-help="fit_ease">(?)</button>
    </div>
    <div class="border2 p-3 bg-white mb-4 space-y-3">
      <label class="block">
        <span class="mini font-bold uppercase block mb-1">Seam Allowance (SA): ${state.values.sa}"</span>
        <input type="range" min="0" max="0.75" step="0.125" value="${state.values.sa}" class="w-full" id="sa-slider">
        <div class="flex justify-between mini text-gray-500"><span>0" (Net)</span><span>0.5" (Std)</span><span>0.75"</span></div>
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
    <div class="section-title mb-3">5. CONSTRUCTION &amp; PREVIEW</div>
    <div class="notice p-3 mb-4 text-xs mono">
      Inspect net seamlines (red dash) and cut borders (black solid) on the viewport canvas before generating vector exports.
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
  state.selectedPathway = state.selectedPathway || 'home';

  container.innerHTML = `
    <div class="flex items-center justify-between section-title mb-3">
      <span>6. EXPORT & PRODUCTION PATHWAY</span>
      <button class="btn-help text-xs px-1 font-bold" data-help="export">(?)</button>
    </div>

    <!-- Pathway Selection Tabs -->
    <div class="grid grid-cols-2 gap-2 mb-4">
      <button id="path-home-btn" class="btn border2 p-2.5 text-left mono ${state.selectedPathway === 'home' ? 'active bg-black text-white' : 'bg-white text-black'}">
        <div class="font-bold text-xs">1. DIY HOME PRINT</div>
        <div class="mini opacity-80 mt-0.5">Tiled PDF + Sewing Guide</div>
      </button>

      <button id="path-factory-btn" class="btn border2 p-2.5 text-left mono ${state.selectedPathway === 'factory' ? 'active bg-black text-white' : 'bg-white text-black'}">
        <div class="font-bold text-xs">2. FACTORY PRODUCTION</div>
        <div class="mini opacity-80 mt-0.5">CAD Vectors + Tech Pack</div>
      </button>
    </div>

    <!-- Pathway Details Container -->
    <div id="pathway-content" class="border2 p-3 bg-white mono text-xs mb-4">
      ${state.selectedPathway === 'home' ? getHomePathwayHTML() : getFactoryPathwayHTML()}
    </div>
  `;

  // Pathway Switch Event Listeners
  document.getElementById('path-home-btn')?.addEventListener('click', () => {
    state.selectedPathway = 'home';
    renderStep6_Export(container);
  });

  document.getElementById('path-factory-btn')?.addEventListener('click', () => {
    state.selectedPathway = 'factory';
    renderStep6_Export(container);
  });

  // Action Handlers
  document.getElementById('btn-download-tiled-pdf')?.addEventListener('click', openPrintModal);
  document.getElementById('btn-export-cad-svg')?.addEventListener('click', () => {
    const svgEl = document.querySelector('#canvas svg');
    exportScaledSVG(svgEl);
  });
  document.getElementById('btn-export-techpack-json')?.addEventListener('click', () => {
    exportTechPackJSON(state);
  });

  attachHelpClickListeners(container);
}

function getHomePathwayHTML() {
  const currentCut = GARMENT_ARCHETYPES[state.archetype]?.cuts.find(c => c.id === state.selectedCut)?.name || state.selectedCut;

  return `
    <div class="space-y-3">
      <div class="notice p-2 border border-black text-[11px] bg-yellow-100">
        <b>RECOMMENDED PAPER:</b> Standard 8.5" x 11" US Letter or A4 paper. Heavy cardstock (65lb–110lb) is recommended for master sloper blocks that will be reused.
      </div>

      <button id="btn-download-tiled-pdf" class="btn w-full py-2.5 text-xs mono font-bold bg-yellow-300 hover:bg-yellow-400">
        DOWNLOAD TILED PDF (100% SCALE)
      </button>

      <div class="border-t border-black pt-2 mt-2">
        <div class="font-bold text-xs mb-2 uppercase">NEXT STEPS: DIY ASSEMBLY & CONSTRUCTION</div>
        
        <ol class="list-decimal list-inside space-y-2 text-[11px] leading-relaxed">
          <li>
            <b>Printer Calibration Check:</b> Open the PDF and print <b>Page 1 only</b> at <span class="underline">100% Scale / Actual Size</span> (disable "Fit to Page"). Verify that the 1.0" test square measures exactly 1.0 inch with a ruler before printing remaining pages.
          </li>
          <li>
            <b>Tile Assembly & Taping:</b> Trim along the marked margin lines on each page. Match corner alignment crosshairs and grid indexes (e.g., Row A - Tile 1 to Row A - Tile 2). Tape sheets flat across a table.
          </li>
          <li>
            <b>Pattern Cutting:</b> Cut out pattern pieces along the solid black outer line (includes ${state.values.sa}" seam allowance). The red dashed line indicates your stitching line.
          </li>
          <li>
            <b>Garment Construction Steps (${currentCut.toUpperCase()}):</b>
            <ul class="list-disc list-inside ml-3 mt-1 mini space-y-1 text-gray-700">
              <li>Mark all notch points, dart tips, and grainlines onto fabric using chalk.</li>
              <li>Stitch internal features first (pockets, pleats, or double-knee patches).</li>
              <li>Join front and back panels at side seams and inseams using red net seamlines.</li>
              <li>Finish waistband/cuff enclosures and press seams with an iron.</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  `;
}

function getFactoryPathwayHTML() {
  return `
    <div class="space-y-3">
      <div class="grid grid-cols-2 gap-2">
        <button id="btn-export-cad-svg" class="btn py-2 text-[11px] mono font-bold bg-white hover:bg-gray-100">
          EXPORT CAD VECTOR (.SVG)
        </button>
        <button id="btn-export-techpack-json" class="btn py-2 text-[11px] mono font-bold bg-white hover:bg-gray-100">
          EXPORT TECH PACK (.JSON)
        </button>
      </div>

      <div class="border-t border-black pt-2 mt-2">
        <div class="font-bold text-xs mb-2 uppercase">NEXT STEPS: FACTORY HANDOFF & MANUFACTURING</div>

        <ol class="list-decimal list-inside space-y-2 text-[11px] leading-relaxed">
          <li>
            <b>CAD Vector Ingestion:</b> Supply the exported <code>.SVG</code> vector file to your factory or patternmaker. The file contains isolated vector layers:
            <ul class="list-disc list-inside ml-3 mini text-gray-700">
              <li><code>CUT_LINE</code>: Outer path for automated CNC fabric lasers/cutters.</li>
              <li><code>SEAM_LINE</code>: Net stitching line.</li>
              <li><code>GRAINLINE</code> & <code>NOTCHES</code>: Alignment marks for assembly operators.</li>
            </ul>
          </li>
          <li>
            <b>Tech Pack Specs & POM:</b> Hand off the <code>.JSON</code> file or import it into your PLM system. It details exact Points of Measure (POM), graded tolerances, seam allowance specifications, and hardware callouts.
          </li>
          <li>
            <b>Sample Creation & Prototype Fitting:</b> Have the factory cut and sew a single physical sample ("First Sample") using the CAD files to verify fit and fabric drape.
          </li>
          <li>
            <b>Production Marker Making:</b> The factory patternmaker imports the CAD vectors into marker software (Optitex/Lectra/Gerber) to tile pattern pieces efficiently across full fabric roll widths, minimizing fabric waste.
          </li>
        </ol>
      </div>
    </div>
  `;
}

function renderCanvas() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  canvas.innerHTML = '';
  const svg = renderDraftingCanvas(state);
  if (svg) canvas.appendChild(svg);

  // Estimate pages for status bar
  const estTiles = document.getElementById('tileSizeEst');
  if (estTiles) {
    const cols = Math.ceil(800 / (8.5 * 30));
    const rows = Math.ceil(600 / (11 * 30));
    estTiles.textContent = `ESTIMATED TILES: ${cols * rows} PAGES (US LETTER / 100% SCALE)`;
  }
}

function openPrintModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  renderPrintTiles();
}

function closePrintModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function renderPrintTiles() {
  const summary = document.getElementById('printSummary');
  const preview = document.getElementById('tilePreview');
  if (!summary || !preview) return;

  const cols = 2;
  const rows = 2;
  const totalTiles = cols * rows;

  summary.textContent = `ARCHETYPE: ${state.archetype.toUpperCase()} // CUT: ${state.selectedCut.toUpperCase()} // TILES REQUIRED: ${totalTiles} (2x2 GRID)`;

  preview.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tileId = String.fromCharCode(65 + r) + (c + 1);
      const card = document.createElement('div');
      card.className = 'border2 p-3 bg-white flex flex-col items-center justify-between text-center min-h-[160px]';
      card.innerHTML = `
        <div class="mono text-xs font-bold w-full border-b pb-1 flex justify-between">
          <span>TILE ${tileId}</span>
          <span>100% SCALE</span>
        </div>
        <div class="my-3 border border-dashed border-gray-400 w-20 h-24 flex items-center justify-center bg-gray-50 relative">
          <span class="mini mono text-gray-500">${tileId}</span>
          ${tileId === 'A1' ? '<div class="absolute bottom-1 right-1 mini font-bold text-[8px] bg-yellow-200 px-0.5">1.0" TEST</div>' : ''}
        </div>
        <div class="mini text-gray-500 mono">ALIGN ALONG CROSSHAIR MARKS</div>
      `;
      preview.appendChild(card);
    }
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

function attachHelpClickListeners(container) {
  container.querySelectorAll('.btn-help').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.currentTarget.getAttribute('data-help');
      showGuideModal('Step Guidance', HELP_GUIDANCE[key] || 'Follow step instructions to complete pattern drafting.');
    });
  });
}

function showGuideModal(title, htmlContent) {
  const modal = document.getElementById('guideModal');
  const content = document.getElementById('guideModalContent');
  if (!modal || !content) return;
  const titleEl = modal.querySelector('.mono.text-sm');
  if (titleEl) titleEl.textContent = title;
  content.innerHTML = htmlContent;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function hideGuideModal() {
  const modal = document.getElementById('guideModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

document.addEventListener('DOMContentLoaded', initApp);
