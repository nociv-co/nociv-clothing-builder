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

export function draftTrouserPattern(values, cut = 'straight', zoom = 1.0) {
  const p = values;
  const s = svgRoot(42, 48, zoom);
  txt(s, 1, 1.2, `NOCIV // TROUSER BLOCK (${cut.toUpperCase()})`, 0.65, 900);

  const w = (p.waist + p.waistEase) / 4;
  const h = (p.hip + p.hipEase) / 4;
  const fExt = (p.hip + p.hipEase) / 16;
  const bExt = ((p.hip + p.hipEase) / 8) + 0.5;
  const rise = p.rise;
  const inseam = p.inseam;
  const totalLen = rise + inseam;
  const kneeY = rise + (inseam * 0.5);
  const hemY = totalLen;
  const sa = p.sa;

  // FRONT LEG PATTERN PIECE
  const cx = 11;
  const sy = 4;

  const fWaistL = cx - (w * 0.5) - 0.25;
  const fWaistR = cx + (w * 0.5) - 0.25;
  const fHipR = cx + (h * 0.5);
  const fCrotchL = cx - (fExt + (h * 0.5));
  const fKneeL = cx - (p.knee / 4);
  const fKneeR = cx + (p.knee / 4);
  const fHemL = cx - (p.hem / 4);
  const fHemR = cx + (p.hem / 4);

  const fNetD = `
    M ${fWaistL} ${sy}
    L ${fWaistR} ${sy}
    C ${fHipR} ${sy + (rise * 0.5)}, ${fHipR} ${sy + (rise * 0.8)}, ${fKneeR} ${sy + kneeY}
    L ${fHemR} ${sy + hemY}
    L ${fHemL} ${sy + hemY}
    L ${fKneeL} ${sy + kneeY}
    C ${fCrotchL + 0.5} ${sy + rise + 0.8}, ${fCrotchL} ${sy + rise + 0.2}, ${fCrotchL} ${sy + rise}
    C ${cx - 0.5} ${sy + rise - 0.5}, ${cx - 0.25} ${sy + (rise * 0.5)}, ${fWaistL} ${sy}
    Z
  `;
  mkPath(s, fNetD, '#DC2626', 'none', '0.15 0.15', 0.06);

  const fCutD = `
    M ${fWaistL - sa} ${sy - sa}
    L ${fWaistR + sa} ${sy - sa}
    C ${fHipR + sa} ${sy + (rise * 0.5)}, ${fHipR + sa} ${sy + (rise * 0.8)}, ${fKneeR + sa} ${sy + kneeY}
    L ${fHemR + sa} ${sy + hemY + sa}
    L ${fHemL - sa} ${sy + hemY + sa}
    L ${fKneeL - sa} ${sy + kneeY}
    C ${fCrotchL - sa} ${sy + rise + 0.8}, ${fCrotchL - sa} ${sy + rise + 0.2}, ${fCrotchL - sa} ${sy + rise}
    C ${cx - 0.5 - sa} ${sy + rise - 0.5}, ${cx - 0.25 - sa} ${sy + (rise * 0.5)}, ${fWaistL - sa} ${sy - sa}
    Z
  `;
  mkPath(s, fCutD, '#000', 'none', '', 0.08);

  line(s, cx, sy + 0.5, cx, sy + hemY - 0.5, '#2563EB', '', 0.05);
  txt(s, cx, sy + (rise * 0.8), 'FRONT TROUSER BLOCK', 0.4, 900, '#000', 'middle');
  txt(s, cx, sy + (rise * 0.8) + 0.6, 'CUT 1 PAIR IN FABRIC', 0.28, 700, '#555', 'middle');
  txt(s, cx + 0.2, sy + (rise + inseam * 0.25), 'GRAINLINE', 0.22, 700, '#2563EB');

  // BACK LEG PATTERN PIECE
  const bx = 28;
  const bTiltX = 1.75;
  const bTiltY = 1.5;

  const bWaistL = bx - (w * 0.5) + bTiltX;
  const bWaistR = bx + (w * 0.5) + 0.75;
  const bHipR = bx + (h * 0.5) + 0.5;
  const bCrotchL = bx - (bExt + (h * 0.5));
  const bKneeL = bx - (p.knee / 4) - 0.5;
  const bKneeR = bx + (p.knee / 4) + 0.5;
  const bHemL = bx - (p.hem / 4) - 0.5;
  const bHemR = bx + (p.hem / 4) + 0.5;

  const bNetD = `
    M ${bWaistL} ${sy - bTiltY}
    L ${bWaistR} ${sy}
    C ${bHipR} ${sy + (rise * 0.5)}, ${bHipR} ${sy + (rise * 0.8)}, ${bKneeR} ${sy + kneeY}
    L ${bHemR} ${sy + hemY}
    L ${bHemL} ${sy + hemY}
    L ${bKneeL} ${sy + kneeY}
    C ${bCrotchL + 1.0} ${sy + rise + 1.2}, ${bCrotchL} ${sy + rise + 0.3}, ${bCrotchL} ${sy + rise + 0.5}
    C ${bx - 1.0} ${sy + rise - 0.2}, ${bx - 0.2} ${sy + (rise * 0.5)}, ${bWaistL} ${sy - bTiltY}
    Z
  `;
  mkPath(s, bNetD, '#DC2626', 'none', '0.15 0.15', 0.06);

  const bCutD = `
    M ${bWaistL - sa} ${sy - bTiltY - sa}
    L ${bWaistR + sa} ${sy - sa}
    C ${bHipR + sa} ${sy + (rise * 0.5)}, ${bHipR + sa} ${sy + (rise * 0.8)}, ${bKneeR + sa} ${sy + kneeY}
    L ${bHemR + sa} ${sy + hemY + sa}
    L ${bHemL - sa} ${sy + hemY + sa}
    L ${bKneeL - sa} ${sy + kneeY}
    C ${bCrotchL - sa} ${sy + rise + 1.2}, ${bCrotchL - sa} ${sy + rise + 0.3}, ${bCrotchL - sa} ${sy + rise + 0.5}
    C ${bx - 1.0 - sa} ${sy + rise - 0.2}, ${bx - 0.2 - sa} ${sy + (rise * 0.5)}, ${bWaistL - sa} ${sy - bTiltY - sa}
    Z
  `;
  mkPath(s, bCutD, '#000', 'none', '', 0.08);

  const dX = (bWaistL + bWaistR) / 2;
  line(s, dX, sy - (bTiltY * 0.5), dX, sy + 3.2, '#DC2626', '0.1 0.1', 0.05);

  line(s, bx, sy + 0.5, bx, sy + hemY - 0.5, '#2563EB', '', 0.05);
  txt(s, bx, sy + (rise * 0.8), 'BACK TROUSER BLOCK', 0.4, 900, '#000', 'middle');
  txt(s, bx, sy + (rise * 0.8) + 0.6, 'CUT 1 PAIR IN FABRIC', 0.28, 700, '#555', 'middle');

  addScaleSquare(s, 1, 44);
  return s;
}

export function draftTrouserFlat(values, cut = 'straight', zoom = 1.0) {
  const p = values;
  const s = svgRoot(28, 36, zoom);
  txt(s, 1, 1.2, `NOCIV // TECHNICAL FLAT - TROUSERS (${cut.toUpperCase()})`, 0.65, 900);
  const w = (p.waist + p.waistEase) / 4;
  const h = (p.hip + p.hipEase) / 4;
  const len = p.rise + p.inseam;
  const fx = 6, sy = 4;

  const path = `M ${fx} ${sy} L ${fx + w} ${sy + 0.2} C ${fx + h * 1.1} ${sy + p.rise * 0.5}, ${fx + (p.hem / 4)} ${sy + len * 0.6}, ${fx + (p.hem / 4)} ${sy + len} L ${fx} ${sy + len} Z`;
  mkPath(s, path, '#000', '#fff', '', 0.1);
  txt(s, fx + h / 2, sy + len + 1, 'FRONT DESIGN FLAT', 0.4, 900, '#000', 'middle');
  addScaleSquare(s, 1, 32);
  return s;
}
