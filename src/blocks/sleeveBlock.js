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

export function draftSleevePattern(values, zoom) {
  const p = values;
  const s = svgRoot(30, 28, zoom);
  txt(s, 1, 1.2, 'NOCIV // SET-IN SLEEVE PATTERN BLOCK', 0.65, 900);

  const armD = 9.5;
  const capHeight = armD * 0.62;
  const bicepW = 14.5 + (p.bicepEase || 2.0);
  const slLen = 9.0;
  const hemW = 12.0;
  const cx = 15, sy = 4;
  const sa = p.sa || 0.5;

  const sNetD = `
    M ${cx - (bicepW * 0.5)} ${sy + capHeight}
    C ${cx - (bicepW * 0.5) + 1.5} ${sy + (capHeight * 0.8)}, ${cx - 2.5} ${sy - 0.5}, ${cx} ${sy}
    C ${cx + 2.5} ${sy - 0.5}, ${cx + (bicepW * 0.5) - 1.5} ${sy + (capHeight * 0.8)}, ${cx + (bicepW * 0.5)} ${sy + capHeight}
    L ${cx + (hemW * 0.5)} ${sy + slLen}
    L ${cx - (hemW * 0.5)} ${sy + slLen}
    Z
  `;
  mkPath(s, sNetD, '#DC2626', 'none', '0.15 0.15', 0.06);

  const sCutD = `
    M ${cx - (bicepW * 0.5) - sa} ${sy + capHeight + sa}
    C ${cx - (bicepW * 0.5) + 1.5} ${sy + (capHeight * 0.8)}, ${cx - 2.5} ${sy - sa}, ${cx} ${sy - sa}
    C ${cx + 2.5} ${sy - sa}, ${cx + (bicepW * 0.5) - 1.5} ${sy + (capHeight * 0.8)}, ${cx + (bicepW * 0.5) + sa} ${sy + capHeight + sa}
    L ${cx + (hemW * 0.5) + sa} ${sy + slLen + sa}
    L ${cx - (hemW * 0.5)} - sa} ${sy + slLen + sa}
    Z
  `;
  mkPath(s, sCutD, '#000', 'none', '', 0.08);

  line(s, cx, sy + 0.5, cx, sy + slLen - 0.5, '#2563EB', '', 0.05);
  txt(s, cx, sy + (slLen * 0.5), 'SLEEVE BLOCK (CUT 1 PAIR)', 0.35, 900, '#000', 'middle');

  addScaleSquare(s, 1, 24);
  return s;
}
