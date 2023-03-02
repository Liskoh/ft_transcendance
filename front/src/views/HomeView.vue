<script setup lang="ts">
import PageLoad from '@/components/PageLoad.vue';



</script>

<template>
  <div>
    <label for="input-json">JSON data:</label>
    <textarea id="input-json" v-model="jsonData"></textarea>
    <button @click="registerUser">Register User</button>
  </div>

  <main>
    <PageLoad pageName="home page" />
  </main>
</template>
