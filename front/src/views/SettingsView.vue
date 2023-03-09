<template>
  <div>
    <notification ref="notyf"/>
    <div>
      <label for="nickname-input">Nickname:</label>
      <input type="text" id="nickname-input" v-model="newNickname">
      <button @click="changeNickname">Change nickname</button>
    </div>
    <div>
      <input type="file" ref="fileInput" @change="handleFileInputChange">
      <button @click="uploadFile">Upload photo</button>
    </div>
    <div v-if="avatarUrl">
      <img :src="avatarUrl" alt="User avatar">
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {Socket} from 'socket.io-client';
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from '@/consts';

export default defineComponent({
  name: 'SettingsView',
  data() {
    return {
      newNickname: '',
      selectedFile: null,
      avatarUrl: '',
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
      await this.loadAvatar('hjordan');
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
        const input: string = 'http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/users/upload';
        formData.append('photo', this.selectedFile);

        const token = localStorage.getItem('token');
        const options = {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
          body: formData
        };

        try {
          const response = await fetch(input, options);

          if (response.ok) {
            this.$refs.notyf.showNotification('File uploaded successfully!', 'success');
          } else {
            const message = await response.json().message;
            console.log(message);
            this.$refs.notyf.showNotification(message, 'error');
          }
        } catch (error) {
          this.$refs.notyf.showNotification(error, 'error');
        }
      }
    },

    async loadAvatar(login: string) {
      try {
        const input = `http://${VUE_APP_WEB_HOST}:${VUE_APP_BACK_PORT}/users/avatar/${login}`;
        const token = localStorage.getItem('token');
        const options = {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
        };
        const response = await fetch(input, options);
        const message = await response.json().message;

        if (response.ok) {
          const blob = await response.blob();
          this.avatarUrl = URL.createObjectURL(blob);
        } else {
          const message = await response.text();
          console.log(message);
          this.$refs.notyf.showNotification(message, 'error');
        }
      } catch (error) {
        console.error('dsjnfkjsahfjhasfhjks ' + error);
        this.$refs.notyf.showNotification('Error while loading user avatar', 'error');
      }
    }
  }
})
</script>
