<template>
  <v-container>
    <v-row>
      <v-col class="text-center" align-self="start">
        <h1>{{ nickname }}</h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {Socket} from 'socket.io-client';
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from '@/consts';
import {User} from "@/models/user.model";

export default defineComponent({
  name: 'ProfileView',
  props: {
    nickname: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      user: User,
    };
  },
  created() {
    const socket: Socket = this.$store.getters.getUserSocket();

    socket.emit('getUserInfo', {
      login: this.nickname,
    });

    socket.on('userInfo', (data: any) => {
      const user: User = data;

      if (!user) {
        return;
      }

      this.user = user;
    });
  },
  // methods: {
  //   async fetchAvatar(login: string) {
  //     try {
  //       const input = `http://${VUE_APP_WEB_HOST}:${VUE_APP_BACK_PORT}/users/avatar/${login}`;
  //       const token = localStorage.getItem('token');
  //       const options = {
  //         method: 'GET',
  //         headers: {
  //           Authorization: 'Bearer ' + token,
  //         },
  //       };
  //       const response = await fetch(input, options);
  //
  //       if (response.ok) {
  //         const blob = await response.blob();
  //         this.avatarUrl = URL.createObjectURL(blob);
  //       } else {
  //         this.avatarUrl = '/default.jpg';
  //       }
  //     } catch (error) {
  //       this.avatarUrl = '/default.jpg';
  //     }
  //   },
  // },
});
</script>