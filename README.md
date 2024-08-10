# vue-plugin-global-components

A Vue plugin that uses Vite's [Glob Import](https://vitejs.dev/guide/features.html#glob-import) feature to register global async components for Vue applications.

## Install

```sh
npm i @heavymedl/vite-plugin-global-components
```

## Usage

Import the plugin into your app's isomorphic entry point (`main.mts`).

Pass a directory path containing Vue components to be registered as global to [Glob Import](https://vitejs.dev/guide/features.html#glob-import).

```typescript
const globDynamicImportObj = import.meta.glob('../GlobalComponents/**/*.vue');
```

You'll pass this object containing dynamic import references to `.use`, which becomes available to the plugin within its `install` hook.

```typescript
app.use(
  GlobalComponentPlugin,
  import.meta.glob('../GlobalComponents/**/*.vue')
);
```

The plugin loops through the object keys and registers global async components on your Vue app instance with `app.component(defineAsyncComponent(...))`.

Complete example:

```typescript
import { createSSRApp } from 'vue';
import GlobalComponentPlugin from 'vue-plugin-global-components';
import App from './App.vue';

export default function createApp(props) {
  const app = createSSRApp(App, props);
  app.use(
    GlobalComponentPlugin,
    import.meta.glob('../GlobalComponents/**/*.vue')
  );
  return { app };
}
```

## Theory

This plugin expects Glob Import to return dynamic import references, e.g. used in lazy mode, which it does by default.

```typescript
// Default type of import.meta.glob
export default interface GlobDynamicImport {
  [key: string]: () => Promise<object>;
}
```

When Vite compiles your application, `defineAsyncComponent` forces the generation of JavaScript and CSS chunks representing each component.

At runtime, the dynamic import references of `import.meta.glob` allows us to leverage `defineAsyncComponent` to register global async components, which can then be used everywhere, without statically importing them in every parent component.

Because we have individual chunks for each component, we have flexibility with how they're delivered. You can swap them in and out on demand, lazy hydrate non-interactive components, or a combination of both techniques.

## Side effects

You should be aware of the implications of using [Glob Import](https://vitejs.dev/guide/features.html#glob-import) and [`defineAsyncComponent`](https://vuejs.org/guide/components/async.html) in your project.

### Glob Import at build time

`import.meta.glob` is statically processed at build time. Under the hood, Vite uses `fast-glob` to process all `*.vue` files matching the string directory argument. Each individual `.vue` file gets its own JS chunk (and CSS chunk if applicable). Therefore, you should be cognizant of the number of chunk assets your application will output. Use `import.meta.glob` sparingly and ensure all of the global async components you build are used in some context.

### Nature of global async components and cumulative layout shift (CLS)

When we use async components, the chunks that comprise them (JS and CSS) are loaded in a "lazy" fashion. They are generally loaded later in the hydration lifecycle. This can lead to an increase in cumulative layout shift (CLS) in your application. Therefore, it's recommended that you load the individual CSS chunks of the components you'll use for the page in your template.

Upon building, your global async components will get a CSS entry point defined in the Vite manifest. It might look something like this:

```json
{
  "src/app/components/component-a.css": {
    "file": "component-a-8dd27c5b.css",
    "src": "src/app/components/component-a.css"
  }
}
```

Take care to server-render stylesheets to mitigate CLS side effects.

```html
<link href="component-a-8dd27c5b.css" />
```

## Lazy hydration

At runtime, your global async components will server render HTML with `ssr` and return it to be incorporated into the final page HTML served to the end user. If we determine that a particular component is "static", or non-interactive, it might be a good candidate to delay, or even omit client-side hydration.

We can use `vue3-lazy-hydration` to conditionally omit/delay client-side hydration, which prevents your end users from fetching an unnecessary chunk of JavaScript at runtime.

```typescript
import { createSSRApp } from 'vue';
import { LazyHydrationWrapper } from 'vue3-lazy-hydration';
import GlobalComponentPlugin from 'vue-plugin-global-components';
import App from './App.vue';

export default function createApp(props) {
  const app = createSSRApp(App, props);
  app.use(
    GlobalComponentPlugin,
    import.meta.glob('../GlobalComponents/**/*.vue')
  );
  app.component('LazyHydrationWrapper', LazyHydrationWrapper);
  return { app };
}
```

```vue
<template>
  <LazyHydrationWrapper
    v-bind="getLazySettings(isClientHydrate)"
    @hydrated="onHydrated"
  >
    <keep-alive>
      <component :is="componentName" v-bind="componentProps" />
    </keep-alive>
  </LazyHydrationWrapper>
</template>
```

## Development

Run the Vite development server:

```sh
npm run dev
```

This should open the test application in `test/app`. 

The test application is a basic Vue app that uses `vue-plugin-global-components` to register global async components contained within `test/app/src/components`.