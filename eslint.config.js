// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const betterTailwindcss = require("eslint-plugin-better-tailwindcss");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    extends: [betterTailwindcss.configs.recommended],
    settings: {
      "better-tailwindcss": {
        entryPoint: "global.css",
        // NativeWind props that forward classes to a child's className.
        attributes: [
          "className",
          "containerClassName",
          "contentContainerClassName",
        ],
      },
    },
    rules: {
      "better-tailwindcss/enforce-canonical-classes": "error",
      "better-tailwindcss/enforce-consistent-line-wrapping": [
        "warn",
        {
          strictness: "loose",
        },
      ],
      "better-tailwindcss/no-restricted-classes": [
        "warn",
        {
          restrict: [
            {
              pattern: "-\\[\\d+(\\.\\d+)?px\\]$",
              message:
                "Prefer the spacing scale (4px per unit, e.g. pt-[60px] -> pt-15) or a token from global.css. Fine to keep if no scale value matches.",
            },
          ],
        },
      ],
    },
  },
]);
