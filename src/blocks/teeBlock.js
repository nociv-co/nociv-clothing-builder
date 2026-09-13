export function draftTeeBlock(fit, style) {
  const frontWidth = (fit.targetHip + 4) / 4;
  const length = fit.targetLength;

  return {
    type: 'tee',
    frontWidth: frontWidth,
    length: length
  };
}
