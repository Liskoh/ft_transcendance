<template>
  <v-container>
    <notification ref="notyf"/>
    <v-row>
      <v-col cols="4">
        <v-card color="grey-darken-3">
        <v-btn color="primary" @click="showCreateModal = true">
          Create Channel
        </v-btn>
        <v-dialog v-model="showCreateModal" max-width="500">
          <v-card color="grey-darken-3">
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
<!--          <v-list-item-group v-model="selectedChannel">-->
            <v-list-item v-for="channel in joinedChannels" :key="channel.id">
              <v-list-item-title>{{ channel.name }}</v-list-item-title>
              <v-list-item-action>
                <v-btn color="primary" @click="selectChannel(channel.id)">Select</v-btn>
                <v-btn color="error" @click="leaveChannel(channel.id)">Leave</v-btn>
              </v-list-item-action>
            </v-list-item>
<!--          </v-list-item-group>-->
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
        <v-card color="grey-darken-3" v-if="currentChannel">
          <v-card-text>
<!--            <v-btn class="message-action" @click="showModal(message)">-->
<!--              <v-avatar size="30" color="primary">-->
<!--                <v-icon>mdi-account</v-icon>-->
<!--              </v-avatar>-->
<!--            </v-btn>-->
            <div class="message" v-for="message in currentChannelMessages" :key="message.id">
              <strong>{{ message.nickname }}</strong>: {{ message.content }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-text-field v-model="newMessage" label="Message" outlined></v-text-field>
            <v-btn color="primary" @click="sendMessage()">Send</v-btn>
          </v-card-actions>
        </v-card>
        <v-dialog v-model="modalVisible">
          <v-card>
            <v-card-title>Choose an action</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item @click="">
                  <v-list-item-title>Duel on pong</v-list-item-title>
                </v-list-item>
                <v-list-item @click="">
                  <v-list-item-title>Block user</v-list-item-title>
                </v-list-item>
                <v-list-item @click="">
                  <v-list-item-title>Follow user</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
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
  name: "TestChat",
  store,
  created() {
    this.$store.commit('setChannelSocket', io('http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/channels', {
          extraHeaders: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        })
    );

    this.getChannelSocket.emit('getChannels');

    if (this.$store.getters.getCurrentChannel) {
      this.selectChannel(this.$store.getters.getCurrentChannel.id);
    }
  },
  data() {
    return {
      currentChannelMessages() {
        return [];
      },
      selectedChannel: <Channel | unknown>null,
      defaultMessage: "Not in a channel",
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
      newChannelType: "public",
      channelTypes: ["public", "private"],
      selectedMessage: null,
    };
  },

  computed: {
    ...mapState({
      joinedChannels: state => state.joinedChannels,
      availableChannels: state => state.availableChannels,
      directChannels: state => state.directChannels,
      currentChannel: state => state.currentChannel,
    }),
    getChannelSocket() {
      return this.$store.getters.getChannelSocket;
    },
  },
  methods: {
    showModal(message) {
      this.selectedMessage = message;
      this.modalVisible = true;
    },
    //last
    async createChannel() {
      await this.getChannelSocket.emit('createChannel', {
        name: this.newChannelName,
        channelType: this.newChannelType,
        password: this.newChannelPassword
      });
      this.showJoined = true;
      this.showCreateModal = false;
      this.newChannelName = "";
      this.newChannelPassword = "";
      this.newChannelType = "public";
      console.log('create new channel');
    },
    async joinChannel(channel: Channel, password?: string) {
      await this.getChannelSocket.emit('joinChannel', {
        id: channel.id,
        password: password
      });
      // await this.getChannelSocket.emit('getChannels');
      console.log('join channel with success');
      // await this.selectChannel(id);
      await this.getChannelSocket.emit('getChannel', {
        id: channel.id,
      });
    },
    async selectChannel(channelId: number) {
      await this.getChannelSocket.emit('getChannel', {
        id: channelId,
      });
      const array: number[] = this.$store.getters.getJoinedChannels.map((channel: Channel) => channel.id);

      if (!array.includes(channelId))
        await this.joinChannel(channelId);
    },
    async leaveChannel(channelId: number) {
      await this.getChannelSocket.emit('leaveChannel', {
        id: channelId,
      });
      const currentChannel = this.$store.getters.getCurrentChannel;

      if (currentChannel)
        if (currentChannel.id === channelId) {
          this.$store.commit('setCurrentChannel', null);
          this.currentChannelMessages = [];
        }
      console.log('leave channel with success');
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
        // //this.$refs.notyf.showNotification('You are not in any channel', 'error');
        return;
      }

      const commandArray = msgContent.split(' ');
      const commandName = commandArray[0];

      if (commandName[0] === '/') {
        const commandArgs = commandArray.slice(1);
        const command = getCommandByName(commandName);
        // msgContent = "";
        if (command) {
          console.log('command found');
          await command.emitCommand(command.getCommandData(currentChannel.id, commandArgs), this.getChannelSocket);
          return;
        }

        this.sendHelp();
        return;
      }

      await this.getChannelSocket.emit('sendMessage', {
        channelId: currentChannel.id,
        text: msgContent,
      });
    },

    sendHelp() {
      COMMANDS.forEach(command => {
        this.currentChannelMessages.push(
            new Message(
                -1,
                command.getCommandHelp(),
                -1,
                new Date()
            )
        );
      });
    }
  },
  mounted() {
    this.getChannelSocket.on('getChannelSuccess', (data) => {
      const channel = data;
      this.$store.commit('setCurrentChannel', channel);

      const channelFromStore = this.$store.getters.getCurrentChannel;
      console.log('channel from store ' + channelFromStore.name);
      if (channelFromStore) {
        this.currentChannelMessages = channelFromStore.messages;
        this.$refs.notyf.showNotification('You are now on channel ' + channelFromStore.name, + '!', 'success');
      }

      this.$forceUpdate();
    });

    this.getChannelSocket.on('channelError', (data) => {
      this.$refs.notyf.showNotification(data, 'error');
    });

    this.getChannelSocket.on('channelSuccess', (data) => {
      this.$refs.notyf.showNotification(data, 'success');
    });

    this.getChannelSocket.on('channelInfo', (data) => {
      //this.$refs.notyf.showNotification(data, 'success');
    });

    //channels data:
    this.getChannelSocket.on('joinableChannels', (data) => {
      this.$store.commit('setAvailableChannels', data);
      console.log('joinableChannels', JSON.stringify(this.$store.getters.getAvailableChannels));
      this.$forceUpdate();
    });

    this.getChannelSocket.on('joinedChannels', (data) => {
      this.$store.commit('setJoinedChannels', data);
      // console.log('joinedChannels', JSON.stringify(this.$store.getters.getJoinedChannels));
      this.$forceUpdate();
    });

    this.getChannelSocket.on('directChannels', (data) => {
      this.$store.commit('setDirectChannels', data);
      this.$forceUpdate();
    });

    this.getChannelSocket.on('resetCurrent', (data) => {
      this.$store.commit('setCurrentChannel', null);
      this.currentChannelMessages = [];
    });

    this.getChannelSocket.on('message', (data) => {
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
  },
};
</script>