import 'cypress-real-events';

describe('Token overview page', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from failing the test
        return false
    })
    beforeEach(() => {
        cy.visit('/#')
        cy.get(`#launch-button`).click();
        cy.get(`#token-name-Jefo`).click();
    })
    it('Should show token overview page', () => {
        cy.url().should('include', '/#token-overview')
        cy.get(`.token-name`).should('exist');
    });

    it('Should navigate to home page when typing in search', () => {
        cy.get('.search-input').focus().type('j')
        cy.url().should('include', '/#list')
    });

})