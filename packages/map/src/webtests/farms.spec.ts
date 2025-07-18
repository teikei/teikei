import { expect, test } from '@playwright/test'

import { goToPageAndLoginAsUser } from '@/webtests/steps'

test.describe('Farms', () => {
  test('user can manage farms', async ({ page }) => {
    await goToPageAndLoginAsUser(page)
    // create a farm
    await page
      .getByRole('button', { name: 'Einträge hinzufügen / bearbeiten' })
      .click()
    await page.getByRole('link', { name: 'Betrieb hinzufügen' }).click()
    await page.locator('input[name="name"]').click()
    await page.locator('input[name="name"]').fill('Webtest Farm 1')
    await page
      .getByPlaceholder('http://beispiel.de')
      .fill('http://www.example.com')
    await page
      .getByPlaceholder(
        'z.B. Informationen zum Hintergrund, zu den BetreiberInnen oder zur Geschichte des Betriebs.'
      )
      .click()
    await page
      .getByPlaceholder(
        'z.B. Informationen zum Hintergrund, zu den BetreiberInnen oder zur Geschichte des Betriebs.'
      )
      .fill('Beschreibung der Webtest Farm')
    await page.getByPlaceholder('Straße und Hausnummer, Ort').click()
    await page
      .getByPlaceholder('Straße und Hausnummer, Ort')
      .fill('Alexanderplatz, Berlin')
    await page.getByText('Alexanderplatz, 10178 Berlin').first().click()
    await page.waitForTimeout(1000)
    await page.getByText('Gemüse').click()
    await page.getByText('Pilze').click()
    await page.getByText('Eier').click()
    await page.getByText('Wurstwaren').click()
    await page.getByText('Saft').click()
    await page.getByText('Bier').click()
    await page
      .getByPlaceholder(
        'z.B. Informationen zu besonderen Sorten, Sonderkulturen, verarbeiteten Lebensmitteln o.ä.'
      )
      .click()
    await page
      .getByPlaceholder(
        'z.B. Informationen zu besonderen Sorten, Sonderkulturen, verarbeiteten Lebensmitteln o.ä.'
      )
      .fill('Zusätzliche Informationen zum Angebot')
    await page.locator('input[name="actsEcological"]').check()
    await page
      .getByPlaceholder('z.B. Mitgliedschaft in Anbauverbänden o.ä.')
      .click()
    await page
      .getByPlaceholder('z.B. Mitgliedschaft in Anbauverbänden o.ä.')
      .fill('Weitere Erläuterungen')
    await page.locator('select[name="foundedAtYear"]').selectOption('2021')
    await page.locator('select[name="foundedAtMonth"]').selectOption('3')
    await page
      .getByRole('listitem')
      .filter({
        hasText: 'Wir haben keine freien Plätze, aber eine Warteliste'
      })
      .getByRole('radio')
      .check()
    await page.getByRole('spinbutton').click()
    await page.getByRole('spinbutton').fill('100')
    await page
      .locator('textarea[name="participation"]')
      .fill('Die Mitglieder können ernten')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForTimeout(1000)
    await page
      .getByText('Dein Eintrag Webtest Farm 1 wurde erfolgreich gespeichert.')
      .click()

    // check the profile page
    await page.goto('http://localhost:3000/karte#/farms/2')
    await expect(
      page.getByText('Solidarische Landwirtschaft seit März 2021')
    ).toBeVisible()
    await expect(page.getByText('10178 Berlin')).toBeVisible()
    await expect(page.getByText('Beschreibung der Webtest Farm')).toBeVisible()
    await expect(page.getByText('Gemüse')).toBeVisible()
    await expect(page.getByText('Pilze')).toBeVisible()
    await expect(page.getByText('Eier')).toBeVisible()
    await expect(page.getByText('Wurstwaren')).toBeVisible()
    await expect(page.getByText('Saft')).toBeVisible()
    await expect(page.getByText('Bier')).toBeVisible()
    await expect(
      page.getByText('Zusätzliche Informationen zum Angebot')
    ).toBeVisible()
    await expect(
      page.getByText('Dieser Betrieb ist bio-zertifiziert.')
    ).toBeVisible()
    await expect(page.getByText('Weitere Erläuterungen')).toBeVisible()
    await expect(page.getByText('Die Mitglieder können ernten')).toBeVisible()
    await expect(page.getByText('Maximale Mitgliederzahl: 100')).toBeVisible()
    await expect(
      page.getByText('Wir nehmen neue Mitglieder auf! (Warteliste)')
    ).toBeVisible()

    // edit the farm
    await page
      .getByRole('button', { name: 'Einträge hinzufügen / bearbeiten' })
      .click()
    await page.getByRole('link', { name: 'Meine Einträge' }).click()
    await page.getByRole('link', { name: 'Bearbeiten' }).first().click()
    await page.locator('input[name="name"]').click()
    await page.locator('input[name="name"]').fill('Webtest Farm 2')
    await page
      .getByPlaceholder('http://beispiel.de')
      .fill('http://www.example2.com')
    await page
      .getByPlaceholder(
        'z.B. Informationen zum Hintergrund, zu den BetreiberInnen oder zur Geschichte des Betriebs.'
      )
      .click()
    await page
      .getByPlaceholder(
        'z.B. Informationen zum Hintergrund, zu den BetreiberInnen oder zur Geschichte des Betriebs.'
      )
      .fill('Beschreibung der Webtest Farm 2')
    await page.getByPlaceholder('Straße und Hausnummer, Ort').click()
    await page
      .getByPlaceholder('Straße und Hausnummer, Ort')
      .fill('brandenburger tor')
    await page.getByText('Brandenburger Tor, 14793 Ziesar').first().click()
    await page.waitForTimeout(1000)
    await page.getByLabel('Gemüse').uncheck()
    await page.getByLabel('Obst').check()
    await page.getByLabel('Pilze').uncheck()
    await page.getByLabel('Getreideprodukte (z.B. Mehl, Grieß, Nudeln)').check()
    await page.getByLabel('Eier').uncheck()
    await page.getByLabel('Fleisch').check()
    await page.getByLabel('Wurstwaren').uncheck()
    await page.getByLabel('Saft').uncheck()
    await page.getByLabel('Wein').check()
    await page.getByLabel('Bier').uncheck()
    await page
      .getByPlaceholder(
        'z.B. Informationen zu besonderen Sorten, Sonderkulturen, verarbeiteten Lebensmitteln o.ä.'
      )
      .fill('Zusätzliche Informationen zum Angebot 2')
    await page.locator('input[name="actsEcological"]').uncheck()
    await page
      .getByPlaceholder('z.B. Mitgliedschaft in Anbauverbänden o.ä.')
      .click()
    await page
      .getByPlaceholder('z.B. Mitgliedschaft in Anbauverbänden o.ä.')
      .fill('Weitere Erläuterungen 2')
    await page.locator('select[name="foundedAtYear"]').selectOption('2019')
    await page.locator('select[name="foundedAtMonth"]').selectOption('6')
    await page.getByText('Wir haben keine freien Plätze').first().click()
    await page.getByRole('radio').nth(1).check()
    await page.getByRole('spinbutton').fill('20')
    await page
      .getByText('Die Mitglieder können ernten')
      .fill('Die Mitglieder können ernten 2')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForTimeout(1000)
    await page.getByText('Dein Eintrag wurde erfolgreich aktualisiert.').click()

    // check the profile page again
    await page.goto('http://localhost:3000/karte#/farms/2')
    await expect(
      page.getByText('Solidarische Landwirtschaft seit Juni 2019')
    ).toBeVisible()
    await expect(page.getByText('14793 Ziesar')).toBeVisible()
    await expect(
      page.getByText('Beschreibung der Webtest Farm 2')
    ).toBeVisible()
    await expect(page.getByText('Obst')).toBeVisible()
    await expect(
      page.getByText('Getreideprodukte (z.B. Mehl, Grieß, Nudeln)')
    ).toBeVisible()
    await expect(page.getByText('Fleisch')).toBeVisible()
    await expect(page.getByText('Wein')).toBeVisible()
    await expect(
      page.getByText('Zusätzliche Informationen zum Angebot 2')
    ).toBeVisible()
    await expect(
      page.getByText('Dieser Betrieb ist bio-zertifiziert.')
    ).not.toBeVisible()
    await expect(page.getByText('Weitere Erläuterungen 2')).toBeVisible()
    await expect(page.getByText('Die Mitglieder können ernten 2')).toBeVisible()
    await expect(page.getByText('Maximale Mitgliederzahl: 20')).toBeVisible()
    await expect(
      page.getByText('Wir nehmen derzeit keine neuen Mitglieder auf!')
    ).toBeVisible()

    // delete the farm
    await page
      .getByRole('button', { name: 'Einträge hinzufügen / bearbeiten' })
      .click()
    await page.getByRole('link', { name: 'Meine Einträge' }).click()
    await page.getByRole('link', { name: 'Löschen' }).first().click()
    await page.getByRole('button', { name: 'Löschen' }).click()
  })
})
