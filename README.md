# Aino Agency React Animation Notes

This React/Vite build recreates the animation behavior from the original `aino.agency` static codebase. The original animation logic mostly lives in `aino.agency/assets/js/site-core.js` and `aino.agency/assets/js/app.js`; the React port splits that behavior into focused modules under `src/animations`, page components, and shared components.

## Run

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Global Animation Wiring

`src/components/Layout.jsx` initializes the global animation systems on route changes:

- `initHoverCharacters()` from `src/animations/hoverCharacters.js`
- `initScrollReveal()` from `src/animations/scrollReveal.js`
- `initAsciiMediaMode()` from `src/animations/asciiMedia.js`
- `initPixelMediaMode()` from `src/animations/pixelMedia.js`
- `initFractalCanvases()` from `src/animations/fractalCanvas.js`

The current visual mode is stored in `localStorage` as `aino-mode` and applied as HTML classes:

- `default`
- `textmode`
- `pixelmode`

## Animation Reference

| Animation | React file | Used in | How it starts |
| --- | --- | --- | --- |
| Hover character scramble | `src/animations/hoverCharacters.js` | Header nav, buttons, logo text, footer logo hover | Global init scans `.hoverchar` and hover/focus events |
| Scroll fade/scramble reveal | `src/animations/scrollReveal.js` | `.fadein`, `[data-reveal]`, `[data-textreveal]` | IntersectionObserver when element enters viewport |
| ASCII media mode | `src/animations/asciiMedia.js` | Images/videos across site, home intro reveal, work page, footer logo | `html.textmode` or direct `createAsciiMedia()` call |
| Pixel media mode | `src/animations/pixelMedia.js` | Images/videos across site, work page, footer logo support | `html.pixelmode` or direct `createPixelMedia()` call |
| Burn image reveal | `src/animations/scrollReveal.js` + CSS | `.col.burn .image` on work/home cards | IntersectionObserver adds `.revealed` |
| WebGL fractal canvas | `src/animations/fractalCanvas.js` | `.fractal .fractal-canvas`, `FractalBlock.jsx` | Global init scans fractal canvas elements |
| Text/grid physics system | `src/animations/textGridPhysics.js` | Home intro, Play hub, games, contact bounce | Page/component creates a grid instance |
| Home intro grid animation | `src/components/HomeIntro.jsx` | Home page `/` | First visit unless `window._ainoHomeVisited` is set |
| Home ASCII card reveal | `src/components/HomeIntro.jsx` | Home first viewport cards/text | Runs after intro marks `body.ready` |
| Work page grid/list animation | `src/animations/workPage.js`, `src/pages/Work.jsx` | `/work` | Page effect initializes after mount |
| Contact bounce physics | `src/components/ContactBounce.jsx` | `/contact` | Component mount |
| Footer logo hover media | `src/animations/footerLogoHover.js`, `Footer.jsx` | Footer logo | Pointer enter/leave on footer logo |
| Mobile nav/menu fade | `src/components/Navigation.jsx` | Mobile header | Mobile `Menu` button |
| Play hub grid animation | `src/pages/Play.jsx` | `/play` | Page mount and game selection |
| Snekst game | `src/pages/Snekst.jsx` | `/play/snekst` | Space/click starts game |
| Pakku game | `src/pages/Pakku.jsx` | `/play/pakku` | Space/click starts game |
| Textris game | `src/pages/Textris.jsx` | `/play/textris` | Space/click starts game |
| Boss overlay | `src/components/BossOverlay.jsx` | Play game pages | `[!]` button after game starts |

## Detailed Animation Logic

### 1. Hover Character Scramble

File: `src/animations/hoverCharacters.js`

Used by:

- Header/nav via `.hoverchar`
- Buttons and text links
- Footer logo hover through `footerLogoHover.js`
- Any element with `.hoverchar`

How it works:

- `initHoverCharacters(root)` scans for `.hoverchar`.
- On pointer/focus interaction it walks text nodes inside the element.
- It stores the original characters, then temporarily replaces visible characters with nearby characters from the Aino character pool.
- The effect is distance-aware: characters closer to the pointer distort more strongly.
- It restores the original text as the animation completes.

Important data attributes:

- `data-dx`
- `data-dy`
- `data-duration`

These tune the distortion spread and duration.

### 2. Scroll Fade/Scramble Reveal

File: `src/animations/scrollReveal.js`

Used by:

- `.fadein`
- `[data-reveal]`
- `[data-textreveal]`
- `.col.burn .image`

How it works:

- `initScrollReveal(root)` uses `IntersectionObserver`.
- `.fadein` elements reveal with text scrambling through `revealText()`.
- `[data-reveal]` elements get the `.revealed` class after their delay.
- `[data-textreveal="scramble"]` runs text scrambling once visible.
- `.col.burn .image` gets `.revealed`, letting CSS run the burn/overlay reveal.

Text reveal logic:

- Finds text nodes.
- Temporarily replaces real characters with non-breaking spaces.
- On each animation frame, characters resolve from the Aino character pool back to their original value.
- Supports speed, duration, random ordering, and completion callback.

### 3. ASCII Media Mode

File: `src/animations/asciiMedia.js`

Used by:

- Global text mode for images/videos
- Home intro card reveal
- Work page media transitions
- Footer logo hover

How it works:

- `initAsciiMediaMode(root)` watches `html.textmode`.
- It scans `img:not(.raw), video:not(.raw)` outside `.gridcontainer`.
- `createAsciiMedia(media, options)` creates a sibling `<div class="ascii">`.
- The source media is drawn into a small canvas.
- Pixel luminance is converted into characters from `NO0A869452I3?!<>=+/:-·`.
- Videos update through `requestVideoFrameCallback` when available.

Fade-in mode:

- `fadein: { duration, sweep }` reveals ASCII characters gradually.
- The sweep can reveal rows at slightly different times.
- Used by the home intro handoff and work page media reveal.

### 4. Pixel Media Mode

File: `src/animations/pixelMedia.js`

Used by:

- Global pixel mode
- Work page media transitions
- Footer/logo mode behavior

How it works:

- `initPixelMediaMode(root)` watches `html.pixelmode`.
- It creates a `<canvas class="pixelate">` next to each media element.
- The media is drawn at reduced resolution, then scaled back up without smoothing.
- A second overlay canvas is used for reveal/glitch-style masking.
- Videos update while playing.

### 5. Burn Image Reveal

Files:

- Logic: `src/animations/scrollReveal.js`
- Markup usage: `Column` with `burn`
- Styling: original CSS imported through `src/styles/chunks/original-main.css`

Used by:

- Home project cards
- Work cards/case media where `.col.burn .image` exists

How it works:

- `Column` adds `.burn`.
- `ImageBlock` or `VideoBlock` creates `.image`/`.video`.
- `initScrollReveal()` observes `.col.burn .image`.
- When visible, the `.image` gets `.revealed`.
- CSS handles the overlay/burn transition.

### 6. WebGL Fractal Canvas

File: `src/animations/fractalCanvas.js`

Used by:

- `src/components/FractalBlock.jsx`
- Elements matching `.fractal .fractal-canvas`

How it works:

- `initFractalCanvases(root)` scans for `.fractal .fractal-canvas`.
- A raw WebGL context is created.
- Vertex and fragment shaders render the fractal field.
- Uniforms update time, resolution, pointer, and color/appearance values.
- ResizeObserver keeps the canvas resolution matched to the element.
- The render loop runs with `requestAnimationFrame`.

### 7. Text/Grid Physics System

File: `src/animations/textGridPhysics.js`

Used by:

- `HomeIntro.jsx`
- `Play.jsx`
- `Snekst.jsx`
- `Pakku.jsx`
- `Textris.jsx`
- `ContactBounce.jsx`

Core ideas:

- Converts text, rectangles, canvas pixels, and video frames into character points.
- Each point has normalized position, velocity, target position, value, and context.
- `render(points)` writes the character grid into a monospaced DOM element.
- `applyPhysics(points, delta)` moves points toward targets and applies velocity.
- `gravitate(points)` makes points fall.
- `explode(points)` pushes points outward.
- `morph(fromPoints, toPoints)` transitions one text/canvas shape into another.
- `createFromCanvas()` maps canvas luminance to ASCII-like characters.
- `createVideo()` samples video frames and blends them into grid points.

This is the shared engine behind the home intro, the Play page, and all text-grid games.

### 8. Home Intro Grid Animation

File: `src/components/HomeIntro.jsx`

Route:

- `/`

Original reference:

- `site-core.js` around `ct()`

How it works:

- On first visit, `body.ready` is removed and the full-screen `.gridcontainer` is shown.
- A moving ASCII wave is generated across the viewport.
- The top nav is first represented as a line of `=` characters.
- That line morphs into text points for `Aino`, `Work`, `Services`, `About`, `Play`, `Settings`, and `Contact`.
- The real nav fades in after the grid nav resolves.
- Pointer position controls the wave and places the `Click` prompt.
- On touch devices the prompt becomes `Tap to continue`.
- Click/tap triggers exit:
  - current wave points explode/fall
  - points morph into the Aino logo sampled from `/aino.svg`
  - intro video `sm4.mp4` blends into the text grid
  - final click or video end explodes the points
  - `body.ready` is added and home content is revealed

Skip behavior:

- If `window._ainoHomeVisited` is already true, the intro is skipped and the page is marked ready immediately.

### 9. Home ASCII Card Reveal

File: `src/components/HomeIntro.jsx`

Used by:

- First-viewport media inside `.home-content`
- First-viewport `.home-content .html`

Original reference:

- `site-core.js` immediately after the intro sets `body.ready`

How it works:

- After intro finish, React waits two animation frames so `.home-content` is visible and measurable.
- It scans `.home-content .image img` and `.home-content .video video`.
- Only media whose top is inside the current viewport is included.
- Real media opacity is set to `0`.
- `createAsciiMedia()` creates an ASCII version with `forceShow` and fade sweep.
- After `800ms`, the ASCII layer fades out while the real media fades back to opacity `1`.
- Visible `.home-content .html` blocks run `revealText()` with faster speed and longer duration.

### 10. Work Page Grid/List Animation

Files:

- `src/pages/Work.jsx`
- `src/animations/workPage.js`

Route:

- `/work`

How it works:

- `Work.jsx` renders the project controls and card/list markup.
- `initWorkPageAnimations(root)` handles mode changes and media reveal.
- Grid/list controls use the existing `.menu` UI.
- When media enters the view or mode changes:
  - default mode shows real media
  - text mode creates/reuses ASCII media
  - pixel mode creates pixel canvas media
- Work media reveal uses staggered ASCII/pixel transitions so cards do not all resolve at once.
- Hover/case grouping behavior is handled through project item classes and link structure.

### 11. Contact Bounce Physics

File: `src/components/ContactBounce.jsx`

Route:

- `/contact`

How it works:

- Creates a text-grid instance for the `.bounce` element.
- Converts the word `Contact` into character points.
- Points are given velocity and gravity.
- They bounce inside the available grid area.
- The render loop keeps the text moving as physics points instead of regular DOM text.

### 12. Footer Logo Hover Media Animation

Files:

- `src/animations/footerLogoHover.js`
- `src/components/Footer.jsx`

Original reference:

- `app.js` footer module

How it works:

- Footer logo hover reads the current image mode.
- In text mode, it uses the existing ASCII logo/media layer.
- In pixel mode, it temporarily hides the pixel layer and runs the ASCII/hover-character effect.
- In default mode, it creates a temporary ASCII media layer for the logo image.
- The ASCII layer also receives `.hoverchar`, so the character scramble effect runs through `scrambleHoverCharacters()`.
- On pointer leave, the effect restores the previous footer logo state.

### 13. Mobile Nav/Menu Fade

File:

- `src/components/Navigation.jsx`

Original reference:

- `app.js` header module

How it works:

- Mobile `Menu` toggles a full-screen `.mobile-container`.
- It clones the desktop nav links into large `.mega` links.
- `Play` is filtered out like the original.
- Each mega link fades in with a staggered delay.
- The mobile footer fades in after the links.
- While open, the Contact button is hidden and the menu button becomes `Close`.
- The mobile footer includes New Business contact info and Settings.

### 14. Play Hub Grid Animation

File:

- `src/pages/Play.jsx`

Route:

- `/play`

How it works:

- Uses `createTextGridPhysics()` to render a text-grid menu.
- Game names and descriptions are turned into point groups.
- Hover/keyboard selection changes the active group.
- Selecting a game triggers a transition where text points move/explode toward the selected route.
- Navigation then moves to the selected game page.

### 15. Snekst Game

File:

- `src/pages/Snekst.jsx`

Route:

- `/play/snekst`

How it works:

- Uses the text-grid engine as a Snake-style game renderer.
- Background, stats, title, snake body, and food are all text points.
- `setInterval()` drives snake movement.
- Arrow keys/WASD change direction.
- Food increases score and decreases interval delay.
- Game over turns points into falling physics.
- High-score initials are entered directly through text-grid UI.
- Boss overlay `[!]` appears only while the game is active.

### 16. Pakku Game

File:

- `src/pages/Pakku.jsx`

Route:

- `/play/pakku`

How it works:

- Uses the text-grid engine for a Pac-Man-style game.
- Maze tiles, dots, player, ghosts, fruit, stats, and titles are text points.
- `setInterval()` drives the game tick.
- Arrow keys/WASD set the next direction.
- Ghosts use chase/scatter/frightened state logic.
- Eating dots updates score and level progress.
- Death and level-clear animations run as timed text-grid frames.
- Game over uses falling point physics.
- Boss overlay pauses the game by toggling the internal `isPaused` flag.

### 17. Textris Game

File:

- `src/pages/Textris.jsx`

Route:

- `/play/textris`

How it works:

- A hidden canvas runs Tetris-style board drawing.
- The canvas is sampled into text-grid points.
- Board, next piece, title, stats, and game-over UI are rendered as text.
- Keyboard controls move, rotate, drop, pause, and end.
- `requestAnimationFrame()` drives the game.
- On game over, visible points fall with physics.
- Boss overlay calls the game pause toggle on open and close.

### 18. Boss Overlay

File:

- `src/components/BossOverlay.jsx`

Used by:

- `Snekst.jsx`
- `Pakku.jsx`
- `Textris.jsx`

Original reference:

- `site-core.js` helper `xt()`

How it works:

- Game pages render the overlay component but keep the button hidden.
- When a game starts, `bossRef.current.show()` reveals `[!]`.
- When game over starts, `bossRef.current.hide()` hides it.
- Clicking `[!]` shows a full-screen fake business report.
- Opening the overlay calls `onPause`.
- Closing with `[X]` or Escape calls `onResume`.
- Escape is captured before game handlers so it closes the overlay instead of ending the game.

## CSS/Markup Dependencies

Most effects depend on original class names. Important selectors include:

- `.hoverchar`
- `.fadein`
- `[data-reveal]`
- `[data-textreveal]`
- `.image`
- `.video`
- `.ascii`
- `.pixelate`
- `.overlay`
- `.col.burn .image`
- `.fractal .fractal-canvas`
- `.gridcontainer`
- `.mobile-container`
- `.mega`
- `.boss-btn`
- `.boss-overlay`

The imported original styles in `src/styles/chunks/original-main.css` provide much of the visual behavior. Project-specific corrections live mainly in `src/styles/chunks/pages.css`, `navigation.css`, and `footer.css`.

## Adding A New Animation

1. Keep the original class names when possible.
2. Put reusable DOM/canvas logic in `src/animations`.
3. Initialize route-wide effects from `Layout.jsx` only if they are global.
4. Initialize page-specific effects inside the page/component `useEffect`.
5. Return cleanup functions for observers, timers, animation frames, and generated DOM nodes.
6. Run `npm run lint` and `npm run build`.
# aino.agency
