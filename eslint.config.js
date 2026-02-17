import eslintConfigPrettier from "eslint-config-prettier";
export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        fetch: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      semi: ["error", "always"],
      "no-console": "off",
      quotes: ["warn", "double"],
      indent: ["warn", 2],
      "no-trailing-spaces": "warn",
    },
    ignores: ["node_modules/**", "dist/**", "build/**"],
  },
  eslintConfigPrettier,
];
