describe('Admin User', () => {
  it('logs in', () => {
    cy.visit('http://localhost:3000')
    cy.get('.account-nav-login').click()
    cy.get('[name="email"]').type('admin@example.com')
    cy.get('[name="password"]').type('admin')
    cy.get('[type="submit"]').click()
    cy.contains('Hallo Teikei Admin, Du hast Dich erfolgreich angemeldet.')
  })

  const deliveryDaysText = 'Monday, Tuesday, Wednesday'
  const descriptionText = 'Depot description: This is the description'
  const urlText = 'http://ernte-teilen.org'
  const nameText = 'Cypress TestDepot'

  it('creates a new depot', () => {
    cy.get('.entries-nav-toggle').click()
    cy.get('.entries-nav-depot').click()
    cy.get('[name="name"]').type(nameText)
    cy.get('[name="url"]').type(urlText)
    cy.get('.Select-placeholder').click()
    cy.get('.Select-menu-outer').click()

    cy.get('[name="geocoder"]')
      .type('Alexanderplatz, Berlin')
      .click()
      .type('{downarrow}{enter}')
    cy.get('[name="description"]').type(descriptionText)
    cy.get('[name="deliveryDays"]').type(deliveryDaysText)
    cy.get('.submit').click()
    cy.contains('wurde erfolgreich gespeichert.')
  })

  it('searches for the newly created depot', () => {
    cy.get('.search-input')
      .type('Cypress TestDepot', { delay: 100 })
      .type('{downarrow}{enter}')

    cy.get('.details')
    cy.get('h1.details-title').contains(nameText)
    cy.get('.details-meta').contains('10178 Berlin')
    cy.get('.details-meta').contains(urlText)
    cy.get('.details-content').contains(descriptionText)
  })
})
