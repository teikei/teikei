import { test, expect } from "@playwright/test"
import { goToPageAndLoginAsUser } from "./steps"

test.describe("Initiatives", () => {
  test("user can manage initiatives", async ({ page }) => {
    // eslint-disable-next-line no-undef
    await goToPageAndLoginAsUser(page)
    // create an initiative
    await page
      .getByRole("button", { name: "Einträge hinzufügen / bearbeiten" })
      .click()
    await page.getByRole("link", { name: "Initiative hinzufügen" }).click()
    await page.getByText("Wir suchen Land oder Hof").click()
    await page
      .getByText("Wir suchen Mitglieder für unser Organisationsteam")
      .click()
    await page
      .getByPlaceholder(
        "z.B. Informationen zum Hintergrund oder zu gemeinsamen Aktivitäten.",
      )
      .fill("Neue Initiative 1")
    await page.locator('input[name="name"]').fill("Webtest Initiative 1")
    await page
      .getByPlaceholder("http://beispiel.de")
      .fill("http://www.example1.com")
    await page
      .getByPlaceholder("Straße und Hausnummer, Ort")
      .fill("27809 Lemwerder")
    await page.getByText("27809 Lemwerder").first().click()
    await page.waitForTimeout(1000)
    await page.getByRole("button", { name: "Speichern" }).click()
    await page.waitForTimeout(1000)
    await page
      .getByText(
        "Dein Eintrag Webtest Initiative 1 wurde erfolgreich gespeichert.",
      )
      .click()

    // check the profile page
    await page.goto("http://localhost:3000/#/initiatives/2")
    await expect(
      page.getByRole("heading", { name: "Webtest Initiative 1" }),
    ).toBeVisible()
    await expect(page.getByText("27809 Lemwerder")).toBeVisible()
    await expect(
      page.getByRole("link", { name: "| http://www.example1.com" }),
    ).toBeVisible()
    await expect(page.getByText("Neue Initiative 1")).toBeVisible()
    await expect(page.getByText("Wir suchen Land oder Hof")).toBeVisible()
    await expect(
      page.getByText("Wir suchen Mitglieder für unser Organisationsteam"),
    ).toBeVisible()

    // edit the initiative
    await page.getByRole("link", { name: "Zurück zur Übersichtskarte" }).click()
    await page
      .getByRole("button", { name: "Einträge hinzufügen / bearbeiten" })
      .click()
    await page.getByRole("link", { name: "Meine Einträge" }).click()
    await page.getByRole("link", { name: "Bearbeiten" }).click()
    // TODO
    await page.reload()
    await page.getByLabel("Wir suchen GärtnerInnen oder LandwirtInnen").check()
    await page.getByText("Wir suchen Land oder Hof").click()
    await page
      .getByLabel("Wir suchen Mitglieder für unser Organisationsteam")
      .uncheck()
    await page.getByLabel("Wir suchen KonsumentInnen").check()
    await page
      .getByPlaceholder(
        "z.B. Informationen zum Hintergrund oder zu gemeinsamen Aktivitäten.",
      )
      .fill("Neue Initiative 2")
    await page.locator('input[name="name"]').fill("Webtest Initiative 2")
    await page
      .getByPlaceholder("http://beispiel.de")
      .fill("http://www.example2.com")
    await page.getByPlaceholder("Straße und Hausnummer, Ort").fill("berlin")
    await page.getByText("Berliner Straße, 60311 Frankfurt am Main").click()
    await page.waitForTimeout(1000)
    await page.getByRole("button", { name: "Speichern" }).click()
    await page.waitForTimeout(1000)
    await page.getByText("Dein Eintrag wurde erfolgreich aktualisiert.").click()

    // check the profile page again
    await page.goto("http://localhost:3000/#/initiatives/2")
    // TODO
    await page.reload()
    await expect(
      page.getByRole("heading", { name: "Webtest Initiative 2" }),
    ).toBeVisible()
    await expect(page.getByText("60311 Frankfurt am Main")).toBeVisible()
    await expect(
      page.getByRole("link", { name: "| http://www.example2.com" }),
    ).toBeVisible()
    await expect(page.getByText("Neue Initiative 2")).toBeVisible()
    await expect(
      page.getByText("Wir suchen GärtnerInnen oder LandwirtInnen"),
    ).toBeVisible()
    await expect(page.getByText("Wir suchen KonsumentInnen")).toBeVisible()

    await page
      .getByRole("button", { name: "Einträge hinzufügen / bearbeiten" })
      .click()
    await page.getByRole("link", { name: "Meine Einträge" }).click()
    await page.getByRole("link", { name: "Löschen" }).click()
    await page.getByRole("button", { name: "Löschen" }).click()
  })
})
