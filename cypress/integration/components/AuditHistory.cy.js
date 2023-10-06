import AuditHistory from '../../../src/routes/AuditHistory.svelte'


describe('Roles', () => {

    beforeEach(() => {
        cy.mount(AuditHistory);
            // cy.get('.waiting-state').should('not.exist');
    });

    it(`Shows info text`, () => {
        cy.get('.error').should('not.exist');
        cy.get('.success').should('exist');
    });

});