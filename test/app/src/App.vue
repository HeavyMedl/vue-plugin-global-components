<script setup lang="ts">
// GlobalAsyncComponent[A|B] are registered as global async components using
// the plugin. See `main.ts` for more context.
</script>

<template>
  <h1><code>vue-plugin-global-components</code></h1>
  <p>
    A Vue 3 plugin that uses Vite's Glob Import feature to register global
    <strong>async</strong>
    components for Vue applications.
  </p>
  <br>
  <GlobalAsyncComponentA />
  <br>
  <GlobalAsyncComponentB />
</template>
