import { readFile } from 'node:fs/promises'

import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Imports the ANSES CIQUAL composition table (CSV export) into the
 * ciqual_foods reference table. Download from
 * https://ciqual.anses.fr → « Télécharger la table » (CSV).
 *
 *   node ace ciqual:import chemin/vers/ciqual.csv
 */
export default class CiqualImport extends BaseCommand {
  static commandName = 'ciqual:import'
  static description = 'Importe la table de composition CIQUAL (CSV ANSES)'
  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'Chemin du fichier CSV CIQUAL' })
  declare file: string

  async run() {
    const { default: CiqualService } = await import('#services/ciqual_service')

    this.logger.info(`Lecture de ${this.file}…`)
    const content = await readFile(this.file, 'utf8')

    const result = await CiqualService.importCsv(content)
    this.logger.success(`${result.imported} aliments importés, ${result.skipped} lignes ignorées`)
  }
}
