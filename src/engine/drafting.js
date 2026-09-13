import { draftTrouserPattern, draftTrouserFlat } from '../blocks/trouserBlock.js';
import { draftTeePattern, draftTeeFlat } from '../blocks/teeBlock.js';
import { draftHeadwearPattern, draftHeadwearFlat } from '../blocks/headwearBlock.js';
import { draftBagPattern, draftBagFlat } from '../blocks/bagBlock.js';

/**
 * Renders drafting canvas SVG element and attaches real-world pattern bounding attributes
 */
export function renderDraftingCanvas(state) {
  const archetype = state.archetype || 'pants';
  const cut = state.selectedCut || 'straight';
  const values = state.values;
  const zoom = state.zoom || 1.0;

  let svgNode = null;

  if (state.mode === 'flat') {
    switch (archetype) {
      case 'pants':
        svgNode = draftTrouserFlat(values, cut, zoom);
        break;
      case 'tshirt':
        svgNode = draftTeeFlat(values, cut, zoom);
        break;
      case 'headwear':
        svgNode = draftHeadwearFlat(values, cut, zoom);
        break;
      case 'bags':
        svgNode = draftBagFlat(values, cut, zoom);
        break;
      default:
        svgNode = draftTrouserFlat(values, cut, zoom);
    }
  } else {
    switch (archetype) {
      case 'pants':
        svgNode = draftTrouserPattern(values, cut, zoom);
        break;
      case 'tshirt':
        svgNode = draftTeePattern(values, cut, zoom);
        break;
      case 'headwear':
        svgNode = draftHeadwearPattern(values, cut, zoom);
        break;
      case 'bags':
        svgNode = draftBagPattern(values, cut, zoom);
        break;
      default:
        svgNode = draftTrouserPattern(values, cut, zoom);
    }
  }

  if (svgNode && typeof svgNode === 'object') {
    // Ensure scalable units (96 DPI baseline)
    if (!svgNode.getAttribute('viewBox') && svgNode.getAttribute('width') && svgNode.getAttribute('height')) {
      const w = parseFloat(svgNode.getAttribute('width'));
      const h = parseFloat(svgNode.getAttribute('height'));
      svgNode.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }
  }

  return svgNode;
}
