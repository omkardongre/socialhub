describe("Explore Page", () => {
  before(() => {
    cy.login();
  });
  it("should search for users and show results", () => {
    cy.visit("/explore");

    // Type a username (adjust as needed for your seeded/test user)
    cy.get('input[placeholder="Search username..."]').type("om");

    // Wait for and assert that a user result appears
    cy.contains("omkardongre5", { timeout: 5000 }).should("be.visible"); // Use exact displayed username

    // Optionally, check that clicking the user navigates to their profile
    cy.get('[data-testid="user-search-results"]', { timeout: 10000 }).contains('omkardongre5').click();
    cy.url().should("include", "/profile/");
  });
});
