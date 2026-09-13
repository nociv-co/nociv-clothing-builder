export function renderPatternSVG(selector, pattern) {
  const svg = document.querySelector(selector);
  svg.innerHTML = '';

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '100');
  rect.setAttribute('y', '100');
  rect.setAttribute('width', pattern.frontWidth * 10 || 200);
  rect.setAttribute('height', pattern.length * 10 || 400);
  rect.setAttribute('stroke', '#00ffcc');
  rect.setAttribute('fill', 'none');
  rect.setAttribute('stroke-width', '2');

  svg.appendChild(rect);
}
