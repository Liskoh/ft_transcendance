<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <v-card color="grey-darken-3">
          <v-btn color="primary" @click="showCreateModal = true">
            Create Channel
          </v-btn>
          <v-dialog v-model="showCreateModal" max-width="500">
            <v-card>
              <v-card-title>Create Channel</v-card-title>
              <v-card-text>
                <v-form>
                  <v-text-field v-model="newChannelName" label="Channel Name" required outlined></v-text-field>
                  <v-text-field v-model="newChannelPassword" label="Password" outlined></v-text-field>
                  <v-select v-model="newChannelType" label="Channel Type" :items="channelTypes"></v-select>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="createChannel()">Create</v-btn>
                <v-btn color="error" @click="showCreateModal = false">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <h2>Joined Channels</h2>
          <v-list v-show="showJoined">
            <v-list-item v-for="channel in joinedChannels" :key="channel.id">
              <v-list-item-title>{{ channel.name }}</v-list-item-title>
              <v-list-item-action>
                <v-btn color="primary" @click="selectChannel(channel.id)">Select</v-btn>
                <v-btn color="error" @click="leaveChannel(channel.id)">Leave</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>


          <v-btn color="primary" @click="showJoined = !showJoined">
            {{ showJoined ? "Hide Channels" : "Show Channels" }}
          </v-btn>
          <h2>DM channels</h2>
          <v-list v-show="showDm">
            <!--          <v-list-item-group v-model="selectedChannel">-->
            <v-list-item v-for="channel in directChannels" :key="channel.id">
              <v-list-item-title>{{ channel.name }}</v-list-item-title>
              <v-list-item-action>
                <v-btn color="primary" @click="selectChannel(channel.id)">Select</v-btn>
              </v-list-item-action>
            </v-list-item>
            <!--          </v-list-item-group>-->
          </v-list>
          <v-btn color="primary" @click="showDm = !showDm">
            {{ showDm ? "Hide DMs" : "Show Dms" }}
          </v-btn>
          <h2>Available Channels</h2>
          <v-list v-show="showAvailables">
            <!--          <v-list-item-group v-model="selectedChannel">-->
            <v-list-item v-for="channel in availableChannels" :key="channel.id">
              <v-list-item-title>{{ channel.name }}</v-list-item-title>
              <v-list-item-action>
                <v-btn v-if="channel.password" color="red" @click="showPasswordModal = true; selectedChannel = channel">
                  Password
                </v-btn>
                <v-btn v-else color="primary" @click="joinChannel(channel)">
                  Join
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <!--          </v-list-item-group>-->
          </v-list>
          <v-btn color="primary" @click="showAvailables = !showAvailables">
            {{ showAvailables ? "Hide Channels" : "Show Channels" }}
          </v-btn>
          <v-dialog v-model="showPasswordModal" max-width="500">
            <v-card>
              <v-card-title>Enter Password</v-card-title>
              <v-card-text>
                <v-text-field v-model="password" label="Password" outlined></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="joinChannel(selectedChannel.id, password)">Join</v-btn>
                <v-btn color="error" @click="showPasswordModal = false">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card>
      </v-col>
      <v-col cols="8">
        <h2>{{ (!currentChannel || !currentChannel.name) ? "You are not in a channel" : currentChannel.name }}</h2>
        <v-card color="grey-darken-3" v-if="currentChannel" style="max-height: 500px; overflow-y: auto;">
          <v-list-item v-for="message in currentChannelMessages" :key="message.id" @click="showModal(message)">
            <v-list-item-title class="text-subtitle-5">{{ message.nickname }}</v-list-item-title>
            <v-list-item-subtitle>{{ message.content }}</v-list-item-subtitle>
          </v-list-item>
        </v-card>
        <v-card-actions>
          <v-text-field v-model="newMessage" label="Message" outlined @keyup.enter="sendMessage()"></v-text-field>
          <v-btn color="primary" @click="sendMessage()">Send</v-btn>
        </v-card-actions>

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
                <v-list-item @click="blockUser">
                  <v-list-item-title>
                    Block user
                    <v-icon>mdi-account-cancel</v-icon>
                    <v-list-item-subtitle>Block this user from sending you messages</v-list-item-subtitle>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="followAsFriend">
                  <v-list-item-title>Follow user
                    <v-icon>mdi-account-plus</v-icon>
                    <v-list-item-subtitle>Follow this user</v-list-item-subtitle>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<style>
.my-active-class {
  background-color: blue;
}
</style>

<script lang="ts">
import {COMMANDS, getCommandByName, VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from "@/consts";
import {mapState} from "vuex";
import {Message} from "@/models/message.model";
import {store} from "@/stores/store";
import io, {Socket} from "socket.io-client";
import {Channel} from "@/models/channel.model";

export default {
  name: "Chat",
  store,
  created() {
    let socket: Socket = this.$store.getters.getChannelSocket();

    if (!socket) {
      console.log('creating socket');
      this.$store.commit('setChannelSocket', io('http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/channels', {
        extraHeaders: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }));
      console.log('socket created');
    }

    socket = this.$store.getters.getChannelSocket();
    socket.removeAllListeners();

    socket.on('getChannelSuccess', (data) => {
      const channel = data;
      this.$store.commit('setCurrentChannel', channel);

      const channelFromStore = this.$store.getters.getCurrentChannel;
      //console.log('channel from store ' + channelFromStore.name);
      if (channelFromStore) {
        this.currentChannelMessages = channelFromStore.messages;
        this.snackbar.message = 'You are now on channel ' + channelFromStore.name +'!';
        this.snackbar.color = 'success';
        this.snackbar.show = true;
      }

      this.$forceUpdate();
    });

    socket.on('channelError', (data) => {
      console.log('channel error ' + data.message);
      this.snackbar.message = data.message;
      this.snackbar.color = 'error';
      this.snackbar.show = true;
    });

    socket.on('channelSuccess', (data) => {
      console.log('channel success ' + data.message);
      this.snackbar.message = data.message;
      this.snackbar.color = 'success';
      this.snackbar.show = true;
    });

    socket.on('channelInfo', (data) => {
      this.snackbar.message = data.message;
      this.snackbar.color = 'success';
      this.snackbar.show = true;
    });

    //channels data:
    socket.on('joinableChannels', (data) => {
      this.$store.commit('setAvailableChannels', data);
      this.$forceUpdate();
    });

    socket.on('joinedChannels', (data) => {
      this.$store.commit('setJoinedChannels', data);
      this.$forceUpdate();
    });

    socket.on('directChannels', (data) => {
      this.$store.commit('setDirectChannels', data);
      this.$forceUpdate();
    });

    socket.on('resetCurrent', (data) => {
      this.$store.commit('setCurrentChannel', null);
      this.currentChannelMessages = [];
    });

    socket.on('sendOnGame', (data) => {
      this.$router.push({name: 'game'});
    });

    socket.on('message', (data) => {
      const message = new Message(
          data.id,
          data.channelId,
          data.content,
          data.userId,
          data.nickname,
          data.date
      );

      const currentChannel: Channel = this.$store.getters.getCurrentChannel;

      if (!currentChannel || currentChannel.id !== message.channelId) {
        return;
      }
      this.currentChannelMessages.push(message);
    });

    socket.emit('getChannels');

    if (this.$store.getters.getCurrentChannel) {
      this.selectChannel(this.$store.getters.getCurrentChannel.id);
    }

  },
  // beforeRouteLeave(to, from, next) {
  //   const socket: Socket = this.$store.getters.getChannelSocket();
  //
  //   socket.disconnect();
  //   this.$store.commit('setChannelSocket', socket);
  //   next();
  // },
  data() {
    return {
      currentChannelMessages() {
        return [];
      },
      selectedChannel: <Channel | unknown>null,
      newMessage: "",
      showAvailables: false,
      showJoined: false,
      showDm: false,
      showPasswordModal: false,
      password: "",
      showCreateModal: false,
      modalVisible: false,
      newChannelName: "",
      newChannelPassword: "",
      newChannelType: "PUBLIC",
      channelTypes: ["PUBLIC", "PRIVATE"],
      selectedNickname: null,
      showLevel: false,
      selectedLevel: 'easy',
      snackbar: {
        show: false,
        message: '',
        timeout: 3000,
        color: 'error'
      }
    };
  },

  computed: {
    ...mapState({
      joinedChannels: state => state.joinedChannels,
      availableChannels: state => state.availableChannels,
      directChannels: state => state.directChannels,
      currentChannel: state => state.currentChannel,
    }),
  },
  methods: {
    showModal(message: Message) {
      this.selectedNickname = message.nickname;
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
    async followAsFriend() {
      const socket: Socket = this.$store.getters.getUserSocket();
      ////console.log('follow ' + this.selectedNickname);
      await socket.emit('followAsFriend', {
        login: this.selectedNickname
      });
      this.modalVisible = false;
    },
    async blockUser() {
      const socket: Socket = this.$store.getters.getUserSocket();
      ////console.log('blockUser ' + this.selectedNickname);
      await socket.emit('blockUser', {
        login: this.selectedNickname
      });
      this.modalVisible = false;
    },
    //last
    async createChannel() {
      const socket: Socket = this.$store.getters.getChannelSocket();
      ////console.log(socket.connected);
      await socket.emit('createChannel', {
        name: this.newChannelName,
        channelType: this.newChannelType,
        password: this.newChannelPassword
      });
      this.showJoined = true;
      this.showCreateModal = false;
      this.newChannelName = "";
      this.newChannelPassword = "";
      this.newChannelType = "PUBLIC";
      ////console.log('create new channel');
    },
    async joinChannel(channel: Channel, password?: string) {
      const socket: Socket = this.$store.getters.getChannelSocket();
      await socket.emit('joinChannel', {
        id: channel.id,
        password: password
      });
      // await this.getChannelSocket.emit('getChannels');
      ////console.log('join channel with success');
      // await this.selectChannel(id);
      await socket.emit('getChannel', {
        id: channel.id,
      });
    },
    async selectChannel(channelId: number) {
      const socket: Socket = this.$store.getters.getChannelSocket();
      await socket.emit('getChannel', {
        id: channelId,
      });
      const array: number[] = this.$store.getters.getJoinedChannels.map((channel: Channel) => channel.id);

      if (!array.includes(channelId))
        await this.joinChannel(channelId);
    },
    async leaveChannel(channelId: number) {
      const socket: Socket = this.$store.getters.getChannelSocket();
      await socket.emit('leaveChannel', {
        id: channelId,
      });
      const currentChannel = this.$store.getters.getCurrentChannel;

      if (currentChannel)
        if (currentChannel.id === channelId) {
          this.$store.commit('setCurrentChannel', null);
          this.currentChannelMessages = [];
        }
      ////console.log('leave channel with success');
    },
    hasCurrentChannel(): boolean {
      return this.$store.getters.getCurrentChannel !== null;
    },
    async sendMessage() {
      if (!this.newMessage)
        return;

      const msgContent: string = this.newMessage;

      const currentChannel = this.$store.getters.getCurrentChannel;
      if (!currentChannel) {
        this.snackbar.message = 'You are not in any channel';
        this.snackbar.color = 'error';
        this.snackbar.show = true;
        return;
      }

      const socket: Socket = this.$store.getters.getChannelSocket();
      const commandArray = msgContent.split(' ');
      const commandName = commandArray[0];

      if (commandName[0] === '/') {
        const commandArgs = commandArray.slice(1);
        const command = getCommandByName(commandName);
        // msgContent = "";
        if (command) {
          ////console.log('command found');
          await command.emitCommand(command.getCommandData(currentChannel.id, commandArgs), socket);
          return;
        }

        this.sendHelp();
        return;
      }

      socket.emit('sendMessage', {
        channelId: currentChannel.id,
        text: msgContent,
      });
    },

    sendHelp() {
      if (!this.currentChannelMessages)
        return;


      COMMANDS.forEach(command => {
        this.currentChannelMessages.push(
            new Message(
                -1,
                -1,
                command.getCommandHelp(),
                -1,
                'System',
                new Date()
            )
        );
      });
    }
  },
  mounted() {
  },
};
</script>