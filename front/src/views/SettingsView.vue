<template>
  <v-container>
    <notification ref="notyf"/>
    <v-row>
      <v-col cols="1" md="6">
        <v-text-field
            label="Nickname"
            persistent-hint
            type="input"
            v-model="newNickname"
            v-on:keydown.enter="changeNickname"
        ></v-text-field>
        <v-btn
            color="primary"
            @click="changeNickname"
            block
        >Change nickname
        </v-btn>
      </v-col>
      <v-col cols="1" md="6">
        <v-file-input
            label="Avatar"
            v-model="selectedFile"
            accept="image/*"
            show-size
            v-show="uploadFile"
            @change="handleFileInputChange"
        ></v-file-input>
        <v-btn
            color="primary"
            @click="uploadFile"
            block
        >Upload avatar
        </v-btn>
      </v-col>
      <v-col cols="2" md="6">
        <v-card color="primary">
          <v-card-title>
            Avatar
          </v-card-title>
          <v-card-text>
            <v-avatar size="300">
              <v-img :src="avatarUrl" alt="User avatar"/>
            </v-avatar>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="2" md="6">
        <v-card color="primary">
          <v-card-title>
            Friends
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="friend in friends" :key="friend.login">
<!--                <v-list-item-content>-->
                  <v-list-item-title>{{ friend.login }}</v-list-item-title>
                  <v-list-item-subtitle
                      :class="{'red--text': friend.status === 'online', 'green--text': friend.status === 'offline'}">
                    {{ friend.status }}
                  </v-list-item-subtitle>
<!--                </v-list-item-content>-->
                <v-list-item-action>
                  <v-btn color="error" @click="removeFriend(friend.login)">Remove</v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>
  </v-container>
</template>


<!--        <div class="fixed-size-image-container">-->
<!--          <img :src="avatarUrl" alt="avatar">-->
<!--        </div>-->
<style>
.fixed-size-image-container {
  max-width: 100px;
}
</style>

<script lang="ts">
import {defineComponent} from 'vue';
import {Socket} from 'socket.io-client';
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from '@/consts';
import type {User} from '@/models/user.model';
import login from "@/components/Login.vue";

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

    //emits:
    socket.emit('getMe');
    socket.emit('getFriends');

    socket.on('userSuccess', (data: any) => {
      this.$refs.notyf.showNotification(data, 'success');
    });

    socket.on('userError', (data: any) => {
      this.$refs.notyf.showNotification(data, 'error');
    });

    socket.on('me', (data: any) => {
      const user: User = data;

      if (!user)
        return;
      this.$store.commit('setMe', user);
    });

    socket.on('friends', (data: any) => {
      const friends: User[] = [];
      console.log('friends');
      for (const friend of data) {
        console.log(friend);
        friends.push(friend);
      }

      this.$store.commit('setFriends', friends);
    });

    (async () => {
      this.avatarUrl = await this.fetchAvatar('hjordan');
    })();
  },

  methods: {
    async changeNickname() {

      // if (true) {
      //   this.$router.push({name: 'profile', params: {login: 'hjordan'}});
      //   return;
      // }
      console.log('changing nickname' + this.newNickname);
      if (this.newNickname !== '') {
        const socket: Socket = this.$store.getters.getUserSocket();

        socket.emit('changeNickname', {
          login: this.newNickname
        });
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
            this.avatarUrl = await this.fetchAvatar('hjordan');
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

    async fetchAvatar(login: string): Promise<any> {
      console.log('fetching avatar');
      try {
        const input = `http://${VUE_APP_WEB_HOST}:${VUE_APP_BACK_PORT}/users/avatar/${login}`;
        console.log(input);
        const token = localStorage.getItem('token');
        const options = {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
        };
        const response = await fetch(input, options);
        if (response.ok) {
          console.log('avatar fetched ok');
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        } else {
          return '/default.jpg';
        }
      } catch (error) {
        return '/default.jpg';
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
  },
  computed: {
    // Récupérer la liste des amis depuis le store
    friends(): User[] {
      return this.$store.getters.getFriends();
    },
  }
})
</script>
