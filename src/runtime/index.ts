// Export all components
export { default as AnimatedContainer } from "./components/AnimatedContainer.vue";
export { default as Button } from "./components/Button.vue";
export { default as Form, type FormProps } from "./components/Form.vue";
export { default as NavButton } from "./components/NavButton.vue";
export { default as Input } from "./components/Input.vue";
export { default as NumberInput } from "./components/NumberInput/index.vue";
export { default as NumberInputVertical } from "./components/NumberInput/Vertical.vue";
export { default as NumberInputHorizontal } from "./components/NumberInput/Horizontal.vue";
export { default as Textarea } from "./components/Textarea.vue";
export { default as CheckBox } from "./components/CheckBox.vue";
export {
  default as CheckboxGroup,
  type CheckboxOption,
  type CheckboxGroupProps,
} from "./components/CheckboxGroup.vue";
export {
  default as RadioButton,
  type RadioButtonProps,
} from "./components/RadioButton.vue";
export { default as SwitchButton } from "./components/SwitchButton.vue";
export { default as DatePicker } from "./components/DatePicker.vue";
export { default as DateRangePicker } from "./components/DateRangePicker.vue";
export { default as Selector } from "./components/Selector.vue";
export { default as TaggableSelector } from "./components/TaggableSelector.vue";
export { default as Tag } from "./components/Tag.vue";
export { default as Badge } from "./components/Badge.vue";
export { default as Banner } from "./components/Banner.vue";
export { default as Icon } from "./components/Icon.vue";
export { default as LoadingSpinner } from "./components/LoadingSpinner.vue";
export { default as Modal } from "./components/Modal.vue";
export { default as Popover } from "./components/Popover.vue";
export { default as Tooltip } from "./components/Tooltip.vue";
export { default as Upload } from "./components/upload/index.vue";
export {
  default as Canvas,
  type CanvasProps,
} from "./components/Canvas/index.vue";
export { default as CanvasStage } from "./components/Canvas/components/Stage.vue";
export { default as CanvasToolbar } from "./components/Canvas/components/Toolbar.vue";
export { default as CanvasToolButton } from "./components/Canvas/components/ToolButton.vue";
export {
  defineCanvasTool,
  type CanvasTool,
  type CanvasToolKind,
  type CanvasNode,
  type CanvasToolApi,
  type CanvasPoint,
  type CanvasPointerEvent,
} from "./components/Canvas/types";
export {
  useCanvasContext,
  type CanvasContext,
} from "./components/Canvas/context";
export {
  drawTool,
  type DrawToolOptions,
  type DrawNodeData,
} from "./components/Canvas/tools/drawTool";
export {
  textTool,
  type TextToolOptions,
  type TextNodeData,
} from "./components/Canvas/tools/textTool";
export { undoTool } from "./components/Canvas/tools/undoTool";
export { redoTool } from "./components/Canvas/tools/redoTool";
export { clearTool } from "./components/Canvas/tools/clearTool";
export {
  colorPickerTool,
  type ColorPickerToolOptions,
} from "./components/Canvas/tools/colorPickerTool";
export {
  eraseTool,
  type EraseToolOptions,
} from "./components/Canvas/tools/eraseTool";
export {
  moveTool,
  type MoveToolOptions,
} from "./components/Canvas/tools/moveTool";
export {
  highlightTool,
  type HighlightToolOptions,
} from "./components/Canvas/tools/highlightTool";
export {
  rotateTool,
  type RotateToolOptions,
} from "./components/Canvas/tools/rotateTool";
export {
  resizeTool,
  type ResizeToolOptions,
} from "./components/Canvas/tools/resizeTool";
export {
  transformTool,
  type TransformToolOptions,
} from "./components/Canvas/tools/transformTool";
export { default as EmptyState } from "./components/EmptyState.vue";
export { default as DashedContainer } from "./components/DashedContainer.vue";
export { default as ControlElement } from "./components/ControlElement.vue";
export { default as GalleryCarousel } from "./components/gallery/Carousel.vue";
export { default as ViewText } from "./components/view/Text.vue";
export {
  default as ViewKeyBinds,
  type KeyBindsProps,
} from "./components/view/KeyBinds.vue";
export { default as ViewDates } from "./components/view/Dates.vue";
export { default as ViewSeparator } from "./components/view/Separator.vue";
export { default as ListItem } from "./components/ListItem.vue";
export {
  default as LocaleSwitcher,
  type LocaleOption,
} from "./components/LocaleSwitcher.vue";

// Export all composables
export {
  useApi,
  type ApiOptions,
  type RequestBody,
  type RequestMethod,
} from "./composables/useApi";
export { useFuzzySearch } from "./composables/useFuzzySearch";
export {
  useModal,
  type ModalProps,
  type OriginRect,
} from "./composables/useModal";
export { useTheme } from "./composables/useTheme";
export { useDecimalFormatter } from "./composables/useDecimalFormatter";
export { usePressAndHold } from "./composables/usePressAndHold";
export { useSound, type SoundOptions } from "./composables/useSound";
export {
  useValidation,
  isFilled,
  isEmail,
  type ValidationRule,
} from "./composables/useValidation";

// Export utils
export { iconRegistry, type IconName } from "./utils/icon-registry";
export {
  flattenParams,
  unflattenParams,
  parsePath,
  topLevelKeys,
} from "./utils/urlParams";

// Export URL sync composable
export { useUrlSync } from "./composables/useUrlSync";

// Export i18n
export {
  i18n,
  en,
  uk,
  addLocale,
  mergeLocale,
  setLocale,
  type LocaleMessages,
} from "./i18n";
