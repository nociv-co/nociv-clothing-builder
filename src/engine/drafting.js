import { draftTrouserPattern, draftTrouserFlat } from '../blocks/trouserBlock.js';
import { draftTeePattern, draftTeeFlat } from '../blocks/teeBlock.js';
import { draftHeadwearPattern, draftHeadwearFlat } from '../blocks/headwearBlock.js';
import { draftBagPattern, draftBagFlat } from '../blocks/bagBlock.js';

export function renderDraftingCanvas(state) {
  const archetype = state.archetype || 'pants';
  const cut = state.selectedCut || 'straight';
  const values = state.values;
  const zoom = state.zoom || 1.0;

  if (state.mode === 'flat') {
    switch (archetype) {
      case 'pants':
        return draftTrouserFlat(values, cut, zoom);
      case 'tshirt':
        return draftTeeFlat(values, cut, zoom);
      case 'headwear':
        return draftHeadwearFlat(values, cut, zoom);
      case 'bags':
        return draftBagFlat(values, cut, zoom);
      default:
        return draftTrouserFlat(values, cut, zoom);
    }
  } else {
    switch (archetype) {
      case 'pants':
        return draftTrouserPattern(values, cut, zoom);
      case 'tshirt':
        return draftTeePattern(values, cut, zoom);
      case 'headwear':
        return draftHeadwearPattern(values, cut, zoom);
      case 'bags':
        return draftBagPattern(values, cut, zoom);
      default:
        return draftTrouserPattern(values, cut, zoom);
    }
  }
}
