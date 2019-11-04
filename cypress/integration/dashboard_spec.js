describe('The dashboard', function() {
  it('should load', function() {
    // Go to Dashboad
    cy.visit('/dashboard/index.html')
  })
  describe('admin login', function() {
    // TODO avoid UI login when testing each component more fully
    before(function() {
      cy
      .get('existdb-launcher-app')
      .shadowGet('app-toolbar')
      .shadowFind('a#login')
      .shadowClick()
      .url().should('include', '/dashboard/login.html')
      .get('#user').type('admin')
      .get('.button').click()
      .url().should('include', '/dashboard/admin#/launcher')
    })

    it('should enable package manager', function() {
      cy
      .get('body')
      .shadowGet('app-drawer-layout')
      .shadowFind('paper-item#packageManagerItem').shadowClick()
      .url().should('include', 'dashboard/admin#/packagemanager')
    })

    it('should enable user manager', function() {
      cy
      .get('body')
      .shadowGet('app-drawer-layout')
      .shadowFind('paper-item#userManagerItem').shadowClick()
      .url().should('include', 'dashboard/admin#/usermanager')
    })

    it('should enable backup', function() {
      cy
      .get('body')
      .shadowGet('app-drawer-layout')
      .shadowFind('paper-item#backupItem').shadowClick()
      .url().should('include', 'dashboard/admin#/backup')
    })

    it('should enable settings', function() {
      cy
      .get('body')
      .shadowGet('app-drawer-layout')
      .shadowFind('paper-item#settingsItem').shadowClick()
      .url().should('include', 'dashboard/admin#/settings')
    })

    after(function() {
      cy
      .get('body')
      .shadowGet('app-drawer-layout')
      .shadowFind('paper-item#logout').shadowClick()
      .url().should('include', 'dashboard/index.html?logout=true')
    })
  })
})
