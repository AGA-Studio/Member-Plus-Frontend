<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Mandatory rules for every agent

These rules are strict. Follow them in every task, without exception. If a rule conflicts with your default behavior, the rule wins.

1. **No code comments.** Never write comments in code: no `//`, no `/* */`, no JSDoc, no `{/* */}` in JSX, no `TODO` notes. Do not add comments when editing existing files either. Make the code clear through good names instead.
2. **Code is always English. User-facing text is always i18n-ready, never hardcoded.**
   - Code in English: variable, function, type, component, file, folder and route names, and any other identifier. Commit messages (when asked to write them) are in English too.
   - User-facing text means everything the end user sees or reads: screen titles, button text, labels, placeholders, form and validation messages, errors, alerts, toasts, empty states, receipts, `metadata` titles and descriptions, `alt` and `aria-label` values. **Never write this text directly in a component.** Always read it from a translation file by key (for example `t("cashier.confirmPurchase")`).
   - Translation keys are in English. The values live in `messages/<locale>.json` (`es.json`, `en.json`). When you add a key, add it to **every** locale file in the same change.
   - Spanish (`es`) is the default and fallback locale. `es.json` is the source of truth for key types (`src/global.d.ts`).
   - i18n uses `next-intl` **without locale in the URL** (no `/es/...` prefixes, no `app/[lang]` folder). Setup lives in `src/i18n/config.ts` (locales, default, detection) and `src/i18n/request.ts`.
   - The locale is picked automatically: first the `NEXT_LOCALE` cookie, then the browser language (`Accept-Language` header), then `es`. Do not build a manual language picker unless asked.
   - In Server Components use `getTranslations` or `useTranslations`. In Client Components use `useTranslations` (the provider is already in the root layout). Never hardcode strings.
   - Format dates, numbers and currency with the `next-intl` formatters (`useFormatter` / `getFormatter`), never with hardcoded formats.
   - To add a new locale: add it to `locales` in `src/i18n/config.ts` and create its `messages/<locale>.json` with all keys.
   - The root layout sets `export const instant = false` because the locale comes from request data (cookie and headers). Do not remove it.
3. **Always use Tailwind CSS and TypeScript.** Style only with Tailwind utility classes. Do not use CSS modules, styled-components, inline `style` props or new custom CSS files. Write all code in TypeScript (`.ts` / `.tsx`) with proper types. Do not use plain JavaScript and avoid `any`.
4. **Never commit or push unless the user explicitly tells you to.** This means no `git commit`, no `git push`, no amending, no creating branches or PRs on your own. Leave changes uncommitted in the working tree. A past approval does not count for later tasks: ask each time.
5. **Reply short and simple.** Use simple words. Do not write long explanations. Say only what is needed to understand what you did, and tell about any problem you hit. Reply in the same language the user writes in.
6. **Icons: only `lucide-react`.** Import each icon by name (`import { QrCode } from "lucide-react"`). Do not add other icon libraries and do not paste inline SVG icons. Set size and color with Tailwind classes (`className="size-5 text-blue-600"`). Decorative icons get `aria-hidden`. An icon that works as a button, or an icon alone without visible text, needs an `aria-label` that comes from the translation files (rule 2). The Member+ logos are the only images used for branding (`src/assets/brand/`).
7. **Follow the design system in `BRAND.md`.** Read it before building or changing any UI. The tokens live in `src/app/globals.css`.
   - **Use tokens, never raw values.** No hex or rgb colors, no arbitrary Tailwind values (`bg-[#fff]`, `w-[13px]`, `text-[15px]`). The default Tailwind palette (`zinc`, `slate`, `blue`, ...) is disabled on purpose. Use semantic tokens first (`bg-surface`, `text-foreground`, `text-muted`, `bg-primary`, `border-border`, `text-danger-text`), and `brand-*` / `ink-*` only when no semantic token fits.
   - **Typography:** only the defined sizes (`text-display`, `text-title`, `text-heading`, `text-subheading`, `text-lg`, `text-base`, `text-sm`, `text-xs`). Headings use `font-display` (already applied to `h1`–`h4`), body uses `font-sans`, codes and IDs use `font-mono`. Use `tabular-nums` on amounts, points and tables. Form fields are at least `text-base`.
   - **Shape and depth:** buttons and fields `rounded-md`, cards `rounded-lg`, membership card `rounded-card`, modals `rounded-xl`, badges `rounded-full`. Shadows only `shadow-xs` to `shadow-lg`. Borders are always 1px (`border`).
   - **Spacing:** multiples of 4 only. Mobile-first. Page widths with `max-w-page`, `max-w-form`, `max-w-auth`, `max-w-cashier`.
   - **Buttons:** variants are primary, secondary, outline, ghost and danger. One primary button per screen. Danger actions always ask for confirmation. No gradient buttons. Heights: 36, 44 (default), 52 and 64 px (cashier). Minimum touch target is 44px.
   - **Forms:** visible label above the field. Mark optional fields with "(opcional)" in the label, never mark required ones with an asterisk.
   - **Gradients and metallic finishes:** `bg-brand` only in brand moments (login, receipt, customer card). `bg-tier-*` only on membership cards and tier badges.
   - **Dark mode** is manual only: `data-theme="dark"` on `<html>`, never the system preference. Light is always the default. Use `dark:` only when a token does not already handle it.
   - **Copy (Spanish, in `messages/es.json`):** use "tú", no exclamation marks, no emojis, no "Oops". Button labels are verbs in the infinitive ("Guardar cambios", "Registrar compra"), never "Aceptar" or "OK". Never blame the user in error messages. Use the project vocabulary: negocio, cliente, tarjeta, membresía, puntos, cashback, caja, lector.
   - If the design system does not cover something, ask the user before inventing a new color, size or pattern.

## Contexto del proyecto

Antes de escribir código, lee [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md): qué es Member+, alcance, reglas de negocio, pantallas, decisiones abiertas y conflictos conocidos entre documentos. La fuente de verdad es el wiki de Outline (enlaces en ese archivo).
