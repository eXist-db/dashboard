/// <reference types="cypress" />

describe('User Manager', function() {
  describe('log in', function() {
    before(function() {
      cy.visit('/dashboard/login.html')
      cy.get('#user').type('admin')
      cy.get('.button').click()
    })
    describe('create and delete users', function() {
      it('should create and delete users', function() {
        cy.visit('/dashboard/admin#/usermanager')
        cy.shadowGet('#addUser').shadowClick()
          .shadowGet('#userInput').shadowTrigger('input', 'rudi')
        cy.shadowGet('input[type=password]').shadowTrigger('input', 'pass')
        cy.shadowGet('#confirm').shadowTrigger('input', 'pass')
        cy.shadowGet('#memberOf > paper-item:nth-child(1)').shadowClick()
        cy.shadowGet('#save').shadowClick()
        cy.shadowGet('.user-entry .user:contains("rudi")').shadowShould('have.length', 1)

        cy.shadowGet('.user-entry .user:contains("rudi")').shadowClick()
        cy.shadowGet('#userForm > form > paper-button:nth-child(11)').shadowClick().wait(500)

        cy.shadowGet('.user-entry')
          .shadowFind('span.user')
          .shadowShould('not.have.text', 'rudi')
      })
    })
  })
})
