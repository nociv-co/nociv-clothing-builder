export function applyEase(normalizedBody, fitConfig = {}) {
  const waistEase = fitConfig.waistEase || 1.0;
  const hipEase = fitConfig.hipEase || 2.0;

  return {
    targetWaist: normalizedBody.waist + waistEase,
    targetHip: normalizedBody.hip + hipEase,
    targetLength: normalizedBody.length
  };
}
