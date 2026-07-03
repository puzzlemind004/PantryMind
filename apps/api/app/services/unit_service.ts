/**
 * Units and conversions (spec §5.6, 7.11).
 *
 * Three-level strategy:
 * 1. universal conversions within a dimension (mass, volume);
 * 2. product-specific factors (unitWeightGrams, densityGPerMl) to cross dimensions;
 * 3. otherwise the conversion is impossible and the caller must involve the user.
 */

export type UnitDimension = 'mass' | 'volume' | 'count'

interface UnitDefinition {
  dimension: UnitDimension
  /** Factor to the dimension's base unit (g, ml, unit). */
  toBase: number
}

export const UNITS: Record<string, UnitDefinition> = {
  mg: { dimension: 'mass', toBase: 0.001 },
  g: { dimension: 'mass', toBase: 1 },
  kg: { dimension: 'mass', toBase: 1000 },
  ml: { dimension: 'volume', toBase: 1 },
  cl: { dimension: 'volume', toBase: 10 },
  l: { dimension: 'volume', toBase: 1000 },
  /** Discrete items: eggs, cans, packs… Only convertible via product factors. */
  unit: { dimension: 'count', toBase: 1 },
}

export const UNIT_CODES = Object.keys(UNITS)

export interface ProductConversionFactors {
  unitWeightGrams?: number | null
  densityGPerMl?: number | null
}

export default class UnitService {
  static isKnown(unit: string): boolean {
    return unit in UNITS
  }

  static dimension(unit: string): UnitDimension | null {
    return UNITS[unit]?.dimension ?? null
  }

  /**
   * Converts a quantity between units, using product factors to cross
   * dimensions when provided. Returns null when the conversion is
   * impossible (spec 7.11: the user must then decide).
   */
  static convert(
    quantity: number,
    fromUnit: string,
    toUnit: string,
    product: ProductConversionFactors = {}
  ): number | null {
    const from = UNITS[fromUnit]
    const to = UNITS[toUnit]
    if (!from || !to) {
      return null
    }

    if (fromUnit === toUnit) {
      return quantity
    }

    /** Level 1: same dimension. */
    if (from.dimension === to.dimension) {
      return (quantity * from.toBase) / to.toBase
    }

    /** Level 2: cross dimensions through grams using product factors. */
    const grams = this.toGrams(quantity, from, product)
    if (grams === null) {
      return null
    }
    return this.fromGrams(grams, to, product)
  }

  private static toGrams(
    quantity: number,
    from: UnitDefinition,
    product: ProductConversionFactors
  ): number | null {
    switch (from.dimension) {
      case 'mass':
        return quantity * from.toBase
      case 'volume':
        return product.densityGPerMl ? quantity * from.toBase * product.densityGPerMl : null
      case 'count':
        return product.unitWeightGrams ? quantity * product.unitWeightGrams : null
    }
  }

  private static fromGrams(
    grams: number,
    to: UnitDefinition,
    product: ProductConversionFactors
  ): number | null {
    switch (to.dimension) {
      case 'mass':
        return grams / to.toBase
      case 'volume':
        return product.densityGPerMl ? grams / product.densityGPerMl / to.toBase : null
      case 'count':
        return product.unitWeightGrams ? grams / product.unitWeightGrams : null
    }
  }
}
