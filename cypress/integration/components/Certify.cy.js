import Certify from '../../../src/routes/Certify.svelte'


describe('Roles', () => {

    beforeEach(() => {
        cy.mount(Certify);
            // cy.get('.waiting-state').should('not.exist');
    });

    it(`Shows info text`, () => {
        cy.get('.error').should('not.exist');
        cy.get('.success').should('exist');
    });

});