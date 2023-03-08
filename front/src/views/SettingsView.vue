<template>
  <div>
    <notification ref="notyf" />
    <div>
      <label for="nickname-input">Nickname:</label>
      <input type="text" id="nickname-input" v-model="newNickname">
      <button @click="changeNickname">Change nickname</button>
    </div>
    <div>
      <input type="file" ref="fileInput" @change="handleFileInputChange">
      <button @click="uploadFile">Upload photo</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Socket } from 'socket.io-client';

export default defineComponent({
  name: 'SettingsView',
  data() {
    return {
      newNickname: '',
      selectedFile: null
    }
  },
  created() {
    const socket: Socket = this.$store.getters.getUserSocket();

    socket.on('userSuccess', (data: any) => {
      this.$refs.notyf.showNotification(data, 'success');
    });

    socket.on('userError', (data: any) => {
      this.$refs.notyf.showNotification(data, 'error');
    });
  },

  methods: {
    async changeNickname() {
      if (this.newNickname !== '') {
        const socket: Socket = this.$store.getters.getUserSocket();

        socket.emit('changeNickname', {
          login: this.newNickname
        });
        // Changer le surnom ici
      }
    },

    handleFileInputChange(event) {
      this.selectedFile = event.target.files[0];
    },

    async uploadFile() {
      if (this.selectedFile !== null) {
        const formData = new FormData();
        formData.append('photo', this.selectedFile);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        // Gérer la réponse du backend ici
      }
    }
  }
})
</script>
