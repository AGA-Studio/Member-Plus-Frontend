import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react/jsx-no-literals": ["error", { noStrings: true, ignoreProps: true }],
      "no-warning-comments": ["error", { terms: ["todo", "fixme", "hack", "xxx"], location: "anywhere" }],
      "no-inline-comments": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react-icons/*",
                "@heroicons/*",
                "@phosphor-icons/*",
                "@tabler/icons-react",
                "@mui/icons-material/*",
                "axios",
              ],
              message: "BRAND.md: los íconos son lucide-react y las peticiones van con fetch.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
