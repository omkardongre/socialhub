describe("Feed Page", () => {
  before(() => {
    cy.login();
  });

  it("should allow a user to create a new text post", () => {
    cy.visit("/feed");

    const postContent = "This is a test post from Cypress!";

    // Type content into the textarea
    cy.get('textarea[placeholder="What\'s on your mind?"]').type(postContent);

    // Click the post button
    cy.get("button").contains("Post").click();

    // Verify success toast message
    cy.contains("Post created!").should("be.visible");

    // Verify the post appears in the feed
    cy.contains(postContent).should("be.visible");

    // Verify the textarea is cleared
    cy.get('textarea[placeholder="What\'s on your mind?"]').should(
      "have.value",
      ""
    );
  });
});
