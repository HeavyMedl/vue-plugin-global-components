/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-relative-packages */
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expectType, expectNotType } from 'tsd';
import { build } from 'vite';
import { RollupOutput } from 'rollup';
import viteConfig from './app/src/vite.config';
// @ts-ignore
import App from './app/src/App.vue';
import GlobalComponentPlugin, {
  getComponentName,
} from '../src/main';
import GlobDynamicImport from '../src/types/GlobDynamicImport';

describe('vue-global-components-plugin', () => {
  describe('Rendering', async () => {
    const app = createSSRApp(App);
    app.use(
      GlobalComponentPlugin,
      import.meta.glob('./app/src/components/**/*.vue'),
    );
    const html = await renderToString(app);

    /**
     * We expect the "rendered" attribute to appear twice in the resultant
     * server-rendered HTML of App.vue.
     */
    it('should server-render the global async components', () => {
      const renderedAttrArr = html.match(/rendered/g);
      expect(renderedAttrArr).toStrictEqual(['rendered', 'rendered']);
    });
  });

  /**
   * We expect the function that takes the file path returned by
   * Glob Import to be converted to a component name that can be used
   * by the application.
   */
  describe('Registering component names', () => {
    it('should convert a file path to a component name', () => {
      expect(getComponentName('./components/Fruits.vue')).toBe('Fruits');
      expect(getComponentName('../components/Fruits.vue')).toBe('Fruits');
      expect(getComponentName('./../../components/Fruits.vue')).toBe('Fruits');
      expect(getComponentName('./../../components/FruitRollup.vue')).toBe(
        'FruitRollup',
      );
      expect(getComponentName('./../../components/Fruitrollup.vue')).toBe(
        'Fruitrollup',
      );
    });
  });
  describe('Glob Import', () => {
    describe('Run time', () => {
      /**
       * We expect Glob Import to be of type GlobDynamicImport, or
       * Record<string, () => Promise<unknown>>
       */
      it('should return the expected type of GlobDynamicImport', () => {
        const globalAsyncComponents = import.meta.glob(
          './app/src/components/**/*.vue',
        );

        expectType<GlobDynamicImport>(globalAsyncComponents);
        const globalEagerComponents = import.meta.glob(
          './app/src/components/**/*.vue',
          {
            eager: true,
          },
        );
        expectNotType<GlobDynamicImport>(globalEagerComponents);
      });
    });

    describe('Build time', () => {
      /**
       * Execute a inline build and interogate the chunks to see if
       * they were created.
       */
      it('should build independent JS and CSS chunks representing the global async components', async () => {
        const outputWrapper = (await build({
          configFile: false,
          ...viteConfig,
        })) as RollupOutput;
        const outputAssetNames = outputWrapper.output.map(
          (outputAssetObj) => outputAssetObj.fileName,
        );
        interface ChunkVerify {
          [key: string]: number;
        }
        const chunkVerify: ChunkVerify = {
          'assets\\/GlobalAsyncComponentA\\-[a-zA-Z0-9]*\\.js': 0,
          'assets\\/GlobalAsyncComponentB\\-[a-zA-Z0-9]*\\.js': 0,
          'assets\\/GlobalAsyncComponentA\\-[a-zA-Z0-9]*\\.css': 0,
          'assets\\/GlobalAsyncComponentB\\-[a-zA-Z0-9]*\\.css': 0,
        };
        const chunkRegexes = Object.keys(chunkVerify);

        outputAssetNames.forEach((outputAssetName) => {
          chunkRegexes.forEach((chunkRegex) => {
            const regex = new RegExp(chunkRegex);
            const matchArr = outputAssetName.match(regex) || [];
            if (matchArr.length > 0) {
              chunkVerify[chunkRegex] = 1;
            }
          });
        });
        // If all values of chunkVerify return 1 ([1,1,1,1]), all chunks were found in the
        // built output.
        expect(
          Object.values(chunkVerify).every((chunkValue) => chunkValue === 1),
        ).toBe(true);
      });
    });
  });
});
