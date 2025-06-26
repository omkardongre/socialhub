describe("Signup Page", () => {
  it("should sign up a new user and show success message", () => {
    cy.visit("/auth/signup");
    // Use a unique email each time to avoid conflicts
    const email = `omkardongre5@gmail.com`;
    cy.get('input[placeholder="Email"]').type(email);
    cy.get('input[placeholder="Password"]').type("Okd@1234");
    cy.get('button[type="submit"]').click();

    // Wait for the toast or success message
    cy.contains("Signup successful", { timeout: 10000 }).should("be.visible");
  });
});
