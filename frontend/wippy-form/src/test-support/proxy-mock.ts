import { vi } from 'vitest'

/** The `@wippy-fe/proxy` module for tests. `vitest.setup.ts` installs it for every test file. */
export function proxyMock() {
  return {
    artifactState: vi.fn(),
    on: vi.fn(() => () => {}),
    ws: { send: vi.fn() },
  }
}
