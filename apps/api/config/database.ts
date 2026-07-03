import pg from 'pg'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

import env from '#start/env'

/**
 * Parse PostgreSQL numeric columns as JS numbers (quantities use at most
 * 3 decimals — far within float64 precision). Without this, pg returns
 * strings for numeric/decimal columns.
 */
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => Number.parseFloat(value))

const dbConfig = defineConfig({
  connection: 'pg',

  connections: {
    pg: {
      client: 'pg',

      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },

      migrations: {
        /**
         * Sort migration files naturally by filename.
         */
        naturalSort: true,

        /**
         * Paths containing migration files.
         */
        paths: ['database/migrations'],
      },

      schemaGeneration: {
        /**
         * Regenerate database/schema.ts model classes after migrations.
         * Dev-only: the generated file is committed, production containers
         * must not try to rewrite source files.
         */
        enabled: app.inDev,

        /**
         * Custom schema rules file paths.
         */
        rulesPaths: ['./database/schema_rules.js'],
      },

      debug: app.inDev,
    },
  },
})

export default dbConfig
