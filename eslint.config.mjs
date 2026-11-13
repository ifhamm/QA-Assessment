import tseslint from "typescript-eslint";

// Minimal, type-aware-free ESLint setup. The suite is plain Node/Playwright
// TypeScript, so the recommended rules are enough to catch unused code,
// accidental `any`, and common async mistakes without a second compiler pass.
export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "blob-report/**",
      "merged-blobs/**",
      "performance/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["tests/**/*.ts", "pages/**/*.ts", "api/**/*.ts", "fixtures/**/*.ts"],
  }
);
