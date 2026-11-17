import * as WippyProxy from '@wippy-fe/proxy'

/** Host exports that the proxy of an older Host may not have. */
interface OptionalHostExports {
  artifactState?: typeof WippyProxy.artifactState
  ws?: typeof WippyProxy.ws
}

/**
 * Reads an export an older Host may lack. A named import is resolved when the
 * module is linked and fails with a SyntaxError if the proxy the Host serves
 * does not export the name, while a property read on the namespace gives
 * `undefined`.
 */
export function hostExport<K extends keyof OptionalHostExports>(name: K): OptionalHostExports[K] {
  const proxy: OptionalHostExports = WippyProxy
  return proxy[name]
}
