describe('The Home Page', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    })
    beforeEach(() => {
        cy.visit('/#')
        cy.get(`#launch-button`).click();
        cy.get(`#token-name-Jefo-test`).click();
    })
    it('IPFS sign in should be visible if not logged in or navigate to mint', () => {
        cy.get(`.path-mint`).click();
        cy.window().its('localStorage').then((localStorage) => {
            // Now you can access localStorage variables
            let ipfsUsername = localStorage.getItem('ipfsUsername');
            let ipfsPassword = localStorage.getItem('ipfsPassword');
            if (!ipfsPassword || !ipfsUsername) {
                cy.get('.ipfs-container').should('exist')
                cy.get('.ipfs-username').type('gildlab1')
                cy.get('.ipfs-password').type('twet.gral.yew.phai')
                localStorage.setItem('ipfsUsername', 'gildlab1');
                localStorage.setItem('ipfsPassword', 'twet.gral.yew.phai');
            }
        });

    });
    // it('Should visit mint after setting ipfs credentials', () => {
    //     cy.get(`.path-mint`).click();
    //     cy.window().its('localStorage').then((localStorage) => {
    //         localStorage.setItem('ipfsUsername', 'gildlab1');
    //         localStorage.setItem('ipfsPassword', 'twet.gral.yew.phai');
    //     });
    //
    //     cy.get('.path-mint').click()
    //     cy.url().should('include', '/#mint')
    // });
    // it('Mint button should be disabled if no mint amount and asset class', () => {
    //     cy.get(`.path-mint`).click();
    //     cy.window().its('localStorage').then((localStorage) => {
    //         localStorage.setItem('ipfsUsername', 'gildlab1');
    //         localStorage.setItem('ipfsPassword', 'twet.gral.yew.phai');
    //     });
    //
    //     cy.get('.path-mint').click()
    //     cy.get('.mint-btn').should('be.disabled')
    // });
    // it('Mint button should be disabled if no asset class', () => {
    //     cy.get(`.path-mint`).click();
    //     cy.window().its('localStorage').then((localStorage) => {
    //         localStorage.setItem('ipfsUsername', 'gildlab1');
    //         localStorage.setItem('ipfsPassword', 'twet.gral.yew.phai');
    //     });
    //
    //     cy.get('.path-mint').click()
    //     cy.get(`#mint-amount`).type('0.01');
    //     cy.get('.mint-btn').should('be.disabled')
    // });
    // it('Should check transaction banner on mint', () => {
    //     cy.get(`.path-mint`).click();
    //     cy.window().its('localStorage').then((localStorage) => {
    //         localStorage.setItem('ipfsUsername', 'gildlab1');
    //         localStorage.setItem('ipfsPassword', 'twet.gral.yew.phai');
    //     });
    //
    //     cy.get('.path-mint').click()
    //     cy.url().should('include', '/#mint')
    //     cy.get('.select-label').click()
    //     cy.get('#QmP8zfxTaEYH129qjbqFawB1CsGDnJgyhycH5WhoJ9U7B3').click()
    //     cy.get('#name').type('test Name')
    //     cy.get('#wallet').type('test Wallet')
    //     cy.get('#title').type('test Title')
    //     cy.get('.mint-btn').should('be.disabled')
    //     cy.get(`#mint-amount`).clear();
    //     cy.get(`#mint-amount`).type('0.01');
    //     cy.get('.mint-btn').should('not.be.disabled')
    //     cy.get('.mint-btn').click()
    //     cy.get('.frame').should('exist')
    //     cy.get('.tx-in-progress').should('exist')
    //     cy.get('.contract-address').should('exist')
    //     cy.get('.tx-id').should('exist')
    //     cy.wait(4000)
    //     cy.get('.tx-in-progress').should('not.exist')
    //     cy.get('.contract-address').should('exist')
    //     cy.get('.tx-id').should('exist')
    //     cy.get('.copy-icon-contract').should('exist')
    //     cy.get('.copy-icon-contract').click()
    //     // Wait for a short duration to allow clipboard operation to complete
    //     cy.wait(1000); // Adjust the wait time based on your needs
    //     let testContractAddress = "0xdbcf2d8b73d06e6fa593b98857097257ebef1951"
    //     // Read the clipboard content and assert its value
    //     cy.window().then((win) => {
    //         return win.navigator.clipboard.readText().then((clipboardText) => {
    //             expect(clipboardText.trim()).to.equal(testContractAddress.trim());
    //         });
    //     });
    //     cy.get('.copy-icon-tx').should('exist')
    //     cy.get('.copy-icon-tx').click()
    //     // Wait for a short duration to allow clipboard operation to complete
    //     cy.wait(1000); // Adjust the wait time based on your needs
    //     let testTxHash = "0x74e6434511672cce3d94b332b0e44a3744bfef4382bf1c989577ed6d29bfabc4"
    //     // Read the clipboard content and assert its value
    //     cy.window().then((win) => {
    //         return win.navigator.clipboard.readText().then((clipboardText) => {
    //             expect(clipboardText.trim()).to.equal(testTxHash.trim());
    //         });
    //     });
    // });
})