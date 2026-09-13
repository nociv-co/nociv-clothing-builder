export function renderPatternSVG(selector, pattern) {
  const svg = document.querySelector(selector);
  if (!svg) return;
  
  svg.innerHTML = '';

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '100');
  rect.setAttribute('y', '100');
  rect.setAttribute('width', (pattern.frontWidth || 20) * 10);
  rect.setAttribute('height', (pattern.length || 30) * 10);
  rect.setAttribute('stroke', '#00ffcc');
  rect.setAttribute('fill', 'none');
  rect.setAttribute('stroke-width', '2');

  svg.appendChild(rect);
}
