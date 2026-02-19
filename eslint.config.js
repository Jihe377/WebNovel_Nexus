import eslintConfigPrettier from "eslint-config-prettier";
export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Browser globals
        document: "readonly",
        window: "readonly",
        console: "readonly",
        fetch: "readonly",
        // Node.js globals
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        // Timer globals (browser + Node)
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        // Web APIs used in this project
        URLSearchParams: "readonly",
        localStorage: "readonly",
        bootstrap: "readonly",
        location: "readonly",
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