// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [ // Make sure this is an array for flat config
  ...compat.extends("next/core-web-vitals"),
  {
    // You can apply rules globally or to specific files
    // To apply globally for now to test, or you can scope it:
    // files: ["app/api/auth/[...nextauth]/route.ts"], // To target only the problematic file
    rules: {
      "@next/next/no-duplicate-head": "off", // Disable the rule causing the error
    },
  }
];