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
    /*
            const input: string = 'http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/auth/register';
        try {
          const register = await fetch(
              input,
              requestOptions
          );
     */

    async uploadFile() {
      if (this.selectedFile !== null) {
        const formData = new FormData();
        const input: string = 'http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/users/upload';
        formData.append('photo', this.selectedFile);
        const response = await fetch(input, {
          method: 'POST',
          body: formData
        }).then((response) => {
          console.log(response);
        }).catch((error) => {
          console.error('Error:', error);
        });
      }
    }
  }
})
</script>
