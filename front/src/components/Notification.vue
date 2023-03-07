<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import 'notyf/notyf.min.css';
import {Notyf} from "notyf";
import 'notyf/notyf.min.css';


const notyf: Notyf = new Notyf({
  duration: 3000,
  position: {
    x: 'right',
    y: 'top'
  },
});

export default defineComponent({
  methods: {
    showNotification(message: string, type: string) {
      if (type === 'success') {
        notyf.success(message);
      } else if (type === 'error') {
        notyf.error(message);
      } else if (type === 'warning') {
        notyf.warning(message);
      } else {
        notyf.info(message);
      }
    }
  }
});
</script>
