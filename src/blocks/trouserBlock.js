export function draftTrouserBlock(fit, style) {
  const frontWidth = fit.targetHip / 4;
  const length = fit.targetLength;

  return {
    type: 'trouser',
    frontWidth: frontWidth,
    length: length
  };
}
