# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.25.1](https://github.com/oriondor/orio-ui/compare/v1.25.0...v1.25.1) (2026-05-27)


### Bug Fixes

* aligned to a new prop forwarding ([#155](https://github.com/oriondor/orio-ui/issues/155)) ([4dc7289](https://github.com/oriondor/orio-ui/commit/4dc72893d04131abd81d8896a01a71045eccbc63))

## [1.25.0](https://github.com/oriondor/orio-ui/compare/v1.24.0...v1.25.0) (2026-05-26)

This PR adds a generic 2D roving-grid composable, integrates roving focus into Calendar navigation and day grid, updates ControlElement/Input/Button to pass merged control attrs, updates calendar i18n keys, and refreshes Calendar docs examples to new demo dates.
## [1.24.0](https://github.com/oriondor/orio-ui/compare/v1.23.3...v1.24.0) (2026-05-09)

This PR refactors the date picker system by introducing a reusable Calendar primitive component, restructuring DatePicker and DateRangePicker as higher-level wrappers, adding date utility functions, and updating documentation and tests to match the new architecture.
## [1.23.3](https://github.com/oriondor/orio-ui/compare/v1.23.2...v1.23.3) (2026-05-04)

The Canvas export functionality is refactored and exposed. Export logic is extracted into reusable `renderCanvasSnapshot` and `performExport` functions with new types (`ExportOptions`, `ExportResult`). An `exportCanvas` method is added to `CanvasContext` and implemented in the Canvas component, re-exported via the canvas runtime module.
## [1.23.2](https://github.com/oriondor/orio-ui/compare/v1.23.1...v1.23.2) (2026-04-30)

This PR introduces a named registry system for the Canvas component, enabling toolbars to be mounted anywhere in the component tree and bind to specific canvas instances by name. A `canvasRegistry` module tracks canvas contexts by identifier, while the Canvas component registers itself on mount and the Toolbar resolves its target canvas via an explicit `canvas` prop.
## [1.23.1](https://github.com/oriondor/orio-ui/compare/v1.23.0...v1.23.1) (2026-04-23)

The changes add two-finger touch gesture support to ZoomableContainer.vue, enabling pinch zoom and pan operations. When two touch pointers are detected, the component enters pinch mode, calculates zoom and pan transformations from the pinch midpoint, and gracefully handles state transitions when touches begin or end.
## [1.23.0](https://github.com/oriondor/orio-ui/compare/v1.22.2...v1.23.0) (2026-04-21)

Added a new CarouselPreview component, its documentation, and a runtime export. The component renders a horizontal thumbnail strip, syncs selection via a shared `v-model:activeImage` with the main carousel, and auto-hides when fewer than two images exist.
## [1.22.2](https://github.com/oriondor/orio-ui/compare/v1.22.1...v1.22.2) (2026-04-21)

This PR introduces interactive transformation tools for the Canvas component (rotate, resize, transform modes), adds image insertion and canvas export capabilities, implements a new ZoomableContainer component, extends canvas rendering to support node rotation, updates package exports to include canvas subpath, and provides comprehensive documentation for these features.
## [1.22.1](https://github.com/oriondor/orio-ui/compare/v1.22.0...v1.22.1) (2026-04-17)

Adds handle-based transform features (rotate, resize, combined transform), image import and canvas export tools, cursor-override API, rotated-node rendering and hit-testing, new tooltips/icons/docs, exports for new tools, and tests covering interactions and export behavior.
## [1.22.0](https://github.com/oriondor/orio-ui/compare/v1.21.0...v1.22.0) (2026-04-16)

Adds a new Canvas feature: a pluggable, tool-driven HTML <canvas> system with tool APIs, stage/toolbar UI, node CRUD/history composables, nine built-in tools, hit-testing utilities, docs, i18n, icon additions, and small auto-registration/theme fixes.
## [1.21.0](https://github.com/oriondor/orio-ui/compare/v1.20.0...v1.21.0) (2026-04-10)

Adds vue-i18n: new runtime i18n module and en/uk resources, a Nuxt runtime i18n plugin and module registration, package dependency update, localized component text and locale-aware formatting, docs/theme locale switcher, updated tests, and a new LocaleSwitcher component. (50 words)
## [1.20.0](https://github.com/oriondor/orio-ui/compare/v1.19.0...v1.20.0) (2026-04-06)

### feat: Implemented list item and taggable select; Integrated list item into a select ([#134](https://github.com/oriondor/orio-ui/pull/134))

Adds two new components (ListItem, TaggableSelector), updates Selector to render options via ListItem and delegate selectable/selected state, adjusts CheckBox and Tag typings/styling, updates public exports, and adds/updates documentation and site styling; docs component count changed from 32 → 34.

### fix(button): Added possibility for the control element to fill the block ([#132](https://github.com/oriondor/orio-ui/pull/132))

This PR updates the component count in documentation from 31 to 32, and adds a new optional `fill` prop to the ControlElement component that enables child elements to expand and fill available space through flexbox styling.

## [1.19.0](https://github.com/oriondor/orio-ui/compare/v1.18.1...v1.19.0) (2026-03-26)

Fixes:
Adds a runtime control-size composable (provide/inject) and applies computed size token styles to components; refactors carousel measurement to use explicit measured dimensions and broader child selectors; replaces HTMLAudioElement playback with a cached Web Audio API pipeline and async play/prefetch.

Features:
Adds a new Vue Form component with model-bound field wiring, submit emission, and loading/disabled handling, plus documentation and an export from the runtime index.

CI/CD:
The PR updates the changelog injection workflow to use HTML comment markers instead of override blocks, renaming the job accordingly. Additionally, a new workflow is introduced that automatically enriches the changelog by extracting and inserting CodeRabbit summaries from referenced PRs into the latest version section.
## [1.18.1](https://github.com/oriondor/orio-ui/compare/v1.18.0...v1.18.1) (2026-03-22)


### Bug Fixes

* **release:** match tag format by disabling component prefix ([#125](https://github.com/oriondor/orio-ui/issues/125)) ([53d608d](https://github.com/oriondor/orio-ui/commit/53d608db89267c770785d23eaf49b7bd388b02e3))

## [1.18.0](https://github.com/oriondor/orio-ui/compare/v1.17.0...v1.18.0) (2026-03-12)


### Keyboard & Accessibility

* Full keyboard navigation for Selector — Arrow keys, Home/End, Enter/Space/Escape now navigate and select options with automatic scroll-into-view
* ARIA attributes — Selector exposes `aria-haspopup`, `aria-expanded`, `aria-multiselectable`, `aria-selected`, `role="listbox"`, and `role="option"` for screen reader support

### Component Improvements

* Popover — Migrated to TypeScript with typed props (`position`, `offset`, `disabled`), automatic fallback repositioning when the popover overflows the viewport
* Badge — New option to hide the badge; updated documentation with additional examples
* Icon — Sizing now driven by `--control-icon-size` CSS custom property instead of a static prop, allowing icons to auto-scale with ControlElement size variants

### Architecture & Bug Fixes

* Standardized attribute forwarding — ControlElement uses `inheritAttrs: false` with explicit `$attrs` binding; all consumers (Button, Input, Textarea, Selector, CheckBox, etc.) cleanly separate control-level props from native HTML attributes forwarded to inner elements
* RadioButton — `label` prop renamed to `text` to avoid collision with `ControlProps.label`
* Fixed input click handling — Removed `pointer-events: none` on inner layout so floating-label inputs correctly receive click events

### Internal

* New `useListKeyboard` composable — reusable keyboard navigation logic for list-based components
* 20 files changed across the codebase with a net addition of ~200 lines

## [1.17.0](https://github.com/oriondor/orio-ui/compare/v1.16.2...v1.17.0) (2026-02-27)


### Features

* add control-label-font-size variable and adjust inner layout spacing ([54d3b55](https://github.com/oriondor/orio-ui/commit/54d3b55d4b4767107793269a31d5fa438e2c6c3c))

## [1.16.2](https://github.com/oriondor/orio-ui/compare/v1.16.1...v1.16.2) (2026-02-25)


### Bug Fixes

* Added minimal appearance for carousel component ([9e8e525](https://github.com/oriondor/orio-ui/commit/9e8e5255a9a3f7aa10ebcd71841b2232bcd8c183))
* **badge:** reduce horizontal padding from 0.5rem to 0.35rem ([4c843b3](https://github.com/oriondor/orio-ui/commit/4c843b3088198a77fcd5b375cf4feb8c0d398d22))
* effort to make ai-generated changelog ([#105](https://github.com/oriondor/orio-ui/issues/105)) ([ec279f5](https://github.com/oriondor/orio-ui/commit/ec279f559c38774a5f8b4a2c5bf44b4bd970d0f7))

## [1.16.1](https://github.com/oriondor/orio-ui/compare/v1.16.0...v1.16.1) (2026-02-24)


### Bug Fixes

* missing import in urlSync composable ([bc61531](https://github.com/oriondor/orio-ui/commit/bc61531588cc166294bf2f58e0be8288dacd60bc))

## [1.16.0](https://github.com/oriondor/orio-ui/compare/v1.15.0...v1.16.0) (2026-02-24)


### Features

* added url syncer, reactively add given props to url ([0f21903](https://github.com/oriondor/orio-ui/commit/0f2190328435981bad6c8ec38dd0c4b9bb96b4a8))

## [1.15.0](https://github.com/oriondor/orio-ui/compare/v1.14.0...v1.15.0) (2026-02-23)


### Features

* created checkbox group component ([666681c](https://github.com/oriondor/orio-ui/commit/666681cf98a7eb5a8ef7652da9effb4e483dab95))
* Implemented radio button component ([0394708](https://github.com/oriondor/orio-ui/commit/0394708b82ff719b0329802bf632936c85db1bee))

## [1.14.0](https://github.com/oriondor/orio-ui/compare/v1.13.1...v1.14.0) (2026-02-19)


### Features

* Added sizing options for everything reasonable that is wrapped into control element ([e3ddf68](https://github.com/oriondor/orio-ui/commit/e3ddf68aa09841fb50e8f8611bebe3136ca87525))

## [1.13.1](https://github.com/oriondor/orio-ui/compare/v1.13.0...v1.13.1) (2026-02-16)


### Bug Fixes

* simplified dynamic size calculation for carousel with resize observer ([cbc55f1](https://github.com/oriondor/orio-ui/commit/cbc55f1569d0603f384bc18a3f213141ed66ac7e))

## [1.13.0](https://github.com/oriondor/orio-ui/compare/v1.12.2...v1.13.0) (2026-02-11)


### Features

* added inner label to number input element ([f0076a6](https://github.com/oriondor/orio-ui/commit/f0076a64ead63a13d1542b23f0c84799ea5228d7))
* added inner layout to input and textarea ([3d825ca](https://github.com/oriondor/orio-ui/commit/3d825ca28062aebdd168b6732931b3278e091021))


### Bug Fixes

* improved accessibility on switch and datepicker ([2113705](https://github.com/oriondor/orio-ui/commit/21137058882ebaa78f762a1fff92cbc161397492))
* revised font-sizes and line-heights ([2128a6e](https://github.com/oriondor/orio-ui/commit/2128a6e7872e6e2d88376544cf4f1c972482253c))
* small change for carousel, so that it only shows controls when there're more that 1 image ([d26f36b](https://github.com/oriondor/orio-ui/commit/d26f36b3107145974cf558703800c57bad3eb666))

## [1.12.2](https://github.com/oriondor/orio-ui/compare/v1.12.1...v1.12.2) (2026-02-06)


### Bug Fixes

* Dynamic carousel sizing based on content inside ([151a06f](https://github.com/oriondor/orio-ui/commit/151a06f16b644d93aef6f9be1f393091d5cea6a3))

## [1.12.1](https://github.com/oriondor/orio-ui/compare/v1.12.0...v1.12.1) (2026-02-05)


### Bug Fixes

* expose slot image from carousel, updated docs ([006ecb0](https://github.com/oriondor/orio-ui/commit/006ecb0f36621e51c1d8d3efbfefcd671b422b5b))

## [1.12.0](https://github.com/oriondor/orio-ui/compare/v1.11.10...v1.12.0) (2026-02-01)


### Features

* Banner component ([9eb9be1](https://github.com/oriondor/orio-ui/commit/9eb9be149ba0132c3f485786986b5ccd2d7cd94a))

## [1.11.10](https://github.com/oriondor/orio-ui/compare/v1.11.9...v1.11.10) (2026-01-29)


### Bug Fixes

* center the text inside the button (comes in handy for full-width buttons) ([8a758f6](https://github.com/oriondor/orio-ui/commit/8a758f6795bdbd0c6bc1a57a69805cbcb9d995c4))
* SSR friendly modal and updated exports ([8f8f487](https://github.com/oriondor/orio-ui/commit/8f8f4874d70f2c4fd5262da9ed7259b4dc89c51a))

## [1.11.9](https://github.com/oriondor/orio-ui/compare/v1.11.8...v1.11.9) (2026-01-28)


### Bug Fixes

* added possibility to change validation rules ([31435e5](https://github.com/oriondor/orio-ui/commit/31435e5edfd4cbf7e88ac8e557aa97f22791b9e0))

## [1.11.8](https://github.com/oriondor/orio-ui/compare/v1.11.7...v1.11.8) (2026-01-28)


### Bug Fixes

* Improved modal (teleport to body + added header, footer and scrollable content) ([c6bafdf](https://github.com/oriondor/orio-ui/commit/c6bafdfe7ee2f5a0801d870ca2cc162291f0edbf))

## [1.11.7](https://github.com/oriondor/orio-ui/compare/v1.11.6...v1.11.7) (2026-01-28)


### Bug Fixes

* better demonstration of component library and guide on overriding the themes ([d75622c](https://github.com/oriondor/orio-ui/commit/d75622cd9f4e5845c4f27bd6cd51b3379168c67f))
* blocking script in the nuxt module ([e5419cf](https://github.com/oriondor/orio-ui/commit/e5419cf0817497159025cdd44f98267fb62454a1))
* deprecation warnings ([967bfcb](https://github.com/oriondor/orio-ui/commit/967bfcb577c26720b33998899f2b3357ab78f246))

## [1.11.6](https://github.com/oriondor/orio-ui/compare/v1.11.5...v1.11.6) (2026-01-26)


### Bug Fixes

* manifest change ([b56e49f](https://github.com/oriondor/orio-ui/commit/b56e49fb3c928570d86e542cd5ba87200bbd3ff0))

## [1.11.5](https://github.com/oriondor/orio-ui/compare/v1.11.4...v1.11.5) (2026-01-26)


### Bug Fixes

* effort to fix npm publish ([04dc290](https://github.com/oriondor/orio-ui/commit/04dc290a08afb81900e5f8eca0b8818165319c82))

## [1.11.4](https://github.com/oriondor/orio-ui/compare/v1.11.3...v1.11.4) (2026-01-26)


### Bug Fixes

* corrected docs and implemented interactive presentation for useTheme ([2868a67](https://github.com/oriondor/orio-ui/commit/2868a67ec8b127f5ef3ac48220ced248aed83de3))

## [1.11.3](https://github.com/oriondor/orio-ui/compare/v1.11.2...v1.11.3) (2026-01-26)


### Bug Fixes

* remove duplicated import ([7f9cd6d](https://github.com/oriondor/orio-ui/commit/7f9cd6d28cc14d637c3a535c19c21e517d713fda))
* useTheme, both SSR and client -friendly ([9d74b29](https://github.com/oriondor/orio-ui/commit/9d74b2900a8e1352346d83663ba1ddf61d02750b))

## [1.11.2](https://github.com/oriondor/orio-ui/compare/v1.11.1...v1.11.2) (2026-01-23)


### Bug Fixes

* added infor family colors ([dda9b10](https://github.com/oriondor/orio-ui/commit/dda9b10f939359244bc976b2cce45633ab51766a))
* added success color ([a1ae6b8](https://github.com/oriondor/orio-ui/commit/a1ae6b826ee89c468fc12ce404299410c5dc8a80))

## [1.11.1](https://github.com/oriondor/orio-ui/compare/v1.11.0...v1.11.1) (2026-01-22)


### Bug Fixes

* override attrs on input field ([2862d8a](https://github.com/oriondor/orio-ui/commit/2862d8afbe0a5b98537e13fa5186ec12dc1f1fa6))

## [1.11.0](https://github.com/oriondor/orio-ui/compare/v1.10.4...v1.11.0) (2026-01-22)


### Features

* added validator composable to validate non-form (and form) control elements ([e43b5a6](https://github.com/oriondor/orio-ui/commit/e43b5a62f07f7649ad23cdbabcc01c986cd3cd02))

## [1.10.4](https://github.com/oriondor/orio-ui/compare/v1.10.3...v1.10.4) (2026-01-20)


### Bug Fixes

* updated counts and link to a sound ([1667151](https://github.com/oriondor/orio-ui/commit/16671512165be417c0cf8586bf492b551f764f7e))

## [1.10.3](https://github.com/oriondor/orio-ui/compare/v1.10.2...v1.10.3) (2026-01-20)


### Bug Fixes

* fixed docs for animated container, added fancy mechanical sound effect (used as composable) ([14499ed](https://github.com/oriondor/orio-ui/commit/14499edf77a3732be2292ce1a470dc77b9041a79))

## [1.10.2](https://github.com/oriondor/orio-ui/compare/v1.10.1...v1.10.2) (2026-01-20)


### Bug Fixes

* added animated container ([5299808](https://github.com/oriondor/orio-ui/commit/52998089eb2a007b64b61356de888964a01bad50))
* better UI (gap) for control element ([544e896](https://github.com/oriondor/orio-ui/commit/544e896f628b328551a5a8579fcbf164ca20a8f9))

## [1.10.1](https://github.com/oriondor/orio-ui/compare/v1.10.0...v1.10.1) (2026-01-20)


### Bug Fixes

* inherit correct line height, but remove it from number input controls ([916b5d1](https://github.com/oriondor/orio-ui/commit/916b5d1e3ee3ca15908d45299eae25806ef0f14d))

## [1.10.0](https://github.com/oriondor/orio-ui/compare/v1.9.2...v1.10.0) (2026-01-19)


### Features

* create badge component that can wrap any component and draw badge on top right of it ([705e2af](https://github.com/oriondor/orio-ui/commit/705e2af9262c54defabdc511439b568b372fd81b))

## [1.9.2](https://github.com/oriondor/orio-ui/compare/v1.9.1...v1.9.2) (2026-01-19)


### Bug Fixes

* control element should take as much space in width as outer block allows ([f177641](https://github.com/oriondor/orio-ui/commit/f177641f2af6d4b7614f22d321853805b93236ab))

## [1.9.1](https://github.com/oriondor/orio-ui/compare/v1.9.0...v1.9.1) (2026-01-19)


### Bug Fixes

* hide standard controls ([218c6fe](https://github.com/oriondor/orio-ui/commit/218c6fe6b5304dd10505a1791b7c68e231aa2e24))

## [1.9.0](https://github.com/oriondor/orio-ui/compare/v1.8.0...v1.9.0) (2026-01-19)


### Features

* Implemented horizontal and vertical number inputs based on generic number input ([5dbcb06](https://github.com/oriondor/orio-ui/commit/5dbcb06bf5bd4f9490a0e5f71db9081d2c576fd0))

## [1.8.0](https://github.com/oriondor/orio-ui/compare/v1.7.5...v1.8.0) (2026-01-17)


### Features

* Implemented number input component ([47da272](https://github.com/oriondor/orio-ui/commit/47da272e8ec8a68bc863a6c6b1fb9a20a1ec6cd1))

## [1.7.5](https://github.com/oriondor/orio-ui/compare/v1.7.4...v1.7.5) (2026-01-16)


### Bug Fixes

* inconsistencies between components and docs ([83037e7](https://github.com/oriondor/orio-ui/commit/83037e70ae824329a6c210afa737403e5a12845b))
* popover – removed default toggle in the popover itself ([f01bea3](https://github.com/oriondor/orio-ui/commit/f01bea355296a13b9d1b6b7b33810162d0a13cd5))

## [1.7.4](https://github.com/oriondor/orio-ui/compare/v1.7.3...v1.7.4) (2026-01-16)


### Bug Fixes

* Major fixes for Selector component ([c6dfa91](https://github.com/oriondor/orio-ui/commit/c6dfa9103dd48979248ad74fa96e3b59f2959fb1))

## [1.7.3](https://github.com/oriondor/orio-ui/compare/v1.7.2...v1.7.3) (2026-01-16)


### Bug Fixes

* silly issue when you cancel the upload dialog - all files removed ([49b0a43](https://github.com/oriondor/orio-ui/commit/49b0a43c97d8d261d498d3494bd737d5eebefc03))

## [1.7.2](https://github.com/oriondor/orio-ui/compare/v1.7.1...v1.7.2) (2026-01-16)


### Bug Fixes

* improved upload component, added maxFiles validation and disabled state ([5082e97](https://github.com/oriondor/orio-ui/commit/5082e973302687977532cbef191e5b981f0f5b4a))

## [1.7.1](https://github.com/oriondor/orio-ui/compare/v1.7.0...v1.7.1) (2026-01-15)


### Bug Fixes

* carousel margin ([e1b27cd](https://github.com/oriondor/orio-ui/commit/e1b27cdd548219abeb4d33611315b6ee346a8acf))

## [1.7.0](https://github.com/oriondor/orio-ui/compare/v1.6.0...v1.7.0) (2026-01-15)


### Features

* implemented headless upload component ([80cfdc6](https://github.com/oriondor/orio-ui/commit/80cfdc6ad35d7bd3e48ee74c5b5d27c3cca6395a))

## [1.6.0](https://github.com/oriondor/orio-ui/compare/v1.5.0...v1.6.0) (2026-01-14)


### Features

* implemented carousel for images ([0934cb8](https://github.com/oriondor/orio-ui/commit/0934cb83f9b3e58dee8703468fad354a5ee4ac44))


### Bug Fixes

* changed all single quotes to double quotes ([b10de3d](https://github.com/oriondor/orio-ui/commit/b10de3dce859cec95f36dbe8ad357b373f811bc8))
* fixed tests and removed SASS warnings ([e86b4bf](https://github.com/oriondor/orio-ui/commit/e86b4bf991d0a5c080eba8a72323fc0afa14a22c))

## [1.5.0](https://github.com/oriondor/orio-ui/compare/v1.4.1...v1.5.0) (2026-01-10)


### Features

* added inverse theme (black&white) ([f74502a](https://github.com/oriondor/orio-ui/commit/f74502aa926d4cc1504c9ac2dcba34f1e7eb72ab))

## [1.4.1](https://github.com/oriondor/orio-ui/compare/v1.4.0...v1.4.1) (2026-01-10)


### Bug Fixes

* another revision for the colors ([d202495](https://github.com/oriondor/orio-ui/commit/d20249554a37ee985c15bc572380019f291be36d))
* updated meta ([4e3df9c](https://github.com/oriondor/orio-ui/commit/4e3df9c11e326f7c1b6cfff76de8ffcafc701bd7))

## [1.4.0](https://github.com/oriondor/orio-ui/compare/v1.3.0...v1.4.0) (2026-01-09)


### Features

* Created NavButton ([ee45beb](https://github.com/oriondor/orio-ui/commit/ee45bebb56114d3f9fdaa11bcee11b20073daef7))

## [1.3.0](https://github.com/oriondor/orio-ui/compare/v1.2.0...v1.3.0) (2026-01-09)


### Features

* added tooltip ([f755617](https://github.com/oriondor/orio-ui/commit/f755617f26bc64a169c5b38295f1366042a3236d))

## [1.2.0](https://github.com/oriondor/orio-ui/compare/v1.1.0...v1.2.0) (2026-01-09)


### Features

* Added normal theme and fixed some incostincest styles on multiple components ([b4a8530](https://github.com/oriondor/orio-ui/commit/b4a8530f5e26496d228d6d2e6762d7a17121a538))

## [1.1.0](https://github.com/oriondor/orio-ui/compare/v1.0.6...v1.1.0) (2026-01-08)


### Features

* Added switch button ([b0b0820](https://github.com/oriondor/orio-ui/commit/b0b08203382f65224f39c9746ff1a16edc3c1f09))

## [1.0.6](https://github.com/oriondor/orio-ui/compare/v1.0.5...v1.0.6) (2026-01-08)


### Bug Fixes

* changed line height ([1cde783](https://github.com/oriondor/orio-ui/commit/1cde783e2bc9e8df542744caed2ae87471a1ad5f))
* critical fix for button type -&gt; variant ([41e540c](https://github.com/oriondor/orio-ui/commit/41e540cbd73bb60cabc959c857c1bad625c91262))

## [1.0.5](https://github.com/oriondor/orio-ui/compare/v1.0.4...v1.0.5) (2026-01-08)


### Bug Fixes

* changed scss for gradient style to css ([90e5297](https://github.com/oriondor/orio-ui/commit/90e529721d8847666df46cac051d6db325ad8fe5))

## [1.0.4](https://github.com/oriondor/orio-ui/compare/v1.0.3...v1.0.4) (2026-01-08)


### Bug Fixes

* fixed css was not imported, global styling issues, able to switch themes natively now and small issues with components ([433a796](https://github.com/oriondor/orio-ui/commit/433a796f51e8b0ea591af88c180af6dc2c49fccc))

## [1.0.3](https://github.com/oriondor/orio-ui/compare/v1.0.2...v1.0.3) (2026-01-07)


### Bug Fixes

* naturally prefix components ([4c2c669](https://github.com/oriondor/orio-ui/commit/4c2c669516db01fcab498adb6f7bbfaa8deabe06))

## [1.0.2](https://github.com/oriondor/orio-ui/compare/v1.0.1...v1.0.2) (2026-01-07)


### Bug Fixes

* fixed old layer syntax (extend) to modules ([ac617f7](https://github.com/oriondor/orio-ui/commit/ac617f7e5e5edce0f1cd25b961d6084463cc186c))

## [1.0.1](https://github.com/oriondor/orio-ui/compare/v1.0.0...v1.0.1) (2026-01-07)


### Bug Fixes

* one more missing thing for release to npm ([707cbc8](https://github.com/oriondor/orio-ui/commit/707cbc83e2283c4c5a4324a4baf340874ce215a8))
* release to npm ([1cdd23d](https://github.com/oriondor/orio-ui/commit/1cdd23d0cb4dcf6b92d4ac9755a96ca5067856e5))

## 1.0.0 (2026-01-07)


### Bug Fixes

* fixed the build step for nuxt ([46109bc](https://github.com/oriondor/orio-ui/commit/46109bc64f06161debadb38782cabcbad163f4a0))
* linter issues ([caace5a](https://github.com/oriondor/orio-ui/commit/caace5ab6190655b1fcf8c747300e22ed29fb472))
* missing .nuxt ([31ae930](https://github.com/oriondor/orio-ui/commit/31ae930812fd5e721758021a349264034b47a7a7))

## [0.1.0] - 2025-01-06

### Added

#### Components (18 total)

- **Button** - Primary, secondary, subdued variants with loading states
- **Input** - Text input with label support
- **Textarea** - Multi-line text input
- **CheckBox** - Custom checkbox with icon states
- **DatePicker** - Date selection with month/year picker
- **DateRangePicker** - Start/end date selection with "Present" option
- **Selector** - Generic dropdown selector supporting single and multi-select
- **Tag** - Styled tag/badge component
- **Icon** - Custom SVG icon system with 12 bundled icons
- **LoadingSpinner** - Animated loading indicator
- **Modal** - Animated modal with origin morphing effect
- **Popover** - Smart-positioned popover with fallback placement
- **EmptyState** - Empty state placeholder with icon and description
- **DashedContainer** - Dashed border container with icon
- **ControlElement** - Form control wrapper for consistent styling
- **Text** (View) - Typography component with multiple variants
- **Dates** (View) - Date range display formatter
- **Separator** (View) - Visual divider component

#### Composables (4 total)

- **useTheme** - Theme and color mode management with localStorage persistence
- **useModal** - Modal state management with animation origin tracking
- **useFuzzySearch** - Fuzzy search powered by Fuse.js
- **useApi** - Type-safe API request wrapper using ofetch

#### Theming System

- 5 built-in accent themes: Navy, Ocean, Sunset, Forest, Purple
- Light and dark mode support
- 3-layer CSS variable system for easy customization
- Automatic theme persistence to localStorage

#### Icon System

- Custom icon registry with 12 bundled SVG icons
- Tree-shakeable icon loading
- Support for custom icon sizes and colors
- Icons included: loading-loop, chevron-down, chevron-up, edit, check, plus, calendar, close, search, upload, download, delete

#### Testing

- 71 unit tests with Vitest
- Component tests for all 18 components
- Composable tests for all 4 composables
- Full test coverage for core functionality

#### Documentation

- VitePress documentation site
- Getting Started guide
- Theming guide
- Component API documentation
- Composable usage examples
- Interactive playground app

#### Developer Experience

- Full TypeScript support with exported types
- Nuxt Layer architecture for seamless integration
- Auto-import for all components and composables
- ESLint + Prettier configuration
- Development playground for testing

### Technical Details

- Built with Vue 3 Composition API
- Nuxt 3/4 compatible
- SSR-ready with proper client-side checks
- Tree-shakeable architecture
- Zero external icon dependencies
- Accessibility-focused components

### Dependencies

- @vueuse/core ^11.0.0
- @vueuse/integrations ^11.0.0
- fuse.js ^7.0.0
- nanoid ^5.0.0
- ofetch ^1.5.1

[0.1.0]: https://github.com/oriondor/orio-ui/releases/tag/v0.1.0
