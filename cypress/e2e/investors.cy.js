import 'cypress-real-events';

describe('Investors page', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from failing the test
        return false
    })
    beforeEach(() => {
        cy.visit('/#')
    })
    it('Should show landing page and dropdown on SFT Ecosystem members hover', () => {
        cy.get(`.landing-container`).should('exist');
        cy.get('.dropdown .link').realHover();
        cy.get('.dropdown-content').should('be.visible');
    });

    it('Should navigate to investors', () => {
        cy.get('.dropdown .link').realHover();
        cy.get(`.investors`).click();
        cy.url().should('include', '/#investors')
    });

})