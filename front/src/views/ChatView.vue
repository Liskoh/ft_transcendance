<script lang="ts">
import {mapGetters, mapMutations, mapState} from "vuex";
import {Message} from "@/models/message.model";
import {Channel} from "@/models/channel.model";
import {COMMANDS, getCommandByName, VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from "@/consts";
import {AbstractCommand} from "@/commands/abstract.command";
import {store} from "@/stores/store";
import {Notyf} from "notyf";
import 'notyf/notyf.min.css';
import io, {Socket} from "socket.io-client";
import process from "process";

export default {
  name: "Chat",
  store,

  setup() {
    // const notyf: Notyf = new Notyf({
    //   duration: 2500,
    //   position: {
    //     x: 'right',
    //     y: 'top'
    //   }
    // });
    //
    // const showNotification = (message: string, type: 'success' | 'error'): void => {
    //   if (type === 'success') {
    //     // notyf.success(message);
    //     this.$notyf.success(message);
    //   } else {
    //     // notyf.error(message);
    //     this.$notyf.error(message);
    //   }
    // };
    //
    // return {
    //   showNotification
    // }
  },

  created() {
    // console.log('created token ' + localStorage.getItem('token'));

    this.$store.commit('setChannelSocket', io('http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/channels', {
          extraHeaders: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        })
    );

    this.getChannelSocket.emit('getChannels');
    console.log('get channels with success');
    console.log('created');

    if (this.$store.getters.getCurrentChannel) {
      this.selectChannel(this.$store.getters.getCurrentChannel.id);
    }
  },
  beforeRouteLeave(to, from, next) {
    this.getChannelSocket.disconnect();
    next();
  },
  computed: {
    ...mapState({
      joinedChannels: state => state.joinedChannels,
      availableChannels: state => state.availableChannels,
      directChannels: state => state.directChannels
    }),
    getChannelSocket() {
      return this.$store.getters.getChannelSocket;
    },

    setChannelSocket(socket) {
      this.$store.commit('setChannelSocket', socket);
    },

    channelMessages(): Message[] {
      return this.$store.getters.getCurrentChannel.messages;
    },
  },
  data() {
    return {
      newMessage: "",
      currentChannelMessages() {
        return [];
      },
      showModal: false,
      newChannelName: "",
      newChannelPassword: "",
      channelType: "PUBLIC",
      passwordInput: {},
    };
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
      this.$refs.notyf.showNotification(data, 'success');
    });

    //channels data:
    this.getChannelSocket.on('joinableChannels', (data) => {
      this.$store.commit('setAvailableChannels', data);
      this.$forceUpdate();
    });

    this.getChannelSocket.on('joinedChannels', (data) => {
      this.$store.commit('setJoinedChannels', data);
      this.$forceUpdate();
    });

    this.getChannelSocket.on('directChannels', (data) => {
      this.$store.commit('setDirectChannels', data);
      this.$forceUpdate();
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

      if (currentChannel.id !== message.channelId) {
        return;
      }

      this.currentChannelMessages.push(message);
      this.$forceUpdate();
    });
  },

  methods: {
    async createNewChannel() {
      await this.getChannelSocket.emit('createChannel', {
        name: this.newChannelName,
        channelType: this.channelType,
        password: this.newChannelPassword
      });
      console.log('create new channel');
    },
    async joinChannel(id: number, password?: string) {
      await this.getChannelSocket.emit('joinChannel', {
        id: id,
        password: password
      });
      // await this.getChannelSocket.emit('getChannels');
      console.log('join channel with success');
      // await this.selectChannel(id);
      await this.getChannelSocket.emit('getChannel', {
        id: channelId,
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
      this.$refs.msgBoxForm.reset();

      const currentChannel = this.$store.getters.getCurrentChannel;
      if (!currentChannel) {
        this.$refs.notyf.showNotification('You are not in any channel', 'error');
        return;
      }

      const commandArray = msgContent.split(' ');
      const commandName = commandArray[0];

      if (commandName[0] === '/') {
        const commandArgs = commandArray.slice(1);
        const command = getCommandByName(commandName);
        // msgContent = "";
        if (command) {
          await command.emitCommand(command.getCommandData(currentChannel.id, commandArgs), this.getChannelSocket);
          return;
        }

        return;
      }
      if (!currentChannel) {
        this.$refs.notyf.showNotification('You are not in any channel', 'error');
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
};
</script>

<template>

  <div>
    <notification ref="notyf"/>
  </div>

  <div class="c-chat">

    <div class="c-channel-bar">
      <div>
        <button @click="showModal = true">Create channel</button>
        <div v-if="showModal">
          <div>
            <label>Name:</label>
            <input type="text" v-model="newChannelName">
          </div>
          <div>
            <label>Password:</label>
            <input type="text" v-model="newChannelPassword">
          </div>
          <div>
            <label>Type:</label>
            <button :class="{ active: channelType === 'PUBLIC' }" @click="channelType = 'PUBLIC'">Public</button>
            <button :class="{ active: channelType === 'PRIVATE' }" @click="channelType = 'PRIVATE'">Private</button>
          </div>
          <button @click="createNewChannel()">Créer</button>
        </div>
      </div>

      <div class="c-channels">
        <div>Joined channels</div>
        <div v-for="channel in joinedChannels" :key="channel.id" class="channel-item">
          {{ channel.name }}
          <button @click="selectChannel(channel.id)" class="channel-button">SELECT</button>
          <button @click="leaveChannel(channel.id)" class="channel-button">LEAVE</button>
        </div>
      </div>


      <div class="c-channels">
        <div>Direct channels</div>
        <div v-for="channel in directChannels" :key="channel.id" class="channel-item">
          {{ channel.name }}
          <button @click="selectChannel(channel.id)" class="channel-button">SELECT</button>
        </div>
      </div>
		<div class="c-message-area">
			<div class="c-messages">
				<ChatMsg v-for="message in currentChannelMessages" :key="message.id" message="message"/>
			</div>


      <div class="c-channels">
        <div>Available channels</div>
        <div v-for="channel in availableChannels" :key="channel.id" class="channel-item">
          {{ channel.name }}
          <template v-if="channel.password">
            <input type="text" v-model="passwordInput[channel.id]" placeholder="Password">
            <button @click="joinChannel(channel.id, passwordInput[channel.id])" class="channel-button">Join</button>
          </template>
          <template v-else>
            <button @click="joinChannel(channel.id)" class="channel-button">Join</button>
          </template>
        </div>
      </div>


    </div>

    <div class="c-message-area">
      <div class="c-messages">
        <div>
          <p v-show="!hasCurrentChannel()">You are not in a channel</p>
        </div>
        <div class="c-msg" v-for="message in currentChannelMessages" :key="message.id">
          <div class="c-msg-sender">
            {{ message.userId }}
          </div>
          <div class="c-msg-content">
            {{ message.content }}
          </div>
        </div>
      </div>

      <div class="c-input-box">
        <form class="c-form" ref="msgBoxForm" @submit.prevent="sendMessage">
          <input class="c-form-input" type="text" v-model="newMessage">
          <button class="c-form-submit" type="submit">Send</button>
        </form>
      </div>
    </div>

  </div>
</template>

<style>

.active {
  background-color: #00FF00;
}

.c-chat {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 100%;
  width: 100%;
}

.c-channel-bar {
  flex: 4;
  overflow-x: hidden;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
}

.c-message-area {
  flex: 11;
  display: flex;
  flex-direction: column;

}


.c-channels {
  margin-bottom: 10px;
}

.channel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.c-messages {
  background-color: #400000;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
}

.c-input-box {
  display: flex;
  background-color: #004000;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding-top: 24px;
  padding-bottom: 24px;
}

.c-form {
  display: flex;
  width: 80%;
  height: 80%;
  flex-direction: row;
}

.c-form-input {
  flex: 8;
  word-wrap: normal;
  font-size: 150%;
}

.c-form-submit {
  flex: 1;
}

/* To be put in a component */
.c-msg {
  display: flex;
  flex-direction: row;
}

.c-msg-sender {
  flex: 1;
  background-color: #600000;
}

.c-msg-content {
  flex: 8;
  background-color: #006000;
}


</style>


