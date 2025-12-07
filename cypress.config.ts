import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    screenshotOnRunFailure: false,
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    defaultBrowser: "chrome",
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "cypress/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.ts",
  },
});
