/// <reference types="cypress" />
/* eslint-disable @typescript-eslint/no-namespace */
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// -- Auth helper command --
Cypress.Commands.add("login", (email?: string, password?: string) => {
  const userEmail =
    email || Cypress.env("USER_EMAIL") || "omkardongre5@gmail.com";
  const userPassword = password || Cypress.env("USER_PASSWORD") || "Okd@1234";

  cy.session(
    [userEmail, userPassword],
    () => {
      cy.visit("/auth/login");
      cy.get('input[placeholder="Email"]').type(userEmail);
      cy.get('input[placeholder="Password"]').type(userPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should("include", "/feed");
    },
    { cacheAcrossSpecs: true }
  );
});

declare global {
  namespace Cypress {
    interface Chainable {
      /** Log in using UI once and cache session for future specs */
      login(email?: string, password?: string): Chainable<void>;
    }
  }
}

export {};

//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
