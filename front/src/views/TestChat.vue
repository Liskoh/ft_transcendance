<template>
  <v-container>
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
          <v-list-item-group v-model="selectedChannel">
            <v-list-item v-for="channel in joinedChannels" :key="channel.id">
              <v-list-item-title>{{ channel.name }}</v-list-item-title>
              <v-list-item-action>
                <v-btn color="primary" @click="selectChannel(channel.id)">Select</v-btn>
                <v-btn color="error" @click="leaveChannel(channel.id)">Leave</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-btn color="primary" @click="showJoined = !showJoined">
          {{ showJoined ? "Hide Channels" : "Show Channels" }}
        </v-btn>
        <h2>DM channels</h2>
        <v-list v-show="showDm">
          <v-list-item-group v-model="selectedChannel">
            <v-list-item v-for="channel in channels" :key="channel.id">
              <v-list-item-title>{{ channel.name }}</v-list-item-title>
              <v-list-item-action>
                <v-btn color="primary" @click="joinChannel(channel.id)">Select</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-btn color="primary" @click="showDm = !showDm">
          {{ showDm ? "Hide DMs" : "Show Dms" }}
        </v-btn>
        <h2>Available Channels</h2>
        <v-list v-show="showAvailables">
          <v-list-item-group v-model="selectedChannel">
            <v-list-item v-for="channel in channels" :key="channel.id">
              <v-list-item-title>{{ channel.name }}</v-list-item-title>
              <v-list-item-action>
                <v-btn v-if="channel.password" color="red" @click="showPasswordModal = true; selectedChannel = channel">
                  Password
                </v-btn>
                <v-btn v-else color="primary" @click="joinChannel(channel.id)">
                  Join
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list-item-group>
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
        <v-card color="grey-darken-3">
          <v-card-text>
<!--            <v-btn class="message-action" @click="showModal(message)">-->
<!--              <v-avatar size="30" color="primary">-->
<!--                <v-icon>mdi-account</v-icon>-->
<!--              </v-avatar>-->
<!--            </v-btn>-->
            <div class="message" v-for="message in currentChannel.messages" :key="message.id">
              <strong>{{ message.username }}</strong>: {{ message.text }}
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
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from "@/consts";
import {mapState} from "vuex";
import {Message} from "@/models/message.model";
import {store} from "@/stores/store";
import io, {Socket} from "socket.io-client";

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

    // this.getChannelSocket.emit('getChannels');

    if (this.$store.getters.getCurrentChannel) {
      this.selectChannel(this.$store.getters.getCurrentChannel.id);
    }
  },
  data() {
    return {
      channels: [
        {id: 1, name: "General", joined: false},
        {id: 2, name: "Random", joined: true, password: "1234"},
        {id: 3, name: "Tech", joined: false},
      ],
      currentChannel: {id: 2, name: "Random", messages: []},
      selectedChannel: 2,
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
    availableChannels() {
      return this.channels.filter((channel) => !channel.joined);
    },
    joinedChannels() {
      return this.channels.filter((channel) => channel.joined);
    },
  },
  methods: {
    showModal(message) {
      this.selectedMessage = message;
      this.modalVisible = true;
    },
    createChannel() {
      console.log(this.newChannelName);
      console.log(this.newChannelPassword);
      console.log(this.newChannelType);
    },

    joinChannel(channelId, password) {
      // Do something to join the channel
      const channel = this.channels.find((channel) => channel.id === channelId);
      if (channel.password && channel.password !== password) {
        alert("Wrong password");
        return;
      }
      channel.joined = true;
      this.currentChannel = channel;
    },
    leaveChannel(channelId) {
      // Do something to leave the channel
      const channel = this.channels.find((channel) => channel.id === channelId);
      if (this.currentChannel.id === channelId) {
        this.currentChannel = {id: 0, name: "", messages: []};
      }
      channel.joined = false;
    },
    selectChannel(channelId) {
      // Do something to select the channel
      this.currentChannel = this.channels.find((channel) => channel.id === channelId);
    },
    sendMessage() {
      // Do something to send the message
      if (!this.currentChannel)
        this.currentChannel = this.channels[0];

      this.currentChannel.messages = [];
      this.currentChannel.messages.push({id: 1, username: "User", text: this.newMessage});
      this.newMessage = "";
    },
  },
};
</script>