/**
 * Carbon footprint calculations and utilities
 */

// Industry average carbon footprints by product category (kg CO2)
export const INDUSTRY_AVERAGES = {
  default: 30,
  toothbrushes: 25,
  shoes: 35,
  electronics: 50,
  clothing: 20,
  furniture: 60,
}

// Average carbon per mile driven (kg CO2)
const CO2_PER_MILE_DRIVEN = 0.4 // Average car emits ~0.4 kg CO2 per mile

/**
 * Get industry average carbon footprint for a product
 */
export function getIndustryAverage(productName: string): number {
  const lowerProduct = productName.toLowerCase()

  if (lowerProduct.includes('toothbrush')) return INDUSTRY_AVERAGES.toothbrushes
  if (lowerProduct.includes('shoe') || lowerProduct.includes('sneaker')) return INDUSTRY_AVERAGES.shoes
  if (lowerProduct.includes('electronic') || lowerProduct.includes('laptop') || lowerProduct.includes('phone')) return INDUSTRY_AVERAGES.electronics
  if (lowerProduct.includes('shirt') || lowerProduct.includes('clothing') || lowerProduct.includes('apparel')) return INDUSTRY_AVERAGES.clothing
  if (lowerProduct.includes('furniture') || lowerProduct.includes('chair') || lowerProduct.includes('desk')) return INDUSTRY_AVERAGES.furniture

  return INDUSTRY_AVERAGES.default
}

/**
 * Calculate carbon savings compared to industry average
 */
export function calculateCarbonSavings(offerCarbon: number, averageCarbon: number): number {
  return Math.max(0, averageCarbon - offerCarbon)
}

/**
 * Convert carbon savings to miles not driven
 */
export function carbonToMiles(kgCO2: number): number {
  return Math.round(kgCO2 / CO2_PER_MILE_DRIVEN)
}

/**
 * Calculate percentage reduction in carbon
 */
export function calculateCarbonReduction(offerCarbon: number, averageCarbon: number): number {
  if (averageCarbon === 0) return 0
  return Math.round(((averageCarbon - offerCarbon) / averageCarbon) * 100)
}

/**
 * Format carbon footprint with context
 */
export function formatCarbonWithContext(kgCO2: number, averageCarbon: number): string {
  const reduction = calculateCarbonReduction(kgCO2, averageCarbon)

  if (reduction > 0) {
    return `${kgCO2}kg CO₂ (${reduction}% less than average)`
  } else if (reduction < 0) {
    return `${kgCO2}kg CO₂ (${Math.abs(reduction)}% more than average)`
  } else {
    return `${kgCO2}kg CO₂ (industry average)`
  }
}

/**
 * Get a relatable comparison for carbon savings
 */
export function getCarbonComparison(kgCO2: number): string {
  const miles = carbonToMiles(kgCO2)

  if (miles > 500) {
    return `Not driving ${miles} miles - that's like a road trip from SF to LA!`
  } else if (miles > 100) {
    return `Not driving ${miles} miles - that's like a weekend getaway!`
  } else if (miles > 50) {
    return `Not driving ${miles} miles - that's like your daily commute for a week!`
  } else if (miles > 10) {
    return `Not driving ${miles} miles`
  } else {
    return `Saving ${kgCO2}kg CO₂`
  }
}
