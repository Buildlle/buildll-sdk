import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["dist/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: {
      "react-hooks": hooksPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
    }
  },
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off"
    }
  },
];