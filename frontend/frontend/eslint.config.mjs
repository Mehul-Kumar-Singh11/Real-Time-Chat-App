import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginPrettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Next.js core configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ignore build and node_modules
  {
    ignores: ["node_modules/**", ".next/**", "dist/**"],
  },

  // Custom rules
  {
    plugins: { prettier: pluginPrettier },
    rules: {
      semi: "error", // require semicolons
      "prettier/prettier": "warn", // run prettier via eslint
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
