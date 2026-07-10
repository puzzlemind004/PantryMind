import CiqualFood from '#models/ciqual_food'
import type { NutritionPer100 } from '#types/catalog'

/** Column headers of the official ANSES CIQUAL CSV export. */
const COLUMN_MAP: Record<keyof NutritionPer100, string[]> = {
  kcal: ['Energie, Règlement UE N° 1169/2011 (kcal/100 g)'],
  proteins: ['Protéines, N x facteur de Jones (g/100 g)', 'Protéines (g/100 g)'],
  carbohydrates: ['Glucides (g/100 g)'],
  sugars: ['Sucres (g/100 g)'],
  fat: ['Lipides (g/100 g)'],
  saturatedFat: ['AG saturés (g/100 g)'],
  fiber: ['Fibres alimentaires (g/100 g)'],
  salt: ['Sel chlorure de sodium (g/100 g)'],
}

export default class CiqualService {
  /**
   * Imports the ANSES CIQUAL CSV (semicolon-separated, French decimals,
   * "traces"/"-"/"< x" markers). Idempotent: rows are upserted by code.
   */
  static async importCsv(content: string): Promise<{ imported: number; skipped: number }> {
    const rows = this.parseCsv(content)
    if (rows.length < 2) {
      return { imported: 0, skipped: 0 }
    }

    const headers = rows[0]
    const codeIndex = headers.findIndex((header) => header.trim() === 'alim_code')
    const nameIndex = headers.findIndex((header) => header.trim() === 'alim_nom_fr')
    if (codeIndex === -1 || nameIndex === -1) {
      throw new Error('Colonnes alim_code / alim_nom_fr introuvables — export CIQUAL attendu')
    }

    const nutrientIndexes = new Map<keyof NutritionPer100, number>()
    for (const [key, candidates] of Object.entries(COLUMN_MAP) as [
      keyof NutritionPer100,
      string[],
    ][]) {
      const index = headers.findIndex((header) => candidates.includes(header.trim()))
      if (index !== -1) {
        nutrientIndexes.set(key, index)
      }
    }

    let imported = 0
    let skipped = 0

    for (const row of rows.slice(1)) {
      const code = row[codeIndex]?.trim()
      const name = row[nameIndex]?.trim()
      if (!code || !name) {
        skipped += 1
        continue
      }

      const nutrition: NutritionPer100 = {}
      for (const [key, index] of nutrientIndexes) {
        const value = this.parseNumber(row[index])
        if (value !== null) {
          nutrition[key] = value
        }
      }

      await CiqualFood.updateOrCreate({ code }, { name, nutritionPer100: nutrition })
      imported += 1
    }

    return { imported, skipped }
  }

  static search(query: string, limit = 20) {
    return CiqualFood.query().whereILike('name', `%${query}%`).orderBy('name').limit(limit)
  }

  /** "12,5" → 12.5 ; "traces"/"-" → 0 ; "< 0,5" → 0.5 ; vide → null. */
  private static parseNumber(raw: string | undefined): number | null {
    if (raw === undefined) {
      return null
    }
    const cleaned = raw.trim().toLowerCase()
    if (cleaned === '') {
      return null
    }
    if (cleaned === '-' || cleaned === 'traces') {
      return 0
    }
    const numeric = Number.parseFloat(cleaned.replace('<', '').replace(',', '.').trim())
    return Number.isFinite(numeric) ? numeric : null
  }

  /** Minimal ;-separated CSV parser with quoted-field support. */
  private static parseCsv(content: string): string[][] {
    const rows: string[][] = []
    let row: string[] = []
    let field = ''
    let inQuotes = false

    for (let index = 0; index < content.length; index++) {
      const char = content[index]
      if (inQuotes) {
        if (char === '"' && content[index + 1] === '"') {
          field += '"'
          index += 1
        } else if (char === '"') {
          inQuotes = false
        } else {
          field += char
        }
      } else if (char === '"') {
        inQuotes = true
      } else if (char === ';') {
        row.push(field)
        field = ''
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && content[index + 1] === '\n') {
          index += 1
        }
        row.push(field)
        field = ''
        if (row.some((value) => value.trim() !== '')) {
          rows.push(row)
        }
        row = []
      } else {
        field += char
      }
    }
    if (field !== '' || row.length > 0) {
      row.push(field)
      if (row.some((value) => value.trim() !== '')) {
        rows.push(row)
      }
    }

    return rows
  }
}
