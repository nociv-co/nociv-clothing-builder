export function calculateBodyBlock(rawMeasurements, inputMode = 'body') {
  const waist = parseFloat(rawMeasurements.waist) || 30;
  const hip = parseFloat(rawMeasurements.hip) || 40;
  const length = parseFloat(rawMeasurements.length) || 30;

  if (inputMode === 'garment_flat') {
    return {
      waist: waist * 2,
      hip: hip * 2,
      length: length
    };
  }

  return { waist, hip, length };
}
