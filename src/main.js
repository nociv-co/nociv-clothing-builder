import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { renderDraftingCanvas } from './engine/drafting.js';
import { exportScaledSVG, exportTechPackJSON, calculateTiles } from './engine/export.js';

// Supabase Initialization
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BASES = {
  pants: { name: 'TROUSER / PANTS', tag: 'BESPOKE BOTTOMS BLOCK' },
  tshirt: { name: 'TOP / T-SHIRT', tag: 'BESPOKE UPPER BODY BLOCK' },
  sleeve: { name: 'SET-IN SLEEVE', tag: 'ARMHOLE-MATCHED SLEEVE' }
};

const defaults = {
  pants: { waist: 32, hip: 40, rise: 11.5, inseam: 30, thigh: 24, knee: 18, hem: 16, waistEase: 1.0, hipEase: 3.0, style: 'tailored', frontPocket: 'slash', backPocket: 'square', sa: 0.5 },
  tshirt: { chest: 40, length: 28, shoulder: 18, sleeveLen: 9, armholeDepth: 9.5, neckCirc: 16.5, chestEase: 4.0, silhouette: 'regular', sa: 0.5 },
  sleeve: { bicepEase: 2.0, capEase: 0.75, sa: 0.5 }
};

const presetsPants = {
  S: { waist: 28, hip: 36, rise: 10.5, inseam: 29, thigh: 22, knee: 16, hem: 14.5 },
  M: { waist: 32, hip: 40, rise: 11.5, inseam: 30, thigh: 24, knee: 18, hem: 16 },
  L: { waist: 36, hip: 44, rise: 12.25, inseam: 31, thigh: 26, knee: 19.5, hem: 17 },
  XL: { waist: 40, hip: 48, rise: 13.0, inseam: 31, thigh: 28, knee: 21, hem: 18 }
};

const presetsTee = {
  S: { chest: 36, length: 26, shoulder: 16.5, sleeveLen: 8.0, armholeDepth: 8.5, neckCirc: 15.5 },
  M: { chest: 40, length: 28, shoulder: 18.0, sleeveLen: 9.0, armholeDepth: 9.5, neckCirc: 16.5 },
  L: { chest: 44, length: 29.5, shoulder: 19.5, sleeveLen: 9.5, armholeDepth: 10.25, neckCirc: 17.5 },
  XL: { chest: 48, length: 31, shoulder: 21.0, sleeveLen: 10.0, armholeDepth: 11.0, neckCirc: 18.5 }
};

const state = {
  base: 'pants',
  mode: 'pattern',
  zoom: 1.0,
  showBodyOverlay: true,
  values: JSON.parse(JSON.stringify(defaults.pants))
};

function renderBaseButtons() {
  const wrap = document.getElementById('baseButtons');
  if (!wrap) return;
  wrap.innerHTML = '';
  Object.entries(BASES).forEach(([k, b]) => {
    const btn = document.createElement('button');
    btn.className = `btn text-left p-2 ${state.base === k ? 'active' : ''}`;
    btn.innerHTML = `<b>${b.name}</b><span class="block mini opacity-70">${b.tag}</span>`;
    btn.onclick = () => selectBase(k);
    wrap.appendChild(btn);
  });
}

function selectBase(k) {
  state.base = k;
  state.values = JSON.parse(JSON.stringify(defaults[k]));
  renderBaseButtons();
  renderControls();
  render();
}

function sliderField(key, label, min, max, step = 0.25, unit = 'in') {
  const v = state.values[key] !== undefined ? state.values[key] : 0;
  return `<div class="mb-3.5">
    <div class="flex justify-between mb-1">
      <span class="mini font-bold uppercase">${label}</span>
      <span id="read-${key}" class="mono text-xs font-black">${Number(v).toFixed(step < 1 ? 2 : 1)}${unit}</span>
    </div>
    <input type="range" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${v}" class="slider-input w-full">
    <div class="flex justify-between mini text-gray-500"><span>${min}${unit}</span><span>${max}${unit}</span></div>
  </div>`;
}

function selectField(key, label, opts) {
  return `<label class="block mb-3">
    <span class="mini font-bold uppercase block mb-1">${label}</span>
    <select data-key="${key}" class="select-input field">
      ${opts.map(([v, t]) => `<option value="${v}" ${state.values[key] === v ? 'selected' : ''}>${t}</option>`).join('')}
    </select>
  </label>`;
}

function presetButtons() {
  return `<div class="border2 bg-white p-3 mb-4 shadow1">
    <div class="section-title mb-2">Standard Size Presets</div>
    <div class="grid grid-cols-4 gap-1">
      ${['S', 'M', 'L', 'XL'].map(s => `<button class="btn btn-preset py-1 text-xs" data-preset="${s}">${s}</button>`).join('')}
    </div>
  </div>`;
}

function renderControls() {
  const c = document.getElementById('controls');
  if (!c) return;
  let h = '';
  if (state.base === 'pants') {
    h += presetButtons();
    h += `<div class="section-title mb-2">Anatomical Body Measurements</div>`;
    h += sliderField('waist', 'Natural Waist Circumference', 24, 56, .25);
    h += sliderField('hip', 'Seat / Hip Circumference', 30, 64, .25);
    h += sliderField('rise', 'Front Rise Depth', 8, 16, .25);
    h += sliderField('inseam', 'Inseam Length', 24, 38, .25);
    h += sliderField('thigh', 'Thigh Circumference', 18, 36, .25);
    h += sliderField('knee', 'Knee Circumference', 12, 28, .25);
    h += sliderField('hem', 'Hem Leg Opening', 10, 26, .25);

    h += `<div class="section-title mt-5 mb-2">Pattern Structural Ease</div>`;
    h += sliderField('waistEase', 'Waist Ease Allowance', 0, 4, .25);
    h += sliderField('hipEase', 'Seat Ease Allowance', 1, 8, .25);

    h += `<div class="section-title mt-5 mb-2">Seam &amp; Style Construction</div>`;
    h += selectField('style', 'Leg Cut Profile', [['tailored', 'Tailored / Tapered'], ['straight', 'Straight Workwear'], ['wide', 'Wide Leg']]);
    h += selectField('frontPocket', 'Front Pocket Construction', [['slash', 'Bespoke Slash Pocket'], ['none', 'No Pocket']]);
    h += sliderField('sa', 'Seam Allowance (SA)', 0, .75, .125);
  } else if (state.base === 'tshirt') {
    h += presetButtons();
    h += `<div class="section-title mb-2">Anatomical Body Measurements</div>`;
    h += sliderField('chest', 'Chest Circumference', 30, 60, .25);
    h += sliderField('length', 'Garment Length (HPS to Hem)', 20, 36, .25);
    h += sliderField('shoulder', 'Cross Shoulder Width', 14, 24, .25);
    h += sliderField('sleeveLen', 'Sleeve Length', 4, 18, .25);
    h += sliderField('armholeDepth', 'Armhole Depth (Scye Depth)', 7, 14, .25);
    h += sliderField('neckCirc', 'Neck Circumference', 12, 22, .25);

    h += `<div class="section-title mt-5 mb-2">Pattern Structural Ease</div>`;
    h += sliderField('chestEase', 'Chest Structural Ease', 1, 10, .25);
    h += selectField('silhouette', 'Fit Silhouette', [['regular', 'Regular Fit'], ['boxy', 'Boxy Oversized'], ['slim', 'Slim Tailored']]);
    h += sliderField('sa', 'Seam Allowance (SA)', 0, .75, .125);
  } else {
    h += `<div class="section-title mb-2">Sleeve Cap Parameters</div>`;
    h += sliderField('bicepEase', 'Bicep Ease Allowance', 1, 5, .25);
    h += sliderField('capEase', 'Sleeve Cap Ease (Set-in)', 0.25, 1.5, .125);
    h += sliderField('sa', 'Seam Allowance (SA)', 0, .75, .125);
  }
  c.innerHTML = h;

  // Attach control listeners
  document.querySelectorAll('.slider-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const k = e.target.getAttribute('data-key');
      const v = parseFloat(e.target.value);
      state.values[k] = v;
      const read = document.getElementById('read-' + k);
      if (read) read.textContent = v.toFixed(v % 1 ? 2 : 1) + 'in';
      render();
    });
  });

  document.querySelectorAll('.select-input').forEach(select => {
    select.addEventListener('change', (e) => {
      const k = e.target.getAttribute('data-key');
      state.values[k] = e.target.value;
      render();
    });
  });

  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const s = e.target.getAttribute('data-preset');
      const src = state.base === 'tshirt' ? presetsTee[s] : presetsPants[s];
      if (src) Object.assign(state.values, src);
      renderControls();
      render();
    });
  });
}

function render() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  canvas.innerHTML = '';
  const svg = renderDraftingCanvas(state);
  canvas.appendChild(svg);

  const tiles = calculateTiles(state);
  const tileLabel = document.getElementById('tileSizeEst');
  if (tileLabel) {
    tileLabel.textContent = state.mode === 'flat' 
      ? 'ESTIMATED TILES: 1 Page (Design Spec)' 
      : `ESTIMATED TILES: ${tiles.total} Pages (${tiles.cols}x${tiles.rows} US Letter / A4)`;
  }
}

// UI Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
  renderBaseButtons();
  renderControls();
  render();

  document.getElementById('modeFlat')?.addEventListener('click', () => {
    state.mode = 'flat';
    document.getElementById('modeFlat').classList.add('active');
    document.getElementById('modePattern').classList.remove('active');
    document.getElementById('legendText').textContent = 'TECH FLAT VIEW · BLACK = OUTER GARMENT · BLUE DASH = SLOPER BASELINE';
    render();
  });

  document.getElementById('modePattern')?.addEventListener('click', () => {
    state.mode = 'pattern';
    document.getElementById('modePattern').classList.add('active');
    document.getElementById('modeFlat').classList.remove('active');
    document.getElementById('legendText').textContent = 'PRODUCTION PATTERN · BLACK = CUT LINE · RED DASH = SEAM LINE · BLUE = GRAIN / DRILL MARKS';
    render();
  });

  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    state.zoom = Math.min(2.5, state.zoom + 0.1);
    document.getElementById('zoomLabel').textContent = Math.round(state.zoom * 100) + '%';
    render();
  });

  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    state.zoom = Math.max(0.3, state.zoom - 0.1);
    document.getElementById('zoomLabel').textContent = Math.round(state.zoom * 100) + '%';
    render();
  });

  document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
    state.zoom = 1.0;
    document.getElementById('zoomLabel').textContent = '100%';
    render();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    state.values = JSON.parse(JSON.stringify(defaults[state.base]));
    renderControls();
    render();
  });

  document.getElementById('btn-export-svg')?.addEventListener('click', () => {
    const svgEl = document.querySelector('#canvas svg');
    exportScaledSVG(svgEl);
  });

  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    exportTechPackJSON(state);
  });

  document.getElementById('btn-guide')?.addEventListener('click', () => {
    document.getElementById('guideModal').classList.remove('hidden');
    document.getElementById('guideModal').classList.add('flex');
  });

  document.getElementById('btn-close-guide')?.addEventListener('click', () => {
    document.getElementById('guideModal').classList.add('hidden');
  });

  document.getElementById('btn-understand-guide')?.addEventListener('click', () => {
    document.getElementById('guideModal').classList.add('hidden');
  });

  document.getElementById('btn-print-modal')?.addEventListener('click', () => {
    const tiles = calculateTiles(state);
    const summary = document.getElementById('printSummary');
    if (summary) {
      summary.innerText = `TOTAL PRINT PAGES: ${tiles.total} TILES (${tiles.cols} COLUMNS x ${tiles.rows} ROWS)`;
    }
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal').classList.add('flex');
  });

  document.getElementById('btn-close-modal')?.addEventListener('click', () => {
    document.getElementById('modal').classList.add('hidden');
  });

  document.getElementById('btn-cancel-print')?.addEventListener('click', () => {
    document.getElementById('modal').classList.add('hidden');
  });

  document.getElementById('btn-execute-print')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-save-db')?.addEventListener('click', async () => {
    const { data, error } = await supabase.from('garment_projects').insert([{
      archetype: state.base,
      base_block: state.mode,
      fit_config: state.values,
      style_config: { zoom: state.zoom }
    }]);
    if (error) alert('Error saving to Supabase: ' + error.message);
    else alert('Successfully saved project draft to Supabase!');
  });
});
