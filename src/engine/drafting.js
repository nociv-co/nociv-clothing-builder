import { draftTrouserPattern, draftTrouserFlat } from '../blocks/trouserBlock.js';
import { draftTeePattern, draftTeeFlat } from '../blocks/teeBlock.js';
import { draftSleevePattern } from '../blocks/sleeveBlock.js';

export function renderDraftingCanvas(state) {
  let svg;
  if (state.mode === 'flat') {
    svg = state.base === 'pants' ? draftTrouserFlat(state.values, state.zoom) : draftTeeFlat(state.values, state.zoom);
  } else {
    if (state.base === 'pants') svg = draftTrouserPattern(state.values, state.zoom);
    else if (state.base === 'tshirt') svg = draftTeePattern(state.values, state.zoom);
    else svg = draftSleevePattern(state.values, state.zoom);
  }
  return svg;
}
