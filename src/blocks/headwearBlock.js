export function draftHeadwearPattern(values, cut = 'cadet_hat', zoom = 1.0) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const scale = 30 * zoom;
  svg.setAttribute('width', `${800 * zoom}`);
  svg.setAttribute('height', `${600 * zoom}`);
  svg.setAttribute('viewBox', `0 0 ${800 * zoom} ${600 * zoom}`);

  let pathData = '';
  let labelText = '';

  if (cut === 'cadet_hat') {
    labelText = 'CADET HAT // CROWN & VISOR PANELS';
    pathData = `
      M 50 100 H 250 V 200 H 50 Z
      M 280 100 Q 380 50 480 100 Q 380 180 280 100 Z
    `;
  } else {
    labelText = 'BEANIE / SKULLY // DARTED PANELS';
    pathData = `
      M 60 250 Q 120 50 180 250 Z
      M 200 250 Q 260 50 320 250 Z
      M 340 250 Q 400 50 460 250 Z
      M 480 250 Q 540 50 600 250 Z
    `;
  }

  svg.innerHTML = `
    <g transform="scale(${zoom})">
      <path d="${pathData}" fill="none" stroke="#000000" stroke-width="2" />
      <path d="${pathData}" fill="none" stroke="#FF0000" stroke-width="1" stroke-dasharray="4 4" transform="translate(4,4)" />
      <text x="50" y="40" font-family="monospace" font-size="14" font-weight="bold">${labelText}</text>
      <text x="50" y="60" font-family="monospace" font-size="10" fill="#666">CUT 1 PAIR IN FABRIC · SA: ${values.sa || 0.5}"</text>
    </g>
  `;
  return svg;
}

export function draftHeadwearFlat(values, cut = 'cadet_hat', zoom = 1.0) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', `${400 * zoom}`);
  svg.setAttribute('height', `${400 * zoom}`);
  svg.setAttribute('viewBox', '0 0 400 400');

  svg.innerHTML = `
    <g transform="scale(${zoom})">
      <rect x="100" y="120" width="200" height="100" rx="15" fill="#E5E7EB" stroke="#000" stroke-width="2" />
      <path d="M 100 200 Q 200 250 300 200" fill="none" stroke="#000" stroke-width="3" />
      <text x="140" y="110" font-family="monospace" font-size="12" font-weight="bold">${cut.toUpperCase()} TECH FLAT</text>
    </g>
  `;
  return svg;
}
