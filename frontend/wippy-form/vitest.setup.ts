import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach, vi } from 'vitest'

// Unmount every mounted wrapper after each test. Many suites mount with
// `attachTo: document.body`, and a leftover element can be found by a later
// test's document query, because separately mounted apps can reuse `useId()` ids.
enableAutoUnmount(afterEach)

// Every test file gets the mocked proxy module, so none has to mock it itself.
vi.mock('@wippy-fe/proxy', async () => (await import('./src/test-support/proxy-mock')).proxyMock())

/**
 * `@wippy-fe/webcomponent-core`, which `@wippy-fe/webcomponent-vue` pulls in,
 * reads several getters of `@wippy-fe/proxy` (`api`, `host`, `config`) when it
 * is evaluated. The getters throw unless `window.__WIPPY_APP_API__` and
 * `window.__WIPPY_APP_CONFIG__` exist, and the Host normally injects them before
 * proxy.js loads. This stub only keeps that import graph from failing.
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
  // jsdom has no ResizeObserver, which PrimeVue's auto-resizing Textarea
  // (question-card-composer.vue) creates when it mounts.
  if (!w.ResizeObserver) {
    w.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
}
