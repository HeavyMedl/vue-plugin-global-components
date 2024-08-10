<template>
  <div class="card">
    <div
      class="container"
      rendered
    >
      <h4>
        <b>GlobalAsyncComponentB</b>
      </h4>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.card {
  background-color: crimson;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
}
.card:hover {
  box-shadow: 0 8px 16px 0 grey;
}
.container {
  padding: 2px 16px;
}
</style>
