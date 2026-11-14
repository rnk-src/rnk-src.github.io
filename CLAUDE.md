# Portfolio site

Tier: portfolio

Personal portfolio for Rounak, hosted on GitHub Pages at https://rnk-src.github.io.
Stack: Astro (static output), TypeScript, Playwright. Plan: `~/.claude/plans/enchanted-orbiting-gosling.md`.

## Commands

- `make check` runs format check, lint, `astro check`, build and Playwright tests. Run it before every PR.
- `npm run dev` starts the dev server.
- `scripts/sync-mortar-demo.sh` builds the Mortar and Pestle simulation from `../mortar-and-pestle/web` into `public/demos/mortar-pestle`. Commit the output. Run it again after you change that demo.

## Keep notes current

- Update `PROGRESS.md` after every commit, push, PR or decision. Do not wait for `/handoff`.
- Update this file when a command, convention or rule changes.
- `PROGRESS.md` stays untracked. Never let it describe finished work as pending.

## Design skills to use

- Taste skill (`design-taste-frontend`)
- Impeccable skill
- Awesome DESIGN.md skill (a repo of reference files, not an installed skill: https://github.com/VoltAgent/awesome-design-md)

Apply these skills to all design work on this site.

## Testing skill

Use `webapp-testing` to drive the site in a real browser. Check looks and behavior at 1440, 1024, 768 and 390 px.

## Skills install

Skills are gitignored. Reinstall with:

- `npx skills add Leonxlnx/taste-skill`
- `npx skills add anthropics/skills --skill webapp-testing`
- `npx impeccable install`
