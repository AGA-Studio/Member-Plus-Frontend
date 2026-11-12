import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = join(root, "src");
const allowHexIn = join(root, "src/app/globals.css");

const hex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const palette =
  /\b(?:bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|shadow|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;

const extensions = [".ts", ".tsx", ".css", ".js", ".jsx"];

const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

const findings = [];

for (const path of walk(source)) {
  if (!extensions.some((extension) => path.endsWith(extension))) continue;
  const text = readFileSync(path, "utf8");
  const file = relative(root, path);

  if (path !== allowHexIn) {
    for (const match of text.matchAll(hex)) {
      findings.push(`${file}:${lineOf(text, match.index)} hex suelto (${match[0]}); usa un token`);
    }
  }

  for (const match of text.matchAll(palette)) {
    findings.push(`${file}:${lineOf(text, match.index)} paleta por defecto (${match[0]}); usa un token`);
  }
}

if (findings.length) {
  findings.forEach((finding) => console.error(finding));
  console.error(`\n${findings.length} hallazgo(s). BRAND.md prohíbe hex sueltos y la paleta por defecto.`);
  process.exit(1);
}

console.log("Tokens en orden: sin hex sueltos ni paleta por defecto en src/.");
