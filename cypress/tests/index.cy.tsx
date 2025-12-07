import LazyList from "../../src/index";

describe("Lazy List test suite", () => {
  it("Lazy List renders", () => {
    // render LazyList component
    cy.mount(<LazyList></LazyList>);

    cy.get('[data-testid="lazy-list-ul"]').should("exist");
  });
});
