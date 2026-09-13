export function addSeamAllowance(pattern, allowanceInches = 0.5) {
  // Pass-through utility for offset geometry
  return {
    ...pattern,
    seamAllowance: allowanceInches
  };
}
