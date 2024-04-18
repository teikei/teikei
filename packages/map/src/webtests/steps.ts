export const goToPageAndLoginAsUser = async (page) => {
  await page.waitForTimeout(2000)
  await page.goto('http://localhost:3000/')
  await page.waitForLoadState()
  await page.waitForTimeout(2000)
  await page
    .getByRole('link', { name: 'Einträge hinzufügen / bearbeiten' })
    .click()
  await page.locator('input[name="email"]').fill('user@example.com')
  await page.locator('input[name="password"]').fill('admin')
  await page.getByRole('button', { name: 'Anmelden' }).click()
}
