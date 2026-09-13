import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { generatePattern } from './engine/drafting.js';
import { renderPatternSVG } from './engine/export.js';

// Replace placeholders with your credentials from Supabase Dashboard > Settings > API
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('measurement-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const rawMeasurements = Object.fromEntries(formData.entries());
  const archetype = document.getElementById('archetype').value;

  const { pattern, confidence } = generatePattern(
    archetype,
    rawMeasurements,
    { leg: 'straight' },
    { waistEase: 1 }
  );

  renderPatternSVG('#pattern-canvas', pattern);
  document.getElementById('fit-score').innerText = `Confidence Score: ${confidence.score}%`;
});
