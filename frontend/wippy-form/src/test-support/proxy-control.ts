import * as WippyProxy from '@wippy-fe/proxy'
import { vi } from 'vitest'

const originalArtifactState = WippyProxy.artifactState

export function artifactStateMock() {
  return vi.mocked(WippyProxy.artifactState)
}

export function onMock() {
  return vi.mocked(WippyProxy.on)
}

export function wsSendMock() {
  return vi.mocked(WippyProxy.ws.send)
}

/** Puts the proxy mock back as it was and clears its calls and implementations. Call it before each test. */
export function resetProxyMock() {
  setArtifactStateExport(originalArtifactState)
  artifactStateMock().mockReset()
  onMock().mockReset().mockReturnValue(() => {})
  wsSendMock().mockReset()
}

/** Replaces the `artifactState` export, or removes it with `undefined` to act as a Host whose proxy predates it. */
export function setArtifactStateExport(fn: unknown) {
  (WippyProxy as unknown as { artifactState?: unknown }).artifactState = fn
}

/** The callback the code under test registered with `on(topic, ...)`. The latest registration wins. */
export function listenerFor<T = () => void>(topic: string): T | undefined {
  return onMock().mock.calls.filter(([registered]) => registered === topic).at(-1)?.[1] as T | undefined
}
