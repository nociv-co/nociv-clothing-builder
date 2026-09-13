import { calculateBodyBlock } from './measurements.js';
import { applyEase } from './ease.js';
import { draftTrouserBlock } from '../blocks/trouserBlock.js';
import { draftTeeBlock } from '../blocks/teeBlock.js';
import { addSeamAllowance } from './seamAllowance.js';
import { validatePattern } from './validation.js';

export function generatePattern(archetype, rawMeasurements, styleConfig, fitConfig) {
  const body = calculateBodyBlock(rawMeasurements);
  const targetFit = applyEase(body, fitConfig);

  let rawPattern;
  if (archetype === 'pants') {
    rawPattern = draftTrouserBlock(targetFit, styleConfig);
  } else {
    rawPattern = draftTeeBlock(targetFit, styleConfig);
  }

  const finalPattern = addSeamAllowance(rawPattern, 0.5);
  const validationReport = validatePattern(finalPattern);

  return {
    pattern: finalPattern,
    confidence: validationReport
  };
}
