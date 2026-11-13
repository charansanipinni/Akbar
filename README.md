# MD Akbar Hussain — Personal Portfolio

React + TypeScript + Vite. Local-only portfolio with a cream notebook hero, Akbar’s portrait, four animated doors, venture previews, education, experience, achievements, and contact links.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Use the URL printed by Vite. To use the review address http://127.0.0.1:5175, run `npm.cmd run dev -- --port 5175`.

## Build and verify

```powershell
npm.cmd run build
npm.cmd test
```

The Playwright suite covers all four doors, touch and keyboard operation, return focus, navigation, contact destinations, theme switching, continuous title cycling, reduced motion, introduction autoplay and replay, and overflow at 320–1440px.

## Edit content

All personal details, venture entries, skills, education, contact destinations, and asset paths are in `src/content.ts`. The main interface is `src/Portfolio.tsx`. The reference redesign is styled in `src/redesign.css`, with shared geometry and motion in `styles.css` and `motion.css`.

- `public/akbar-portrait.png`: background-removed edit of the supplied portrait.
- `public/ultraeditx-preview.png` and `public/opcreatorlab-preview.png`: screenshots of the supplied public websites.
- `public/fonts/`: locally bundled Google Fonts; the website does not need a runtime font service.

Contact links use the supplied email, phone, LinkedIn and Instagram. No booking URL was supplied. Venture descriptions use the supplied founder information, without fabricated metrics or testimonials.

The pull cord changes the light/evening theme. The notebook cycles continuously without a pause button. Reduced-motion preferences disable decorative animations, title cycling, and animated scrolling.

No deployment has been performed.

## Cinematic interaction update

`src/Depth.tsx` contains the spring-smoothed portrait and project depth effects, accessible image-preview dialog, and scroll-driven journey timeline. `src/cinematic.css` contains the ribbed door surfaces, brass hardware, aperture transition, layered device previews, and name wordmark.

- Move a mouse over the portrait or project display to see depth and changing light.
- Open any door for a single expanding aperture transition into its content.
- Click or tap a project display to enlarge its screenshot. Escape, the close button, or the backdrop closes it and restores focus.
- Reduced-motion mode bypasses the cut and pointer effects. Touch devices keep direct tap interactions.

Validation: production build passes; desktop and mobile navigation, door, preview, keyboard, focus, reduced-motion, and responsive checks pass. The mouse-only portrait check is intentionally skipped on mobile.

Latest client revision: waist-up portrait framing and the original dark green evening theme when the pull cord is activated. The notebook holds a stable width and flips through all three roles. The four door labels are confirmed: UltraEditX, OPCREATORLAB, Skills & Services, and My Journey.

## AI introduction

`public/akbar-intro.mp4` is the completed 6.44-second lip-synced introduction, generated locally with SadTalker from the extended portrait and the existing synthetic voice track (`public/akbar-intro.mp3`, en-IN-PrabhatNeural). The interface displays **Meet Akbar** without an AI-generated badge.

The introduction starts a new playback attempt with sound on every fresh visit and reload. Browsers can block audible autoplay until a visitor interacts; in that case the still portrait remains visible and the first click, tap, or key press retries playback automatically. **Meet Akbar** also starts playback. Selecting **Meet Akbar** during or after playback restarts the introduction. The still portrait returns when it finishes. The video retains the portrait's transparent edges through a CSS mask and includes an accessible transcript, visible introduction text, and an English captions file. Media errors keep the portrait visible and allow retry. Reduced-motion preferences still disable decorative effects; the requested spoken introduction attempts playback in either motion mode.

`src/content.ts` configures the video path and script. Local rendering utilities and downloaded models are ignored under `.media-tools/`; the built website only needs the files in `public/`. No external video account or runtime service is required. Work remains local-only.

Introduction checks cover fresh visits and reloads, audible autoplay when permitted, the first-interaction retry, the blocked-autoplay fallback, replay during and after playback, and retry after a failed media request. The local preview is at http://127.0.0.1:5175 while the development server is running.
