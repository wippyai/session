/**
 * Vitest global setup. Runs before any test module is loaded.
 *
 * `@wippy-fe/webcomponent-core` reads several `@wippy-fe/proxy` getters
 * (`api`, `host`, `config`, ...) at module-evaluation time to re-export
 * them as named bindings. Those getters throw immediately unless
 * `window.__WIPPY_APP_API__` / `window.__WIPPY_APP_CONFIG__` are already
 * present — normally injected by the Host before proxy.js loads. Mirrors
 * the stub in the sibling `wippy-form` package's own `vitest.setup.ts`,
 * trimmed further: this component never calls any host API surface, so
 * the stub only needs to keep the unrelated import graph from crashing
 * on load.
 */
if (typeof window !== 'undefined') {
  const w = window as unknown as Record<string, unknown>
  if (!w.__WIPPY_APP_API__) {
    w.__WIPPY_APP_API__ = {
      host: {},
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

  // jsdom 25.0.1's `attachInternals()` returns an `ElementInternals` with no
  // `.states` property at all (verified empirically: `'states' in internals`
  // is `false` — the CustomStateSet part of the ElementInternals spec isn't
  // implemented yet). `WippyElement`'s base class (connectedCallback /
  // disconnectedCallback) unconditionally calls
  // `this._internals.states.add/delete/clear(...)` to track its
  // loading/ready/error lifecycle, which throws `Cannot read properties of
  // undefined (reading 'add')` the instant any WippyElement subclass is
  // connected to the DOM in this environment. Same class of gap as the
  // ResizeObserver stub above — patch the missing piece with a real `Set`
  // rather than avoid connecting the element in tests.
  if (typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.attachInternals === 'function') {
    const nativeAttachInternals = HTMLElement.prototype.attachInternals
    HTMLElement.prototype.attachInternals = function (this: HTMLElement) {
      const internals = nativeAttachInternals.call(this)
      if (!(internals as { states?: unknown }).states) {
        Object.defineProperty(internals, 'states', { value: new Set(), configurable: true })
      }
      return internals
    }
  }
}
