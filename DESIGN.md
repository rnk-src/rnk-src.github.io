---
name: Rounak Rai Portfolio
description: A project list set in a quiet night sky, with pixel-art accents and baby penguins.
colors:
  night-ground: '#07060f'
  night-panel: '#0f0b20'
  night-chip: '#151030'
  night-line: '#2a2358'
  night-line-strong: '#4a3f96'
  star-white: '#ece8ff'
  star-muted: '#b6aedd'
  star-faint: '#8f86bd'
  lavender: '#b79cff'
  lavender-bright: '#d4c4ff'
  moon-light: '#e9e3ff'
  moon-crater: '#c9c0f2'
  moon-shade: '#a79ee0'
  planet-violet-base: '#3b3487'
  planet-violet-light: '#5547a8'
  planet-violet-dark: '#211c52'
  planet-violet-ring: '#6b5fc4'
  planet-blue-base: '#34427f'
  planet-blue-light: '#4d62a8'
  planet-blue-dark: '#1d2550'
  planet-plum-base: '#5a3a80'
  planet-plum-light: '#7a52a8'
  planet-plum-dark: '#35214f'
  planet-steel-base: '#2b4a7a'
  planet-steel-light: '#3f6aa8'
  planet-steel-dark: '#172a4a'
  planet-steel-ring: '#4f7fc0'
  chick-head: '#2a2350'
  chick-body: '#a59fc4'
  chick-belly: '#cfcae6'
  chick-flipper: '#7c7699'
  chick-feet: '#4a3f96'
  chick-beak: '#ffb454'
typography:
  display:
    fontFamily: 'Silkscreen, Courier New, monospace'
    fontSize: 'clamp(2.25rem, 8vw, 4rem)'
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Silkscreen, Courier New, monospace'
    fontSize: 'clamp(1.5rem, 4vw, 2rem)'
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: 'Silkscreen, Courier New, monospace'
    fontSize: '1.25rem'
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '0.01em'
  body:
    fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif'
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 700
    lineHeight: 1.55
rounded:
  none: '0px'
spacing:
  step: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  gutter: 'clamp(16px, 5vw, 48px)'
  row: 'clamp(40px, 7vw, 96px)'
components:
  project-card:
    backgroundColor: '{colors.night-panel}'
    textColor: '{colors.star-muted}'
    rounded: '{rounded.none}'
    padding: '24px'
  project-card-hover:
    backgroundColor: '{colors.night-panel}'
  tag-chip:
    backgroundColor: '{colors.night-chip}'
    textColor: '{colors.lavender-bright}'
    typography: '{typography.label}'
    rounded: '{rounded.none}'
    padding: '2px 10px'
  contact-link:
    textColor: '{colors.lavender}'
    typography: '{typography.label}'
  media-frame:
    backgroundColor: '{colors.night-panel}'
    textColor: '{colors.star-faint}'
    rounded: '{rounded.none}'
---

# Design System: Rounak Rai Portfolio

## Overview

**Creative North Star: "The Quiet Night Sky"**

A project list set under a night sky. The projects lead and the theme stays at the edges: sparse stars, a pixel moon, muted planets down the margins, a stepped hill strip and a few baby penguins. Pixel art is an accent and never the page. The strength is deliberately in the middle and can be turned up or down later.

The interface is flat and calm. Panels are one step lighter than the sky, borders are 2px pixel lines with notched corners, and nothing glows. Type pairs a pixel display face for headings with a highly legible sans for reading.

**Key Characteristics:**

- Near-black navy ground with deep violet panels and one lavender accent.
- Pixel display face for headings only. Body text is plain and readable.
- Notched pixel corners instead of rounded ones. No shadows.
- Decorative sprites (moon, planets, penguins) are always `aria-hidden` and never carry content.
- One authored motion moment per row, and everything else is slow, rare or stepped.

## Colors

A night-sky palette: ink-navy ground, violet panels, soft star-white text and a single lavender accent.

### Primary

- **Soft Lavender** (#b79cff): links, list markers and the hover border on cards. Hover raises it to **Bright Lavender** (#d4c4ff).

### Neutral

- **Night Ground** (#07060f): page background and the darkest sky.
- **Night Panel** (#0f0b20): cards, the media frame, the footer and the hill strip.
- **Night Chip** (#151030): tag chips and the lighter planet shadow tone.
- **Night Line** (#2a2358): 2px card borders and the hill-strip highlight.
- **Night Line Strong** (#4a3f96): the penguin's feet and scrollbar thumb.
- **Star White** (#ece8ff): headings and primary text.
- **Star Muted** (#b6aedd): body text on panels.
- **Star Faint** (#8f86bd): dates, placeholder text and the "coming soon" notes.

### Sprite palettes

- **Moon:** #e9e3ff, #c9c0f2, #a79ee0.
- **Penguin:** a dark violet head (#2a2350), white eye patches, an amber beak (#ffb454), a grey-lavender body (#a59fc4) with a lighter belly (#cfcae6) and darker flippers (#7c7699).
- **Planets:** four muted families (violet, blue, plum, steel), each with a base, light and dark tone and a ring on the two ringed planets. They are shown at about half opacity.

### Named Rules

**The One Accent Rule.** Lavender is the only accent. The penguin's amber beak is the only warm colour on the page, and it stays that way.

**The Margin Rule.** Colour and decoration live at the edges and in the sky. Text panels stay quiet.

## Typography

**Display Font:** Silkscreen (with Courier New)
**Body Font:** Atkinson Hyperlegible (with system-ui)

**Character:** A chunky pixel face for names and titles, paired with a sans designed for legibility. Both are self-hosted.

### Hierarchy

- **Display** (700, clamp 2.25rem to 4rem, 1.1): the name in the hero.
- **Headline** (700, clamp 1.5rem to 2rem, 1.1): the "Projects" heading.
- **Title** (700, 1.25rem, 1.1): project titles on cards.
- **Body** (400, 1.0625rem, 1.55): bullets and the role line. Keep measure under 66ch.
- **Small** (400, 0.9375rem, 1.55): dates, role lines, the footer note and placeholder notes.
- **Label** (700, 0.875rem): tag chips, links and repo links.

### Named Rules

**The Pixel Face Rule.** Silkscreen is for headings only. Never set paragraphs or lists in it.

## Layout

A single page with a 1120px max width and a fluid gutter of 16px to 48px. The hero is first, then one row per project, then the footer.

Each project row is a two-column grid. The card takes 5 parts and the media takes 6, and the sides alternate by row. Rows are only as tall as their content, with 40px to 96px of padding between them, so scrolling is continuous. Below 800px a row stacks, with the card first and the media second.

Spacing steps are multiples of 4px, the size of one theme "pixel".

## Elevation & Depth

Flat. Depth comes from tonal layering: ground, then panel, then chip. There are no shadows. Cards raise their border to lavender on hover and keyboard focus, and that is the only elevation cue.

## Shapes

Corners are notched, not rounded. Cards and the media frame use a 2px line and a stepped 4px notch on each corner, made with `clip-path`. There are no border radii anywhere. Sprites render with crisp edges on integer pixel sizes.

## Components

### Project Card

A panel with a 2px night-line border and notched corners. It holds a pixel title, an optional role line, dates, tag chips, 2 to 3 bullets and a repo link at the bottom. Without a repo it shows "Repo link coming soon" in faint text, never a dead link. On hover or focus-within the border turns lavender in two steps.

### Tag Chip

A small flat chip on the chip colour with bright lavender bold text. No border, no radius.

### Contact Link

A 32px single-colour pixel icon (GitHub mark, LinkedIn "in", envelope) beside a bold lavender underlined label. The icon takes the link colour and always keeps its text label.

### Media Frame

A 16:9 notched frame. It holds either a "Demo coming soon" placeholder in the pixel face or a play panel for a YouTube demo. The play panel sits on the page background colour. Two chicks flank the play button, lean toward it and tilt their heads, each with a question mark above. The player loads only after a click, from the privacy-friendly domain. Without JavaScript the panel links to YouTube.

A project can hold a live simulation instead of a video. The frame then shows a poster of the simulation under the same dark play button. A bold label below it reads "Run the simulation in your browser", with the download size in small type. The simulation loads into an iframe only after a click, and the page stops it while it is off screen. Without JavaScript the panel links to the simulation page. On phones the frame is 4:3, so the simulation keeps room for its controls. The built simulation lives in `public/demos/`. Rebuild it with `scripts/sync-mortar-demo.sh`.

### Sprites

The moon, the planets and the penguins are SVG pixel art drawn from character grids. They are decorative and `aria-hidden`. A single chick also peeks out now and then from behind the card or the image in view. It shows only the eyes, half the face or the full face, at a random angle and spot on an edge with room, and never causes horizontal scroll. The penguin blinks, and the planets and shooting stars are the only moving background elements.

## Do's and Don'ts

### Do:

- Do keep pixel art to accents: sky, margins, borders and a few penguins.
- Do keep the penguin to the hero, the footer, the two flanking the play button and one peeking at a time, all in the same chick design.
- Do respect `prefers-reduced-motion`: stop the blink, twinkle, shooting stars, planet drift and row entrance.
- Do keep every text colour at WCAG AA contrast on its background.

### Don't:

- Don't add glows, gradients, gradient text or offset block shadows.
- Don't use rounded corners. Use the notch.
- Don't set body text in the pixel face.
- Don't add a second accent colour.
- Don't invent project facts. Use only resume content.
