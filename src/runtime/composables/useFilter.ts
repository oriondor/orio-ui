import {
  computed,
  effectScope,
  ref,
  type ComputedRef,
  type EffectScope,
  type Ref,
} from "vue";

/**
 * Definition of a single filter inside a group.
 *
 * `value` is both the initial value and the "empty" baseline used to compute
 * `isActive` and to reset to via `clear()`.
 */
export interface FilterDefinition<Value = unknown> {
  value: Value;
}

export type FilterConfig = Record<string, FilterDefinition>;

export interface FilterOptions {
  /**
   * When true, the group's state is mirrored to URL query params via
   * `useUrlSync`. The dependency is loaded lazily — `useUrlSync` (and its
   * `#imports` use of `useRoute`) is never touched unless this flag is set,
   * keeping `useFilter` runnable outside of a Nuxt context.
   *
   * Filter names become top-level URL keys; avoid colliding names across
   * multiple URL-synced groups on the same page.
   */
  url?: boolean;
}

/**
 * Bindable prop bag — spread onto any `v-model`-compatible component:
 *   `<orio-selector v-bind="filters.category" :options="..." />`
 */
export interface FilterBind<Value = unknown> {
  modelValue: Value;
  "onUpdate:modelValue": (value: Value) => void;
}

/** Per-filter helpers accessed via `filters.$.<name>`. */
export interface FilterHelpers<Value = unknown> {
  value: Value;
  initial: Value;
  isActive: boolean;
  clear: () => void;
}

export interface ActiveFilter {
  name: string;
  value: unknown;
  clear: () => void;
}

export type FilterGroup<Config extends FilterConfig> = {
  [Key in keyof Config]: FilterBind<Config[Key]["value"]>;
} & {
  $: { [Key in keyof Config]: FilterHelpers<Config[Key]["value"]> };
  $active: ComputedRef<ActiveFilter[]>;
  $clearAll: () => void;
  $state: Ref<Record<string, unknown>>;
};

const registry = new Map<string, FilterGroup<FilterConfig>>();
const urlSyncScopes = new Map<string, EffectScope>();

/**
 * Define or retrieve a named filter group.
 *
 * Define once anywhere in the page (setup, layout, store). Retrieve the same
 * instance elsewhere by id — any component that knows the id can read and
 * mutate the same reactive state, regardless of where it lives in the tree.
 *
 * @example Define
 * ```ts
 * const filters = useFilter('appointments', {
 *   category:  { value: null },
 *   status:    { value: [] as string[] },
 *   dateRange: { value: { from: null, to: null } },
 * })
 * ```
 *
 * @example Bind to any v-model component
 * ```vue
 * <orio-selector v-bind="filters.category" :options="categories" />
 * ```
 *
 * @example Retrieve elsewhere
 * ```ts
 * const filters = useFilter('appointments')
 * ```
 *
 * @example Mirror to URL (Nuxt only)
 * ```ts
 * const filters = useFilter('appointments', config, { url: true })
 * ```
 */
export function useFilter<Config extends FilterConfig>(
  id: string,
  config: Config,
  options?: FilterOptions,
): FilterGroup<Config>;
export function useFilter(id: string): FilterGroup<FilterConfig>;
export function useFilter<Config extends FilterConfig>(
  id: string,
  config?: Config,
  options: FilterOptions = {},
): FilterGroup<Config> {
  const existing = registry.get(id) as FilterGroup<Config> | undefined;
  if (existing) {
    if (config) {
      console.warn(
        `[useFilter] group "${id}" is already defined — ignoring new config.`,
      );
    }
    return existing;
  }

  if (!config) {
    throw new Error(
      `[useFilter] group "${id}" is not defined. Pass a config on the first call.`,
    );
  }

  const initial: Record<string, unknown> = {};
  for (const [name, definition] of Object.entries(config)) {
    initial[name] = clone(definition.value);
  }

  const state = ref<Record<string, unknown>>({ ...initial });

  if (options.url) {
    // Lazy import keeps `useUrlSync` (and its Nuxt `#imports` dependency) out
    // of the module graph unless URL sync is actually requested. URL values
    // arrive one microtask late, after the initial render.
    //
    // The watcher created by `useUrlSync` is hosted in a detached effect
    // scope so its lifetime tracks the group (module-level) rather than the
    // component that happened to define the group. `disposeFilter` stops it.
    const scope = effectScope(true);
    urlSyncScopes.set(id, scope);
    void import("./useUrlSync").then(({ useUrlSync }) => {
      scope.run(() => useUrlSync(state, Object.keys(config)));
    });
  }

  const handle = {} as FilterGroup<Config>;
  const helpers = {} as Record<string, FilterHelpers>;

  for (const name of Object.keys(config)) {
    helpers[name] = {
      get value() {
        return state.value[name];
      },
      get initial() {
        return initial[name];
      },
      get isActive() {
        return !isEqual(state.value[name], initial[name]);
      },
      clear() {
        state.value[name] = clone(initial[name]);
      },
    } as FilterHelpers;

    Object.defineProperty(handle, name, {
      enumerable: true,
      value: {
        get modelValue() {
          return state.value[name];
        },
        "onUpdate:modelValue": (value: unknown) => {
          state.value[name] = value;
        },
      },
    });
  }

  Object.defineProperty(handle, "$", { value: helpers });
  Object.defineProperty(handle, "$active", {
    value: computed<ActiveFilter[]>(() =>
      Object.keys(config).flatMap((name) => {
        const helper = helpers[name]!;
        return helper.isActive
          ? [{ name, value: helper.value, clear: helper.clear }]
          : [];
      }),
    ),
  });
  Object.defineProperty(handle, "$clearAll", {
    value: () => {
      for (const name of Object.keys(config)) {
        state.value[name] = clone(initial[name]);
      }
    },
  });
  Object.defineProperty(handle, "$state", { value: state });

  registry.set(id, handle as FilterGroup<FilterConfig>);
  return handle;
}

/**
 * Remove a filter group from the registry. Use in SPAs where filter groups
 * are page-scoped and should not leak between routes.
 */
export function disposeFilter(id: string): void {
  urlSyncScopes.get(id)?.stop();
  urlSyncScopes.delete(id);
  registry.delete(id);
}

function clone<Value>(value: Value): Value {
  if (value === null || typeof value !== "object") return value;
  return structuredClone(value);
}

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) =>
    isEqual(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key],
    ),
  );
}
