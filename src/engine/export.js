export function exportScaledSVG(svgElement) {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NOCIV_Pattern_${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function exportTechPackJSON(state) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const a = document.createElement('a');
  a.href = dataStr;
  a.download = `NOCIV_TechPack_${state.base}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function calculateTiles(state) {
  const cols = state.base === 'pants' ? 4 : 3;
  const rows = state.base === 'pants' ? 3 : 2;
  return { cols, rows, total: cols * rows };
}
