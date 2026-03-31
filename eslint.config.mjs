// eslint.config.mjs
import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import prettierConfig from "@vue/eslint-config-prettier";

export default [
  {
    ignores: ["dist/**", "scripts/*.ts"],
  },
  ...pluginVue.configs["flat/recommended"],
  ...vueTsEslintConfig({
    extends: ["recommended", "stylistic"],
  }),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true },
      ],
    },
  },
  prettierConfig,
];
