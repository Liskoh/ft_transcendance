<template>
  <div class="container">
    <div class="channels-column">
      <div class="channels">
        ----------------- Joined channels -----------------
        <div v-for="channel in joinedChannels" :key="channel.id" class="channel-item">
          {{ channel.name }}
          <button @click="selectChannel(channel.id)" class="leave-button">Leave</button>
        </div>
      </div>
      ----------------- Direct channels -----------------
      <div class="channels">
        <div v-for="channel in directChannels" :key="channel.id" class="channel-item">
          {{ channel.name }}
          <button @click="selectChannel(channel.id)" class="leave-button">Leave</button>
        </div>
      </div>
      <div class="channels">
        ----------------- Available channels -----------------
        <div v-for="channel in availableChannels" :key="channel.id" class="channel-item">
          {{ channel.name }}
          <button @click="selectChannel(channel.id)" class="leave-button">Join</button>
        </div>
      </div>
      <button @click="createChannel">Create Channel</button>
    </div>

      <div class="messages">
        <div v-for="message in currentChannelMessages" :key="message.id">
          {{ message.content }}
        </div>

        <form @submit.prevent="sendMessage">
          <input type="text" v-model="newMessage">
          <button type="submit">Send</button>
        </form>
      </div>
  </div>
</template>

<style>
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 100%;
}

.channels-column {
  flex-basis: 30%;
}

.messages-column {
  flex-basis: 70%;
}

.channels {
  margin-bottom: 10px;
}

.channel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.leave-button {
  margin-left: auto;
}
</style>


<script lang="ts">
import {mapGetters, mapMutations} from "vuex";
import {Message} from "@/models/message.model";
import {Channel} from "@/models/channel.model";
import {COMMANDS, getCommandByName} from "@/consts";
import {AbstractCommand} from "@/commands/abstract.command";
import {store} from "@/stores/store";
import {Notyf} from "notyf";
import 'notyf/notyf.min.css';
import io, {Socket} from "socket.io-client";

export default {
  name: "Chat",
  store,

  setup() {
    const notyf: Notyf = new Notyf({
      duration: 2500,
      position: {
        x: 'right',
        y: 'top'
      }
    });

    const showNotification = (message: string, type: 'success' | 'error'): void => {
      if (type === 'success') {
        notyf.success(message);
      } else {
        notyf.error(message);
      }
    };

    return {
      showNotification
    }
  },

  created() {
    console.log('created token ' + localStorage.getItem('token'));

    this.$store.commit('setChannelSocket', io('http://localhost:8000/channels', {
      extraHeaders: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }));

    this.getChannelSocket.emit('getChannels');
    console.log('get channels with success');
    this.getChannelSocket.emit('getChannel', {
      id: 1,
    })
    console.log('created');
  },
  beforeRouteLeave(to, from, next) {
    this.getChannelSocket.disconnect();
    next();
  },
  computed: {
    getChannelSocket() {
      return this.$store.getters.getChannelSocket;
    },
    setChannelSocket(socket) {
      this.$store.commit('setChannelSocket', socket);
    },

    // // ...mapGetters(["getCurrentChannelId"]),
    // ...mapGetters(["getChannelSocket"]),
    // ...mapMutations(["setChannelSocket"]),
    // ...mapGetters(["getCurrentChannel"]),
    // ...mapMutations(["setCurrentChannel"]),
    currentChannelMessages() {
      return [];
    },
    joinedChannels(): Channel[] {
      return this.$store.getters.getJoinedChannels;
    },
    availableChannels(): Channel[] {
      return this.$store.getters.getAvailableChannels;
    },
    directChannels(): Channel[] {
      return this.$store.getters.getDirectChannels;
    },
    createChannel() {
      this.getChannelSocket.emit('createChannel', {
        name: 'test',
      });
      // this.getChannelSocket.emit('getChannels');
    },
  },
  data() {
    return {
      newMessage: "",
    };
  },

  mounted() {

    this.getChannelSocket.on('getChannelSuccess', (data) => {
          const channel = new Channel(
              data.id,
              data.name,
              data.messages
          );

          console.log(channel);

          for (const message of channel.messages) {
            this.currentChannelMessages.push(message);
          }
          this.$forceUpdate();
        }
    );

    this.getChannelSocket.on('channelError', (data) => {
      this.showNotification(data, 'error');
    });

    this.getChannelSocket.on('channelSuccess', (data) => {
      this.showNotification(data, 'success');
    });

    this.getChannelSocket.on('channelInfo', (data) => {
      this.showNotification(data, 'info');
    });

    //channels data:
    this.getChannelSocket.on('availableChannels', (data) => {
      this.$store.commit('setAvailableChannels', data);
    });

    this.getChannelSocket.on('joinedChannels', (data) => {
      this.$store.commit('setJoinedChannels', data);
    });

    this.getChannelSocket.on('directChannels', (data) => {
      this.$store.commit('setDirectChannels', data);
    });


    this.getChannelSocket.on('message', (data) => {
      const message = new Message(
          data.id,
          data.content,
          data.userId,
          data.nickname,
          data.date
      );
      message.content = data.nickname + ': ' + message.content;
      this.currentChannelMessages.push(message);
      console.log(message);
      this.$forceUpdate();
    });

  },

  methods: {
    sendMessage() {
      if (!this.newMessage)
        return;

      const commandArray = this.newMessage.split(' ');
      const commandName = commandArray[0];

      if (commandName[0] === '/') {
        const commandArgs = commandArray.slice(1);
        const command = getCommandByName(commandName);
        // this.newMessage = "";
        if (command) {
          command.emitCommand(command.getCommandData(1, commandArgs), this.getChannelSocket);
          return;
        }

        this.sendHelp();
        return;
      }

      this.getChannelSocket.emit('sendMessage', {
        channelId: 1,
        text: this.newMessage,
      });

      // this.newMessage = "";

    },

    selectChannel(channelId: number) {
      console.log('select channel ' + channelId)
      const channels: Channel[] = this.joinedChannels.concat(this.availableChannels).concat(this.directChannels);
      this.$store.commit('setCurrentChannel', channels.find(channel => channel.id === channelId));
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
