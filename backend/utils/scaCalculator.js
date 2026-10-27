/**
 * Specialty Coffee Association (SCA) Cupping Standard Formula
 * Total Score = Sum of 10 attributes - Defects
 * Attributes (each 6.00 to 10.00, or 0 to 10 for 5 cups):
 * 1. Fragrance/Aroma (6-10)
 * 2. Flavor (6-10)
 * 3. Aftertaste (6-10)
 * 4. Acidity (6-10)
 * 5. Body (6-10)
 * 6. Balance (6-10)
 * 7. Uniformity (2 pts per cup, max 10)
 * 8. Clean Cup (2 pts per cup, max 10)
 * 9. Sweetness (2 pts per cup, max 10)
 * 10. Overall (6-10)
 *
 * Defects:
 * Taint (defectIntensity = 2): 2 pts deduction per defective cup
 * Fault (defectIntensity = 4): 4 pts deduction per defective cup
 */

function calculateScaScore(attributes = {}) {
  const fragrance = parseFloat(attributes.fragrance ?? 8.0);
  const flavor = parseFloat(attributes.flavor ?? 8.0);
  const aftertaste = parseFloat(attributes.aftertaste ?? 8.0);
  const acidity = parseFloat(attributes.acidity ?? 8.0);
  const body = parseFloat(attributes.body ?? 8.0);
  const balance = parseFloat(attributes.balance ?? 8.0);
  const uniformity = parseFloat(attributes.uniformity ?? 10.0);
  const cleanCup = parseFloat(attributes.cleanCup ?? 10.0);
  const sweetness = parseFloat(attributes.sweetness ?? 10.0);
  const overall = parseFloat(attributes.overall ?? 8.0);

  const defectCups = parseInt(attributes.defectCups ?? 0, 10);
  const defectIntensity = parseInt(attributes.defectIntensity ?? 2, 10); // 2 = taint, 4 = fault
  const defectDeduction = defectCups * defectIntensity;

  const rawSum = fragrance + flavor + aftertaste + acidity + body + balance + uniformity + cleanCup + sweetness + overall;
  const finalScore = Math.max(0, Math.min(100, Math.round((rawSum - defectDeduction) * 100) / 100));

  let grade = 'Commercial / Sub-Specialty';
  let tier = 'Standard';
  let tierBadge = 'COMMERCIAL';

  if (finalScore >= 90) {
    grade = 'Presidential Exemplar (90-100)';
    tier = 'Gold Reserve';
    tierBadge = 'PRESIDENTIAL';
  } else if (finalScore >= 85) {
    grade = 'Excellent Specialty (85-89.99)';
    tier = 'Silver';
    tierBadge = 'EXCELLENT';
  } else if (finalScore >= 80) {
    grade = 'Very Good Specialty (80-84.99)';
    tier = 'Standard Specialty';
    tierBadge = 'SPECIALTY';
  }

  return {
    finalScore,
    defectDeduction,
    grade,
    tier,
    tierBadge,
    isSpecialtyGrade: finalScore >= 80,
    breakdown: {
      fragrance,
      flavor,
      aftertaste,
      acidity,
      body,
      balance,
      uniformity,
      cleanCup,
      sweetness,
      overall,
    }
  };
}

/**
 * Calculates roast shrinkage loss percentage
 * Typical specialty roast loss is 13% - 16%
 */
function calculateRoastMetrics(greenWeightKg, roastedWeightKg) {
  if (!greenWeightKg || greenWeightKg <= 0 || !roastedWeightKg || roastedWeightKg <= 0) {
    return { shrinkagePercentage: 0, efficiency: 100 };
  }
  const lossKg = greenWeightKg - roastedWeightKg;
  const shrinkagePercentage = Math.round(((lossKg / greenWeightKg) * 100) * 100) / 100;
  const efficiency = Math.round((roastedWeightKg / greenWeightKg) * 10000) / 100;
  return { lossKg, shrinkagePercentage, efficiency };
}

module.exports = {
  calculateScaScore,
  calculateRoastMetrics,
};
