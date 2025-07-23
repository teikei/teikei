import { expect, test } from '@playwright/test'

import { goToPageAndLoginAsUser } from '@/webtests/steps'

test.describe('Depots', () => {
  test('user can manage depots', async ({ page }) => {
    await goToPageAndLoginAsUser(page)
    // create a depot
    await page
      .getByRole('button', { name: 'Einträge hinzufügen / bearbeiten' })
      .click()
    await page.getByRole('link', { name: 'Abholstellen hinzufügen' }).click()
    await page.locator('input[name="name"]').fill('Webtest Depot 1')
    await page
      .getByPlaceholder('http://beispiel.de')
      .fill('http://www.example1.com')
    await page.getByText('Select...').click()
    await page.getByRole('option', { name: 'Beispiel-Farm 1' }).click()
    await page
      .getByPlaceholder('Straße und Hausnummer, Ort')
      .fill('Warschauer Str, berlin')
    await page.getByText('Warschauer Straße, 10243 Berlin').first().click()
    await page.waitForTimeout(1000)
    await page
      .getByPlaceholder(
        'z.B. Informationen zum Hintergrund oder zu gemeinsamen Aktivitäten.'
      )
      .fill('Beschreibung des Depots 1')
    await page
      .getByPlaceholder('z.B. jeden zweiten Donnerstag')
      .fill('Abholtage 1')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForTimeout(1000)
    await page
      .getByText('Dein Eintrag Webtest Depot 1 wurde erfolgreich gespeichert.')
      .click()

    // check the profile page
    await page.goto('http://localhost:3000/#/depots/2')
    await expect(
      page.getByRole('heading', { name: 'Webtest Depot 1' })
    ).toBeVisible()
    await expect(page.getByText('10243 Berlin')).toBeVisible()
    await expect(
      page.getByRole('link', { name: '| http://www.example1.com' })
    ).toBeVisible()
    await expect(page.getByText('Beschreibung des Depots 1')).toBeVisible()
    await expect(
      page.getByText('Gemüse, Pilze – Beispiel-Farm 1')
    ).toBeVisible()
    await expect(page.getByText('Abholtage 1')).toBeVisible()

    // edit the depot
    await page.getByRole('link', { name: 'Zurück zur Übersichtskarte' }).click()
    await page
      .getByRole('button', { name: 'Einträge hinzufügen / bearbeiten' })
      .click()
    await page.getByRole('link', { name: 'Meine Einträge' }).click()
    await page.getByRole('link', { name: 'Bearbeiten' }).click()
    await page.locator('input[name="name"]').fill('Webtest Depot 2')
    await page
      .getByPlaceholder('http://beispiel.de')
      .fill('http://www.example2.com')
    await page
      .getByPlaceholder('Straße und Hausnummer, Ort')
      .fill('Fröbelstraße 17, 10405 Berlin')
    await page
      .getByText('Fröbelstraße 17, 10405 Berlin, Deutschland')
      .first()
      .click()
    await page.waitForTimeout(1000)
    await page
      .getByPlaceholder(
        'z.B. Informationen zum Hintergrund oder zu gemeinsamen Aktivitäten.'
      )
      .fill('Beschreibung des Depots 2')
    await page
      .getByPlaceholder('z.B. jeden zweiten Donnerstag')
      .fill('Abholtage 2')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForTimeout(1000)
    await page.getByText('Dein Eintrag wurde erfolgreich aktualisiert.').click()

    // check the profile page again
    await page.goto('http://localhost:3000/#/depots/2')
    await expect(
      page.getByRole('heading', { name: 'Webtest Depot 2' })
    ).toBeVisible()
    await expect(page.getByText('10405 Berlin')).toBeVisible()
    await expect(
      page.getByRole('link', { name: '| http://www.example2.com' })
    ).toBeVisible()
    await expect(page.getByText('Beschreibung des Depots 2')).toBeVisible()
    await expect(
      page.getByText('Gemüse, Pilze – Beispiel-Farm 1')
    ).toBeVisible()
    await expect(page.getByText('Abholtage 2')).toBeVisible()

    // delete the depot
    await page.getByRole('link', { name: 'Zurück zur Übersichtskarte' }).click()
    await page
      .getByRole('button', { name: 'Einträge hinzufügen / bearbeiten' })
      .click()
    await page.getByRole('link', { name: 'Meine Einträge' }).click()
    await page.getByRole('link', { name: 'Löschen' }).click()
    await page.getByRole('button', { name: 'Löschen' }).click()
  })
})
