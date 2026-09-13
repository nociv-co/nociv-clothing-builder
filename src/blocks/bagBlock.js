export function draftBagPattern(values, cut = 'tote_regular', zoom = 1.0) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', `${800 * zoom}`);
  svg.setAttribute('height', `${600 * zoom}`);
  svg.setAttribute('viewBox', `0 0 ${800 * zoom} ${600 * zoom}`);

  let pathData = '';
  let labelText = '';

  if (cut.includes('tote')) {
    labelText = cut === 'tote_mini' ? 'MINI TOTE BAG // MAIN PANEL' : 'REGULAR TOTE BAG // MAIN BODY & STRAPS';
    pathData = `
      M 80 80 H 380 V 480 H 80 Z
      M 420 80 H 460 V 480 H 420 Z
      M 480 80 H 520 V 480 H 480 Z
    `;
  } else if (cut === 'fanny_pack') {
    labelText = 'FANNY PACK // DOUBLE STRAP BODY';
    pathData = `
      M 60 120 Q 250 80 440 120 L 400 280 Q 250 320 100 280 Z
      M 460 140 H 620 V 180 H 460 Z
    `;
  } else {
    labelText = 'CAMPER FLAP BACKPACK // BODY, FLAP & POCKETS';
    pathData = `
      M 60 60 H 340 V 440 H 60 Z
      M 370 60 Q 470 20 570 60 V 220 H 370 Z
    `;
  }

  svg.innerHTML = `
    <g transform="scale(${zoom})">
      <path d="${pathData}" fill="none" stroke="#000000" stroke-width="2" />
      <path d="${pathData}" fill="none" stroke="#FF0000" stroke-width="1" stroke-dasharray="4 4" transform="translate(5,5)" />
      <text x="60" y="35" font-family="monospace" font-size="14" font-weight="bold">${labelText}</text>
      <text x="60" y="52" font-family="monospace" font-size="10" fill="#666">SEAM ALLOWANCE: ${values.sa || 0.5}" INCLUDED</text>
    </g>
  `;
  return svg;
}

export function draftBagFlat(values, cut = 'tote_regular', zoom = 1.0) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', `${400 * zoom}`);
  svg.setAttribute('height', `${400 * zoom}`);
  svg.setAttribute('viewBox', '0 0 400 400');

  svg.innerHTML = `
    <g transform="scale(${zoom})">
      <rect x="100" y="140" width="200" height="200" fill="#F3F4F6" stroke="#000" stroke-width="2" />
      <path d="M 140 140 V 80 H 170 V 140 M 230 140 V 80 H 260 V 140" fill="none" stroke="#000" stroke-width="2" />
      <text x="120" y="60" font-family="monospace" font-size="12" font-weight="bold">${cut.toUpperCase()} TECH FLAT</text>
    </g>
  `;
  return svg;
}
