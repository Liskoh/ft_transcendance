<template>
  <div>
    <input type="file" ref="fileInput" @change="handleFileInputChange" accept="image/*" >
    <button @click="uploadFile">Envoyer</button>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FileUploader',
  methods: {
    handleFileInputChange(event) {
      const file = event.target.files[0];
      this.selectedFile = file;
    },
    async uploadFile() {
      const formData = new FormData();
      formData.append('photo', this.selectedFile);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
          .then((response) => response.json())
          .catch((error) => {
        console.error('Error:', error);
      });
      // Gérer la réponse du backend ici
    }
  }
});
</script>
