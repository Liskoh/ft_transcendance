<template>
  <div>
    <h1>Chat</h1>

    <div>
      <div v-for="message in currentChannelMessages" :key="message.id">
        {{ message.content }}
      </div>
    </div>

    <form @submit.prevent="sendMessage">
      <input type="text" v-model="newMessage" placeholder="Type your message...">
      <button type="submit">Send</button>
    </form>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from "vuex";
import { Message } from "@/models/message.model";
import { Channel } from "@/models/channel.model";
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
    const notyf = new Notyf({
      duration: 2500,
      position: {
        x: 'right',
        y: 'top'
      }
    });

    const showNotification = (message, type) => {
      if (type === 'success')
        notyf.success(message);
      else
        notyf.error(message);
    }

    return {
      showNotification
    }
  },

  created() {
    console.log('created token ' + localStorage.getItem('token'));
    // this.$store.commit('setChannelSocket', io('http://localhost:8000/channels'), {
    //       // transportOptions: {
    //       //   polling: {
    //           extraHeaders: {Authorization: 'Bearer ' + localStorage.getItem('token')}
    //         // },
    //       // }
    //     }
    // );

    this.$store.commit('setChannelSocket', io('http://localhost:8000/channels', {
      extraHeaders: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }));


    console.log(localStorage.getItem('token'));
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
