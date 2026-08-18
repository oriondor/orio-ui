// Experimental components — published as the `orio-ui/experiments` subpath.
//
// Everything here is unstable: names, props, and behaviour can change in any
// release, including patch. Nothing is auto-imported (the module's
// `addComponentsDir` only covers `runtime/components`), so consumers opt in per
// import. Graduating an experiment means moving it into `runtime/components/`
// and exporting it from `index.ts` instead.
export {
  default as Popover,
  type PopoverProps,
  type PopoverPosition,
  type PopoverFlip,
} from "./experiments/popover/index.vue";
