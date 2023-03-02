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
import {COMMANDS, getCommandByName, SOCKET_SERVER} from "@/consts";
import {AbstractCommand} from "@/commands/abstract.command";
import {store} from "@/stores/store";
import {Notyf} from "notyf";
import 'notyf/notyf.min.css';

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

    // SOCKET_SERVER.emit('getChannel', {
    //   channelId: 1,
    // })

    SOCKET_SERVER.emit('getChannel', {
      id: 1,
    })

    console.log('created');
  },
  computed: {
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

    SOCKET_SERVER.on('getChannelSuccess', (data) => {
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

    SOCKET_SERVER.on('channelError', (data) => {
      this.showNotification(data, 'error');
    });

    SOCKET_SERVER.on('channelSuccess', (data) => {
      this.showNotification(data, 'success');
    });

    SOCKET_SERVER.on('message', (data) => {
      const message = new Message(
          data.id,
          data.content,
          data.userId,
          data.date
      );

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
          command.emitCommand(command.getCommandData(1, commandArgs));
          return;
        }

        this.sendHelp();
        return;
      }

      SOCKET_SERVER.emit('sendMessage', {
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
