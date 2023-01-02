module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    "no-unused-vars": 0,
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-empty-function": 0,
    "prefer-const": ["warn", { destructuring: "all" }],
    "spaced-comment": "warn",
    curly: "error",
  },
}
