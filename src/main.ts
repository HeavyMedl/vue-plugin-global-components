import { App, Plugin, defineAsyncComponent } from 'vue';
import GlobDynamicImport from './types/GlobDynamicImport';

/**
 * Get name of component, based on filename
 * "./components/Fruits.vue" will become "Fruits"
 *
 * @param path The file path to the global vue component
 */
export function getComponentName(path: string) {
  return (
    path
      ?.split('/')
      ?.pop()
      ?.replace(/\.\w+$/, '') ?? ''
  );
}

/**
 * Loops through Glob Import object properties, which are dynamic
 * import references (see type GlobDynamicImport), and registers
 * global async components using Vue's `defineAsyncComponent` API.
 * The function attempts to normalize the component name based on
 * the filename. For example:
 *
 * Given a Glob Object:
 * {
 *  "../components/Fruits.vue": () => import(...)
 * }
 *
 * The global async component to use would be called "Fruits"
 *
 * @param {Object} app - The Vue instance
 * @param {Object} globalAsyncComponents The global async components derived
 * from import.meta.glob that we want to register as global.
 */
function registerGlobalAsyncComponents(
  app: App,
  globDynamicImport: GlobDynamicImport,
): void {
  Object.entries(globDynamicImport).forEach(([path, definition]) => {
    const componentName = getComponentName(path);
    // // Register component on this Vue instance
    app.component(
      componentName,
      defineAsyncComponent(definition as () => Promise<object>),
    );
  });
}

/**
 * A Vue 3 plugin that uses Vite's
 * [Glob Import](https://vitejs.dev/guide/features.html#glob-import)
 * feature to register global async components for Vue applications.
 */
const GlobalComponentPlugin: Plugin = {
  /**
   * Vue 3 install hook
   *
   * @param app
   * @param globDynamicImport
   */
  install(app: App, globDynamicImport: GlobDynamicImport = {}) {
    registerGlobalAsyncComponents(app, globDynamicImport);
  },
};

export default GlobalComponentPlugin;
