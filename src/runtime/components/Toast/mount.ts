import { h, render, type AppContext } from "vue";
import Host from "./components/Host.vue";

const CONTAINER_ID = "orio-toast-host";

let container: HTMLElement | null = null;

/**
 * Renders the single toast host into its own body-level container.
 * Repeat calls hand back the container already in place, so the queue
 * never ends up with two hosts drawing it.
 */
export function mountToastHost(appContext?: AppContext): HTMLElement {
  if (container?.isConnected) return container;

  container = document.createElement("div");
  container.id = CONTAINER_ID;
  document.body.appendChild(container);

  const vnode = h(Host);
  if (appContext) vnode.appContext = appContext;

  render(vnode, container);

  return container;
}
