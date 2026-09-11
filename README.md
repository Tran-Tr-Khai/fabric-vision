# Fabric Vision

Frontend prototype for an industrial fabric image collection workstation. React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui-style Radix primitives, and Lucide icons.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` checks TypeScript and creates the production bundle in `dist/`. `npm run preview` serves that build locally.

## Structure

- `src/types.ts`: station, camera, capture event, image, and configuration types.
- `src/data/mock.ts`: seed station, camera list, events, and image factory. Add cameras to the array to extend the grid; rendering and capture grouping are data-driven.
- `src/hooks/useCollection.ts`: shared in-memory collection state, synchronous event grouping, timer lifecycle, and capture feedback.
- `src/hooks/useLabeling.ts`: local review state for labels, defect types, notes, and reviewed status.
- `src/components/`: capture workspace components and accessible camera/event dialogs.
- `src/components/ui/`: local shadcn-style Button and Radix Dialog primitives. `components.json` supplies the shadcn configuration.
- `src/pages/`: Dataset browsing, Settings, and a minimal station landing page.
- `src/index.css`: theme, component styles, and responsive layouts.
- `public/fabric.svg`: bundled procedural woven-fabric placeholder. No external image service is needed.

## Prototype behavior

Station capture creates one event with images from every online camera. Individual capture creates one event with one image. Starting automatic collection captures immediately and then repeats at the configured interval; stopping clears the timer. Navigating between pages preserves the current session.

Dataset supports text search, date/station/camera/machine filters, grid/table layouts, image metadata, and parent-event inspection. Settings affect subsequent mock captures and camera readouts. Each event retains a station snapshot so subsequent configuration changes do not rewrite historical metadata. Changes are disabled while collection is running.

Labeling provides a review queue, event-scoped review from Recent Captures, local label/defect decisions, notes, review summaries, and previous/next/skip navigation. Review state remains local to the current browser session.

Run `npm run format` to format source files or `npm run format:check` to verify formatting.

All data and settings are held in memory and reset on reload. Preview assets are illustrative fabric textures; reported image dimensions and file sizes are mock metadata, not properties of the SVG asset. No real camera access, image processing, backend, database, ML, annotation, or external service integration is included.
