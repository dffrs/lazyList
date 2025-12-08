import LazyList from "../../src/index";

const numberOfChildren = 200;
const children = Array.from({ length: numberOfChildren }, (_, i) => <p>{i}</p>);

describe("Lazy List test suite", () => {
  it("renders ONLY 10 elements as default", () => {
    const defaultInitalElements = 10;

    const children = Array.from({ length: numberOfChildren }, (_, i) => (
      <p style={{ height: "20px" }}>{i}</p>
    ));

    // let's say that height is 100 px.
    // each child has height of 20 px.
    // meaning that not all children would be visible (parent would be overflowing)
    cy.viewport(1200, 100);

    // render LazyList component
    cy.mount(<LazyList>{children}</LazyList>);

    cy.get('[data-testid="lazy-list-ul"]').should("exist");

    cy.get("[data-testid^='lazy-list-li']").should(
      "have.length",
      defaultInitalElements,
    );
  });

  it("renders children until parent is overflowing", () => {
    const initialElements = 5;
    const clientHeight = 200;

    cy.mount(
      <div
        data-testid="wrapper"
        style={{ height: clientHeight, overflow: "auto" }}
      >
        <LazyList initialElements={initialElements}>{children}</LazyList>
      </div>,
    );

    cy.get('[data-testid="lazy-list-ul"]').should("exist");

    // verify that it has more that only 'initialElements'
    cy.get("[data-testid^='lazy-list-li']").should(
      "not.have.length",
      initialElements,
    );

    // but it should not have all the children also
    cy.get("[data-testid^='lazy-list-li']").should(
      "not.have.length",
      numberOfChildren,
    );

    cy.get("[data-testid='wrapper']").then(($el) => {
      const elScrollHeight = $el.prop("scrollHeight");
      const elClientHeight = $el.prop("clientHeight");

      expect(elClientHeight).to.be.equal(clientHeight);

      expect(elScrollHeight).to.be.greaterThan(elClientHeight);
    });
  });
});
