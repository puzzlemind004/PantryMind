import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export default {
  types: {
    /**
     * PostgreSQL numeric/decimal columns are parsed to JS numbers by the
     * pg type parser configured in config/database.ts — type them
     * accordingly ("decimal" is the generator's internal type key).
     */
    decimal: { tsType: 'number' },
  },
} satisfies SchemaRules
