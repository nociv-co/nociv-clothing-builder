import { generatePattern } from './engine/drafting.js';
import { renderPatternSVG } from './engine/export.js';

const form = document.getElementById('measurement-form');

form.addEventListener('submit', (e) => {
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
