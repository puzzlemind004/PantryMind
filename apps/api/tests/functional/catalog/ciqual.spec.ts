import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Product from '#models/product'
import User from '#models/user'
import CiqualService from '#services/ciqual_service'
import HouseholdService from '#services/household_service'

/** Extrait minimal au format de l'export CSV ANSES (séparateur ;, décimales à virgule). */
const SAMPLE_CSV = [
  'alim_code;alim_nom_fr;Energie, Règlement UE N° 1169/2011 (kcal/100 g);Protéines, N x facteur de Jones (g/100 g);Glucides (g/100 g);Lipides (g/100 g);Sel chlorure de sodium (g/100 g)',
  '9410;"Riz blanc, cuit";135;2,66;29,6;0,29;traces',
  '20904;"Tomate, crue";18,4;0,86;2,26;<0,5;0,013',
  ';ligne invalide sans code;;;;',
].join('\n')

test.group('CIQUAL | import et liaison', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('imports the ANSES CSV with French decimals and markers', async ({ assert }) => {
    const result = await CiqualService.importCsv(SAMPLE_CSV)

    assert.equal(result.imported, 2)
    assert.equal(result.skipped, 1)

    const [rice] = await CiqualService.search('riz')
    assert.equal(rice.code, '9410')
    assert.equal(rice.nutritionPer100.kcal, 135)
    assert.equal(rice.nutritionPer100.proteins, 2.66)
    /** « traces » → 0, « <0,5 » → 0.5. */
    assert.equal(rice.nutritionPer100.salt, 0)
    const [tomato] = await CiqualService.search('tomate')
    assert.equal(tomato.nutritionPer100.fat, 0.5)
  })

  test('re-import is idempotent (upsert by code)', async ({ assert }) => {
    await CiqualService.importCsv(SAMPLE_CSV)
    await CiqualService.importCsv(SAMPLE_CSV)

    assert.lengthOf(await CiqualService.search('riz'), 1)
  })

  test('links a CIQUAL entry to a household product', async ({ client, assert }) => {
    await CiqualService.importCsv(SAMPLE_CSV)
    const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
    const household = await HouseholdService.create(user, { name: 'Maison' })
    const rice = await Product.create({ householdId: household.id, name: 'Riz', defaultUnit: 'g' })

    const search = await client
      .get(`/api/v1/households/${household.id}/ciqual?search=riz`)
      .loginAs(user)
    search.assertStatus(200)
    assert.equal(search.body().data.foods[0].name, 'Riz blanc, cuit')

    const link = await client
      .post(`/api/v1/households/${household.id}/products/${rice.id}/ciqual`)
      .json({ ciqualCode: '9410' })
      .loginAs(user)

    link.assertStatus(200)
    assert.equal(link.body().data.nutritionPer100.kcal, 135)

    await rice.refresh()
    assert.equal(rice.ciqualCode, '9410')
  })
})
