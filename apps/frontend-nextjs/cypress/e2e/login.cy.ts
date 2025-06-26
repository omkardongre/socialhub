describe('Login Page', () => {
  it('should log in and redirect to feed', () => {
    cy.visit('/auth/login');
    cy.get('input[placeholder="Email"]').type('omkardongre5@gmail.com');
    cy.get('input[placeholder="Password"]').type('Okd@1234');
    cy.get('button[type="submit"]').click();
    cy.contains('Feed', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/feed');
  });
});
