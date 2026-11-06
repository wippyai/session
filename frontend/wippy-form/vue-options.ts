import type { Options } from '@vitejs/plugin-vue'

/** `<wippy-loading>` is a custom element the Host registers, so Vue's compiler must not try to resolve it as a component. */
export const vueOptions: Options = {
  template: {
    compilerOptions: {
      isCustomElement: tag => tag === 'wippy-loading',
    },
  },
}
