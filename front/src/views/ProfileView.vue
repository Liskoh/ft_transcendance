<template>
  <v-container class="my-5" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <h1 class="display-1">{{ user?.login }}</h1>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <v-avatar size="300">
          <v-img :src="avatarUrl"></v-img>
        </v-avatar>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <h2 class="display-2">{{ user?.nickname }} is {{user?.status}}</h2>
      </v-col>
    </v-row>
    <v-col>
      <v-btn
          color="success"
          @click="FollowAsFriend(user?.login)"
          block
      >Follow as friend
      </v-btn>
    </v-col>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <v-card color="primary" class="mx-auto">
          <v-card-title class="text-left">
            Match History
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="(match, index) in user?.matches" :key="index">
                <v-list-item-title class="text-uppercase">{{ match.winner }} vs {{ match.loser }}</v-list-item-title>
                <v-list-item-subtitle>{{ match.loserScore }} - {{ match.winnerScore }}</v-list-item-subtitle>
                <v-list-item-action>
                  <v-icon>mdi-chevron-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>


<script lang="ts">
import {defineComponent} from 'vue';
import {Socket} from 'socket.io-client';
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from '@/consts';

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
      user: null,
      avatarUrl: '',
    };
  },
  created() {
    this.fetchProfile();
  },
  methods: {
    async followAsFriend(login: string) {
      const socket: Socket = this.$store.getters.getUserSocket();

      await socket.emit('followAsFriend', {
        login: login
      });
    },

    async unblockUser(login: string) {
      const socket: Socket = this.$store.getters.getUserSocket();

      await socket.emit('unblockUser', {
        login: login
      });
    },
    async fetchProfile(): Promise<any> {
      try {
        const input = `http://${VUE_APP_WEB_HOST}:${VUE_APP_BACK_PORT}/users/profile/${this.nickname}`;
        const token = localStorage.getItem('token');
        const options = {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
        };
        const response = await fetch(input, options);
        if (response.ok) {
          const user = await response.json();
          this.user = user;
          this.avatarUrl = await this.fetchAvatar(user.login);
        } else {
          console.log('error' + response.status + ' ' + response.statusText + ' ' + response.url);
          console.log(response)
        }
      } catch (error) {
        console.log(error);
      }
    },
    async fetchAvatar(login: string): Promise<any> {
      try {
        const input = `http://${VUE_APP_WEB_HOST}:${VUE_APP_BACK_PORT}/users/avatar/${login}`;
        const token = localStorage.getItem('token');
        const options = {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
        };
        const response = await fetch(input, options);
        if (response.ok) {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        } else {
          return '/default.jpg';
        }
      } catch (error) {
        return '/default.jpg';
      }
    },
  },
});
</script>
