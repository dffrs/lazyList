import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "cypress/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.ts",
  },
});
