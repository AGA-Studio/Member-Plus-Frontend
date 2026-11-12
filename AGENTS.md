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
8. **Use the installed skills every time you write or change UI code.** They live in `.agents/skills/` (if missing, restore them with `npx skills experimental_install`). Read the `SKILL.md` of each one before coding:
   - `ui-ux-pro-max`: UX, accessibility, forms and layout. Use it as a checklist: empty, error and loading states, touch targets, contrast, hierarchy.
   - `emil-design-eng`: component polish and all motion (see rule 9).
   - `frontend-design`: intentional visual decisions and typography, always inside our design system.
   - `playwright-cli`: after finishing UI work, open the app in a real browser, take screenshots at mobile (390px) and desktop widths, and check the console for errors.
   - **Rules 1–7 and `BRAND.md` always win over any skill.** Skills give judgment, not new styles. Never take from a skill: new colors, fonts, hex values, design-system files, code comments, hardcoded text or inline styles. Express every suggestion with our tokens.
9. **Motion: everything must feel fluid and premium, following Emil Kowalski (`emil-design-eng`).** Short animations and transitions that are noticeable but never slow. Always add them.
   - **Animate everything that can be animated.** Every screen, component and state change gets an animation or transition unless a rule below forbids it. When you build or touch UI and something appears, disappears, moves or changes state without motion, add it in the same change. Entrance of screens: wrap sections in `Reveal` (`src/components/ui/reveal.tsx`) or use `revealClasses(index)` from `src/lib/motion.ts` (stagger 40ms per item, 250ms, `ease-out`, opacity plus 8px rise). Do not leave a new screen, dialog, list, card, message or toast static.
   - **Feedback and loading are part of the screen.** Every action that changes data ends with a toast (`useToast` from `src/components/ui/toast-provider.tsx`; after a redirect use `?toast=<key>` with a key from `src/lib/toast-keys.ts`). Every route with data has a `loading.tsx` with `Skeleton` and `LoadingRegion`. Destructive or session-ending actions (delete, cancel, sign out) always ask first in a `Dialog`. The panel scrolls inside `ScrollArea`, never the window, so sidebars and bars stay fixed.
   - **Always:** press feedback on every pressable element (`transition-transform duration-150 ease-out active:scale-97`); smooth state changes (hover, focus, selected, disabled, error) with `transition-colors` or `transition-opacity`; enter and exit animation for anything that appears or disappears (menus, popovers, modals, drawers, toasts, validation messages, list items); a soft fade when a skeleton turns into content.
   - **Easing:** only `ease-out` (entering, exiting, press), `ease-in-out` (movement already on screen) and `ease-drawer` (drawers and sheets). They are strong custom curves defined in `globals.css`. Never `ease-in`. `linear` only for progress bars and spinners.
   - **Duration: always under 300ms.** Press 100–160ms, tooltips and small popovers 125–200ms, dropdowns and selects 150–250ms, modals and drawers 200–300ms (`duration-100` … `duration-300`). Exit is faster than enter.
   - **Enter animations:** start from `scale-95` plus `opacity-0`, using the `starting:` variant (`starting:opacity-0 starting:scale-95`). Never start from `scale-0`. Popovers and dropdowns scale from their trigger (`origin-*`); modals stay centered. Groups of items stagger 30–80ms between items and never block interaction.
   - **Performance:** animate only `transform` and `opacity` (plus color for state changes). Never `transition-all`, and never animate width, height, padding or margin. Prefer CSS transitions over keyframes for anything that can be triggered repeatedly, because transitions can be interrupted.
   - **Frequency rule:** do not animate keyboard-initiated actions or actions repeated hundreds of times a day. In the cashier flow (screens 16–18) keep only press feedback and quick state changes: no entrance animation on every scan or purchase. This is a closed decision in `docs/REVISION.md`; do not change it until the wiki changes. Cashier loading skeletons may use a short opacity fade (`LoadingRegion quick`).
   - **Reduced motion:** `globals.css` already removes movement and keeps opacity and color changes. Add `motion-reduce:` variants only when something needs to be different.
   - **Libraries:** use CSS and Tailwind first. Do not add `motion` (Framer Motion) or any animation library without asking. It is only justified for springs, gestures and layout animations.
   - **Review:** when you review motion, use the Before/After table from the skill, and check the animation in slow motion before finishing.
10. **Figma is the visual source of truth: always compare your code with it.** File "Member+ — Diseño": https://www.figma.com/design/OWje3kJvpbLxZlCOEq1WnF (file key `OWje3kJvpbLxZlCOEq1WnF`).
   - **Before coding** a screen or component that exists in Figma: read it with the Figma MCP (`get_design_context` and `get_screenshot`, after loading the `figma-design-to-code` skill) and build from it, adapting it to our tokens, components and i18n. Check tokens with `get_variable_defs`.
   - **After coding:** render the UI (Playwright screenshots at mobile and desktop widths) and compare it with the Figma screenshot: layout, spacing, sizes, radius, colors, typography, states (hover, focus, disabled, error, empty, loading), copy and icons. Fix every difference and tell the user what matched and what still differs.
   - **If it is not designed in Figma yet,** say so and ask whether to design it first or build it from `BRAND.md`. Never invent a different look.
   - **If Figma and `BRAND.md` or `globals.css` disagree,** do not pick one. Stop, tell the user which value differs, let them decide, then fix the wrong source.
   - Figma variables map to code tokens through the `var(--…)` code syntax stored on each variable.

## Contexto del proyecto

Antes de escribir código, lee [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md): qué es Member+, alcance, reglas de negocio, pantallas, decisiones abiertas y conflictos conocidos entre documentos. La fuente de verdad es el wiki de Outline (enlaces en ese archivo).
