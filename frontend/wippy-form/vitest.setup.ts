/**
 * Vitest global setup. Runs before any test module is loaded.
 *
 * `@wippy-fe/webcomponent-core` (pulled in transitively by
 * `@wippy-fe/webcomponent-vue`, which `src/constants.ts` imports) reads
 * several `@wippy-fe/proxy` getters (`api`, `host`, `config`, ...) at
 * module-evaluation time to re-export them as named bindings. Those
 * getters throw immediately unless `window.__WIPPY_APP_API__` /
 * `window.__WIPPY_APP_CONFIG__` are already present — normally injected
 * by the Host before proxy.js loads. Mirrors the stub in the sibling
 * Host repo's own `vitest.setup.ts`, trimmed to what this package needs.
 * Individual tests mock `@wippy-fe/proxy` themselves for the behavior
 * they actually exercise (`artifactState`, `on`); this stub only keeps
 * the unrelated import graph from crashing on load.
 */
if (typeof window !== 'undefined') {
  const w = window as unknown as Record<string, unknown>
  if (!w.__WIPPY_APP_API__) {
    w.__WIPPY_APP_API__ = {
      host: { layout: {} },
      api: {},
      on: () => () => {},
      config: {},
      state: {
        get: async () => null,
        set: async () => {},
        remove: async () => {},
        clear: async () => {},
        getAll: async () => ({}),
      },
      ws: {
        send: () => {},
        sendWithResponse: async () => ({}),
        sendCommand: () => {},
      },
      logger: {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        captureException: () => {},
        captureMessage: () => {},
        addBreadcrumb: () => {},
        setContext: () => {},
        setTag: () => {},
      },
      loadWebComponent: async () => {},
    }
  }
  if (!w.__WIPPY_APP_CONFIG__) {
    w.__WIPPY_APP_CONFIG__ = {
      auth: { token: '', expiresAt: '' },
      env: { APP_API_URL: '', APP_AUTH_API_URL: '', APP_WEBSOCKET_URL: '' },
      theming: {},
      hostConfig: {},
      context: { resourceId: '', resourceType: 'page' },
    }
  }
  // jsdom does not implement ResizeObserver. PrimeVue's Textarea uses it
  // for `auto-resize` (question-card-composer.vue) — without this stub,
  // mounting any component with an auto-resizing Textarea throws
  // `ResizeObserver is not defined` during onMounted.
  if (!w.ResizeObserver) {
    w.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
}
