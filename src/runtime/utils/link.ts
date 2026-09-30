import { inject } from "vue";
import { routerKey, type RouteLocationRaw, type Router } from "vue-router";

/** True for hrefs the browser should handle itself: other origins, protocols (tel:, mailto:) and in-page hashes. */
export function isBrowserHandledHref(href: string): boolean {
  return /^([a-z][a-z\d+.-]*:|\/\/|#)/i.test(href);
}

/**
 * Link behaviour for components that render a plain `<a href>`: when a Vue
 * router is installed (always true in Nuxt) internal links navigate through
 * it instead of reloading the page. Without a router the anchor just works.
 */
export function useLinkNavigation() {
  const router = inject<Router | null>(routerKey, null);

  function hrefFor(to: RouteLocationRaw): string {
    if (typeof to === "string") return to;
    return router ? router.resolve(to).href : "";
  }

  function navigate(event: MouseEvent, to: RouteLocationRaw) {
    if (!router || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    if (isBrowserHandledHref(hrefFor(to))) return;
    event.preventDefault();
    router.push(to);
  }

  return { hrefFor, navigate };
}
