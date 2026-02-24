import { useUrlSearchParams } from "@vueuse/core";
import {
  flattenParams,
  unflattenParams,
  topLevelKeys,
} from "../utils/urlParams";
import { computed, Ref, watch } from "vue";
import { useRoute } from "#imports";

/**
 * Syncs a reactive object's keys to/from URL query params.
 *
 * Behaviour:
 * - **On call (synchronous)**: reads current URL params and pre-populates the
 *   state so child components see the correct values before they mount.
 * - **Reactive**: watches the state and updates the URL whenever synced keys
 *   change (via `router.replace` — no new history entry).
 *
 * SSR-safe: initial population uses `route.query` (available on the server),
 * so the server renders the same HTML as the client hydrates — no mismatches.
 * Reactive URL writes use `useUrlSearchParams` (client-only, via window).
 *
 * Value handling:
 * - Nested objects  → dot notation    (`filters.category=shirts`)
 * - Arrays          → bracket notation (`tags[0]=cats&tags[1]=dogs`)
 * - Combinations    → mixed           (`items[0].name=John`)
 * - File / Blob     → silently skipped (not serialisable)
 * - Empty strings   → removed from URL
 *
 * @param state  Reactive object to sync
 * @param keys   Explicit list of top-level keys to sync.
 *               When omitted, ALL top-level keys currently in the URL are
 *               used for initial population, and ALL keys in the state are
 *               watched going forward.
 *
 * @example
 * // Sync specific keys (recommended — avoids accidentally syncing private state)
 * const properties = ref<Record<string, string | File[]>>({})
 * useUrlSync(properties, ['variant', 'size', 'product-color'])
 *
 * @example
 * // Sync all — useful when state IS the URL state
 * const filters = ref({ category: '', sort: 'newest' })
 * useUrlSync(filters)
 */
export function useUrlSync(
  state: Ref<Record<string, unknown>>,
  keys?: string[],
): void {
  // ── Initial population (synchronous, SSR-safe) ────────────────────────────
  // route.query is populated by Nuxt from the request URL on the server, so
  // SSR and client setup produce the same initial state → no hydration mismatch.
  const routeQuery = useRoute().query as Record<
    string,
    string | string[] | null
  >;
  const initKeys = keys ?? topLevelKeys(routeQuery as Record<string, string>);

  for (const key of initKeys) {
    const flat: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(routeQuery)) {
      if (
        v !== null &&
        (k === key || k.startsWith(`${key}.`) || k.startsWith(`${key}[`))
      ) {
        flat[k] = v as string | string[];
      }
    }
    if (Object.keys(flat).length === 0) continue;

    const reconstructed = unflattenParams(flat);
    if (key in reconstructed) state.value[key] = reconstructed[key];
  }

  // ── Reactive sync (state → URL, client-only) ──────────────────────────────
  // useUrlSearchParams reads/writes window.location — only meaningful on the
  // client. On the server it returns an empty object, which is harmless since
  // the watcher never fires during SSR.
  const urlParams =
    useUrlSearchParams<Record<string, string | string[]>>("history");
  const syncKeys = computed(() => keys ?? Object.keys(state.value));

  // The getter serialises only the synced keys to a primitive string so Vue
  // can compare cheaply — avoids deep-diffing objects or File arrays.
  watch(
    () =>
      syncKeys.value
        .map((k) => JSON.stringify(flattenParams(state.value[k], k)))
        .join("|"),
    () => {
      for (const key of syncKeys.value) {
        for (const k of Object.keys(urlParams)) {
          if (k === key || k.startsWith(`${key}.`) || k.startsWith(`${key}[`)) {
            delete (urlParams as Record<string, string>)[k];
          }
        }
        Object.assign(urlParams, flattenParams(state.value[key], key));
      }
    },
  );
}
