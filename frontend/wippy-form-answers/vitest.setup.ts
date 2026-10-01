/**
 * `@wippy-fe/webcomponent-core` reads several getters of `@wippy-fe/proxy`
 * (`api`, `host`, `config`) when it is evaluated. The getters throw unless
 * `window.__WIPPY_APP_API__` and `window.__WIPPY_APP_CONFIG__` exist, and the
 * Host normally injects them before proxy.js loads. This stub only keeps that
 * import graph from failing. The `wippy-form` package has the same file.
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

  // jsdom 25 returns an `ElementInternals` without `.states`, which the
  // `WippyElement` base class calls when it connects and disconnects, so a
  // real `Set` is added.
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
