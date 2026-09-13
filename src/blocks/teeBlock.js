const NS = 'http://www.w3.org/2000/svg';

function svgRoot(wInches, hInches, zoom) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('xmlns', NS);
  s.setAttribute('width', `${wInches * zoom * 28}px`);
  s.setAttribute('height', `${hInches * zoom * 28}px`);
  s.setAttribute('viewBox', `0 0 ${wInches} ${hInches}`);
  s.style.maxWidth = 'none';
  return s;
}

function mkPath(svg, d, stroke = '#000', fill = 'none', dash = '', strokeWidth = 0.08) {
  const n = document.createElementNS(NS, 'path');
  n.setAttribute('d', d);
  n.setAttribute('stroke', stroke);
  n.setAttribute('fill', fill);
  n.setAttribute('stroke-width', strokeWidth);
  if (dash) n.setAttribute('stroke-dasharray', dash);
  svg.appendChild(n);
  return n;
}

function line(svg, x1, y1, x2, y2, stroke = '#000', dash = '', strokeWidth = 0.06) {
  const n = document.createElementNS(NS, 'line');
  n.setAttribute('x1', x1); n.setAttribute('y1', y1);
  n.setAttribute('x2', x2); n.setAttribute('y2', y2);
  n.setAttribute('stroke', stroke);
  n.setAttribute('stroke-width', strokeWidth);
  if (dash) n.setAttribute('stroke-dasharray', dash);
  svg.appendChild(n);
  return n;
}

function txt(svg, x, y, t, size = 0.35, weight = 700, fill = '#000', anchor = 'start') {
  const n = document.createElementNS(NS, 'text');
  n.setAttribute('x', x); n.setAttribute('y', y);
  n.setAttribute('font-family', 'JetBrains Mono, monospace');
  n.setAttribute('font-size', size);
  n.setAttribute('font-weight', weight);
  n.setAttribute('fill', fill);
  n.setAttribute('text-anchor', anchor);
  n.textContent = t;
  svg.appendChild(n);
  return n;
}

function addScaleSquare(svg, x, y) {
  const group = document.createElementNS(NS, 'g');
  const rect = document.createElementNS(NS, 'rect');
  rect.setAttribute('x', x); rect.setAttribute('y', y);
  rect.setAttribute('width', 1.0); rect.setAttribute('height', 1.0);
  rect.setAttribute('stroke', '#000'); rect.setAttribute('fill', '#fff6bf');
  rect.setAttribute('stroke-width', 0.05);
  group.appendChild(rect);
  svg.appendChild(group);

  txt(svg, x + 0.5, y + 0.4, '1.00 IN', 0.2, 900, '#000', 'middle');
  txt(svg, x + 0.5, y + 0.7, 'CALIBRATION', 0.14, 700, '#000', 'middle');
}

export function draftTeePattern(values, cut = 'boxy', zoom = 1.0) {
  const p = values;
  const s = svgRoot(38, 42, zoom);
  txt(s, 1, 1.2, `NOCIV // UPPER BODY BLOCK (${cut.toUpperCase()})`, 0.65, 900);

  const chestQ = (p.chest + p.chestEase) / 4;
  const shHalf = p.shoulder / 2;
  const neckW = (p.neckCirc / 6) + 0.25;
  const fNeckD = neckW + 0.5;
  const bNeckD = 0.85;
  const shSlope = 1.75;
  const armD = p.armholeDepth;
  const sa = p.sa;

  // FRONT PATTERN PIECE
  const fx = 2, sy = 4;

  const fNetD = `
    M ${fx} ${sy + fNeckD}
    C ${fx} ${sy + (fNeckD * 0.5)}, ${fx + (neckW * 0.4)} ${sy}, ${fx + neckW} ${sy}
    L ${fx + shHalf} ${sy + shSlope}
    C ${fx + shHalf - 0.8} ${sy + (armD * 0.5)}, ${fx + chestQ - 0.5} ${sy + (armD * 0.8)}, ${fx + chestQ} ${sy + armD}
    L ${fx + chestQ} ${sy + p.length}
    L ${fx} ${sy + p.length}
    Z
  `;
  mkPath(s, fNetD, '#DC2626', 'none', '0.15 0.15', 0.06);

  const fCutD = `
    M ${fx} ${sy + fNeckD - sa}
    C ${fx} ${sy + (fNeckD * 0.5)}, ${fx + (neckW * 0.4)} ${sy - sa}, ${fx + neckW} ${sy - sa}
    L ${fx + shHalf + sa} ${sy + shSlope - sa}
    C ${fx + shHalf + sa} ${sy + (armD * 0.5)}, ${fx + chestQ + sa} ${sy + (armD * 0.8)}, ${fx + chestQ + sa} ${sy + armD + sa}
    L ${fx + chestQ + sa} ${sy + p.length + sa}
    L ${fx} ${sy + p.length + sa}
    Z
  `;
  mkPath(s, fCutD, '#000', 'none', '', 0.08);

  line(s, fx, sy + 0.5, fx, sy + p.length - 0.5, '#2563EB', '', 0.08);
  txt(s, fx + 0.3, sy + (p.length * 0.5), 'CENTER FRONT - PLACE ON FOLD', 0.28, 900, '#2563EB');
  txt(s, fx + (chestQ * 0.5), sy + (p.length * 0.3), 'FRONT BODY BLOCK', 0.4, 900, '#000', 'middle');

  // BACK PATTERN PIECE
  const bx = 20;

  const bNetD = `
    M ${bx} ${sy + bNeckD}
    C ${bx} ${sy + (bNeckD * 0.3)}, ${bx + (neckW * 0.5)} ${sy}, ${bx + neckW} ${sy}
    L ${bx + shHalf} ${sy + shSlope - 0.2}
    C ${bx + shHalf - 0.4} ${sy + (armD * 0.5)}, ${bx + chestQ - 0.2} ${sy + (armD * 0.8)}, ${bx + chestQ} ${sy + armD}
    L ${bx + chestQ} ${sy + p.length}
    L ${bx} ${sy + p.length}
    Z
  `;
  mkPath(s, bNetD, '#DC2626', 'none', '0.15 0.15', 0.06);

  const bCutD = `
    M ${bx} ${sy + bNeckD - sa}
    C ${bx} ${sy + (bNeckD * 0.3)}, ${bx + (neckW * 0.5)} ${sy - sa}, ${bx + neckW} ${sy - sa}
    L ${bx + shHalf + sa} ${sy + shSlope - 0.2 - sa}
    C ${bx + shHalf + sa} ${sy + (armD * 0.5)}, ${bx + chestQ + sa} ${sy + (armD * 0.8)}, ${bx + chestQ + sa} ${sy + armD + sa}
    L ${bx + chestQ + sa} ${sy + p.length + sa}
    L ${bx} ${sy + p.length + sa}
    Z
  `;
  mkPath(s, bCutD, '#000', 'none', '', 0.08);

  line(s, bx, sy + 0.5, bx, sy + p.length - 0.5, '#2563EB', '', 0.08);
  txt(s, bx + 0.3, sy + (p.length * 0.5), 'CENTER BACK - PLACE ON FOLD', 0.28, 900, '#2563EB');
  txt(s, bx + (chestQ * 0.5), sy + (p.length * 0.3), 'BACK BODY BLOCK', 0.4, 900, '#000', 'middle');

  addScaleSquare(s, 1, 38);
  return s;
}

export function draftTeeFlat(values, cut = 'boxy', zoom = 1.0) {
  const p = values;
  const s = svgRoot(28, 32, zoom);
  txt(s, 1, 1.2, `NOCIV // TECHNICAL FLAT - TOP (${cut.toUpperCase()})`, 0.65, 900);
  const c = (p.chest + p.chestEase) / 4;
  const fx = 6, sy = 4;

  const path = `M ${fx} ${sy + 1.2} Q ${fx + 2} ${sy + 1.5}, ${fx + 3} ${sy} L ${fx + (p.shoulder / 2)} ${sy + 0.6} L ${fx + c} ${sy + p.armholeDepth} L ${fx + c} ${sy + p.length} L ${fx} ${sy + p.length} Z`;
  mkPath(s, path, '#000', '#fff', '', 0.1);
  txt(s, fx + c / 2, sy + p.length + 1, 'FRONT DESIGN FLAT', 0.4, 900, '#000', 'middle');
  addScaleSquare(s, 1, 28);
  return s;
}
