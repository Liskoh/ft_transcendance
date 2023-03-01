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

export default {
  computed: {
    // ...mapGetters(["getCurrentChannelId"]),
    ...mapGetters(["getChannelSocket"]),
    ...mapMutations(["setChannelSocket"]),
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
        this.newMessage = "";
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

      this.$notify({
        title: "Important message",
        text: "Hello user!",
        type: "success",
        duration: 5000,
      });
      this.newMessage = "";

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
