describe('Asset register page', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    })
    beforeEach(() => {
        cy.visit('/#')
        cy.get(`#launch-button`).click();
        cy.get(`#token-name-Sepolia-test`).click();
        cy.wait(1000)
        cy.get(`.path-asset-register`).click();
    })
    it('should be navigated to asset-register', () => {
        cy.url().should('include', '/#asset-register')
    });
    it('Asset class cell should not be empty', () => {
        cy.get('.asset-class-cell:first-child').should('not.be.empty');
    });
    it('Goes to asset information and sets correct asset class', () => {
        cy.wait(2000)

        cy.get('.receipt-1').click();
        cy.url().should('include', '#asset-information/1')
    });
})