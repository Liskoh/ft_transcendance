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
        <v-btn
            color="error"
            @click="myProfile"
            block
        >My Profile
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
        <v-card color="grey-darken-3">
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
                  <v-list-item-title @click="showModal()">{{ friend.nickname }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ friend.status }}
                  </v-list-item-subtitle>
<!--                </v-list-item-content>-->
                <v-list-item-action>
                  <v-btn color="error" @click="removeFriend(friend.nickname)">Remove</v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        <v-card color="primary">
          <v-card-title>
            Users blocked
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="blocked in blockedUsers" :key="blocked.nickname">
                <!--                <v-list-item-content>-->
                <v-list-item-title>{{ blocked.nickname }}</v-list-item-title>
                <!--                </v-list-item-content>-->
                <v-list-item-action>
                  <v-btn color="success" @click="unblockUser(blocked.nickname)">Unblock</v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-dialog v-model="modalVisible">
        <v-card color="grey-darken-3">
          <v-card-title>Choose an action</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item @click="viewProfile">
                <v-list-item-title>
                  View profile page
                  <v-icon>mdi-account</v-icon>
                  <v-list-item-subtitle>View this user's profile page</v-list-item-subtitle>
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="showLevel = true">
                <v-list-item-title>
                  Duel on pong
                  <v-icon>mdi-controller</v-icon>
                  <v-list-item-subtitle>Play a game of pong with this user</v-list-item-subtitle>
                </v-list-item-title>
                <v-dialog v-model="showLevel" max-width="500">
                  <v-card>
                    <v-card-title class="headline">Choose level</v-card-title>
                    <v-card-text>
                      <v-radio-group v-model="selectedLevel" row>
                        <v-radio label="Easy" value="easy"></v-radio>
                        <v-radio label="Medium" value="medium"></v-radio>
                        <v-radio label="Hard" value="hard"></v-radio>
                      </v-radio-group>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green darken-1" text @click="showLevel = false">Cancel</v-btn>
                      <v-btn color="green darken-1" text @click="duelOnPong(selectedLevel); showLevel = false">Duel</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-dialog>

    </v-row>
    <v-snackbar :timeout="snackbar.timeout" :color="snackbar.color" v-model="snackbar.show"
                :style="{ top: snackbar.position.top, right: snackbar.position.right }">
      {{ snackbar.message }}
      <!--      <v-btn icon @click="snackbar.show = false">-->
      <!--        <v-icon>mdi-close-circle</v-icon>-->
      <!--      </v-btn>-->
    </v-snackbar>
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
import login from "@/views/LoginView.vue";
import {Message} from "@/models/message.model";

export default defineComponent({
  name: 'SettingsView',
  props: {
    snackbar: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      newNickname: '',
      selectedFile: [],
      avatarUrl: '',
      modalVisible: false,
      showLevel: false,
      selectedLevel: 'easy',
    }
  },
  created() {
    const socket: Socket = this.$store.getters.getUserSocket();

    socket.removeAllListeners();
    //emits:
    socket.emit('getMe');
    socket.emit('getFriends');
    socket.emit('getBlockedUsers');

    socket.on('userSuccess', (data: any) => {
      this.snackbar.message = data.message;
      this.snackbar.color = 'success';
      this.snackbar.show = true;
    });

    socket.on('userError', (data: any) => {
      this.snackbar.message = data.message;
      this.snackbar.color = 'error';
      this.snackbar.show = true;
    });

    socket.on('me', (data: any) => {
      const user: User = data;

      if (!user)
        return;
      this.$store.commit('setMe', user);

      console.log(JSON.stringify('me= ' + JSON.stringify(this.$store.getters.getMe())));
      (async () => {
        this.avatarUrl = await this.fetchAvatar(user.login);
      })();
    });

    socket.on('friends', (data: any) => {
      const friends: User[] = [];
      for (const friend of data) {
        friends.push(friend);
      }

      this.$store.commit('setFriends', friends);
    });

    socket.on('blockedUsers', (data: any) => {
      const blockedUsers: User[] = [];
      for (const blockedUser of data) {
        blockedUsers.push(blockedUser);
      }

      this.$store.commit('setBlockedUsers', blockedUsers);
    });

  },

  methods: {
    showModal() {
      // this.selectedNickname = message.nickname;
      this.modalVisible = true;
    },
    viewProfile() {
      this.$router.push({name: 'profile', params: {nickname: this.selectedNickname}});
      this.modalVisible = false;
    },
    async duelOnPong(level: string) {
      const socket: Socket = this.$store.getters.getChannelSocket();
      await socket.emit('duel', {
        login: this.selectedNickname,
        gameLevel: level
      });
      ////console.log('duel on pong ' + this.selectedNickname);
      this.modalVisible = false;
    },
    async myProfile() {
      const user: User = this.$store.getters.getMe();
      if (!user)
        return;
      console.log('myProfile ' + JSON.stringify(user));

      this.$router.push({name: 'profile', params: {nickname: user.nickname}});
    },
    async changeNickname() {

      // if (true) {
      //   this.$router.push({name: 'profile', params: {login: 'hjordan'}});
      //   return;
      // }
      if (this.newNickname !== '') {
        const socket: Socket = this.$store.getters.getUserSocket();

        socket.emit('changeNickname', {
          login: this.newNickname
        });
      }
    },

    handleFileInputChange(event: any) {
      if (event.target.files.length > 0) {
        this.selectedFile = [];
        this.selectedFile.push(event.target.files[0]);
      } else {
        this.selectedFile = null;
      }
    },

    async removeFriend(login: string) {
      const socket: Socket = this.$store.getters.getUserSocket();

      await socket.emit('unfollowAsFriend', {
        login: login
      });
    },

    async unblockUser(login: string) {
      const socket: Socket = this.$store.getters.getUserSocket();
      console.log('unblockUser', login);
      await socket.emit('unblockUser', {
        login: login
      });
    },

    async uploadFile() {
      console.log('uploadFile ' + JSON.stringify(this.selectedFile));
      const selected = this.selectedFile[0];

      if (!selected) {
        this.snackbar.message = 'No file selected!';
        this.snackbar.color = 'error';
        this.snackbar.show = true;
        return;
      }
      const formData = new FormData();
      const input: string = 'http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/users/upload';
      formData.append('photo', selected);

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
          this.avatarUrl = await this.fetchAvatar(this.$store.getters.getMe().login);
          this.snackbar.message = 'File uploaded successfully!';
          this.snackbar.color = 'success';
          this.snackbar.show = true;
        } else {
          this.snackbar.message = response.statusText;
          this.snackbar.color = 'error';
          this.snackbar.show = true;
        }
      } catch (error) {
        this.snackbar.message = error;
        this.snackbar.color = 'error';
        this.snackbar.show = true;
      }
    },

    async fetchAvatar(login: string): Promise<any> {
      try {
        const input = `http://${VUE_APP_WEB_HOST}:${VUE_APP_BACK_PORT}/users/avatar/${login}`;
        // console.log(input);
        const token = localStorage.getItem('token');
        const options = {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
        };
        const response = await fetch(input, options);
        if (response.ok) {
          // console.log('avatar fetched ok');
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
  computed: {
    friends(): User[] {
      return this.$store.getters.getFriends();
    },
    blockedUsers(): User[] {
      return this.$store.getters.getBlockedUsers();
    },
  }
})
</script>
