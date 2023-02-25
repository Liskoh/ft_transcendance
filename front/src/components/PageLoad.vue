<template>
  <div>
    Loading {{ pageName }}...
  </div>
</template>

<script setup lang="ts">
defineProps<{
  pageName: string
}>()
</script>

<style lang="scss" scoped>
</style>