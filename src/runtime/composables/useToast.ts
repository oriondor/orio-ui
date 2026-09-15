import { ref, type Ref } from "vue";

export type ToastVariant = "info" | "success" | "alert" | "danger";

export type ToastPosition =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

export type ToastTarget =
  | string
  | HTMLElement
  | Ref<HTMLElement | null | undefined>;

export interface ToastActionContext {
  close: () => void;
  toast: ToastItem;
}

export interface ToastAction {
  label: string;
  variant?: "primary" | "secondary" | "subdued";
  icon?: string;
  /** Keep the toast on screen after the handler resolves. */
  keepOpen?: boolean;
  onClick: (context: ToastActionContext) => void | Promise<void>;
}

export interface ToastOptions {
  message: string;
  title?: string;
  variant?: ToastVariant;
  position?: ToastPosition;
  target?: ToastTarget;
  /** Milliseconds before auto-dismiss; `0` keeps the toast until closed. */
  timeout?: number;
  closable?: boolean;
  /** Draw a depleting bar for the remaining time. Sticky toasts never do. */
  showTimeout?: boolean;
  actions?: ToastAction[];
}

export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
  position: ToastPosition;
  target?: ToastTarget;
  timeout: number;
  closable: boolean;
  showTimeout: boolean;
  actions: ToastAction[];
}

export interface ToastDefaults {
  variant: ToastVariant;
  position: ToastPosition;
  timeout: number;
  closable: boolean;
  showTimeout: boolean;
  /** Maximum toasts kept per stack — a stack is one position on one target. */
  limit: number;
}

interface ToastTimer {
  handle: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
}

const INITIAL_DEFAULTS: ToastDefaults = {
  variant: "info",
  position: "bottom-end",
  timeout: 5000,
  closable: true,
  showTimeout: false,
  limit: 5,
};

const toasts = ref<ToastItem[]>([]);
const timers = new Map<string, ToastTimer>();
const defaults: ToastDefaults = { ...INITIAL_DEFAULTS };

let lastId = 0;

function isSameStack(one: ToastItem, other: ToastItem): boolean {
  return one.position === other.position && one.target === other.target;
}

function clearTimer(id: string) {
  const timer = timers.get(id);
  if (timer?.handle) clearTimeout(timer.handle);
  timers.delete(id);
}

function closeToast(id: string) {
  clearTimer(id);
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
}

function startTimer(id: string, duration: number) {
  if (duration <= 0) return;

  timers.set(id, {
    handle: setTimeout(() => closeToast(id), duration),
    remaining: duration,
    startedAt: Date.now(),
  });
}

function pauseToast(id: string) {
  const timer = timers.get(id);
  if (!timer?.handle) return;

  clearTimeout(timer.handle);
  timer.handle = null;
  timer.remaining = Math.max(
    0,
    timer.remaining - (Date.now() - timer.startedAt),
  );
}

function resumeToast(id: string) {
  const timer = timers.get(id);
  if (!timer || timer.handle) return;

  timer.handle = setTimeout(() => closeToast(id), timer.remaining);
  timer.startedAt = Date.now();
}

function enforceLimit(added: ToastItem) {
  const stack = toasts.value.filter((toast) => isSameStack(toast, added));
  const overflow = stack.slice(0, Math.max(0, stack.length - defaults.limit));

  overflow.forEach((toast) => closeToast(toast.id));
}

function showToast(options: ToastOptions): string {
  lastId += 1;

  const toast: ToastItem = {
    id: `toast-${lastId}`,
    message: options.message,
    title: options.title,
    variant: options.variant ?? defaults.variant,
    position: options.position ?? defaults.position,
    target: options.target,
    timeout: options.timeout ?? defaults.timeout,
    closable: options.closable ?? defaults.closable,
    showTimeout: options.showTimeout ?? defaults.showTimeout,
    actions: options.actions ?? [],
  };

  toasts.value = [...toasts.value, toast];
  enforceLimit(toast);
  startTimer(toast.id, toast.timeout);

  return toast.id;
}

function clearToasts() {
  toasts.value.forEach((toast) => clearTimer(toast.id));
  toasts.value = [];
}

async function triggerAction(toast: ToastItem, action: ToastAction) {
  let closedByHandler = false;

  function close() {
    closedByHandler = true;
    closeToast(toast.id);
  }

  await action.onClick({ close, toast });

  if (!closedByHandler && !action.keepOpen) closeToast(toast.id);
}

function setToastDefaults(overrides: Partial<ToastDefaults>) {
  Object.assign(defaults, overrides);
}

export function useToast() {
  return {
    toasts,
    showToast,
    closeToast,
    clearToasts,
    pauseToast,
    resumeToast,
    triggerAction,
    setToastDefaults,
  };
}
