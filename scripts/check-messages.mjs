import { readFileSync } from "node:fs";

const locales = ["es", "en"];

const read = (locale) =>
  JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"));

const flatten = (value, prefix = "") =>
  Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? flatten(child, path) : [path];
  });

const [reference, ...rest] = locales.map((locale) => ({
  locale,
  keys: new Set(flatten(read(locale))),
}));

let failed = false;

for (const { locale, keys } of rest) {
  const missing = [...reference.keys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !reference.keys.has(key));
  if (!missing.length && !extra.length) continue;
  failed = true;
  console.error(`${locale}.json: faltan ${missing.length}, sobran ${extra.length}`);
  missing.forEach((key) => console.error(`  falta  ${key}`));
  extra.forEach((key) => console.error(`  sobra  ${key}`));
}

if (failed) process.exit(1);

console.log(`Mensajes alineados: ${reference.keys.size} claves en ${locales.length} locales.`);
