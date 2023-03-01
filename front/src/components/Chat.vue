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
import {SOCKET_SERVER} from "@/consts";

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
      if (!this.newMessage) return;

      // this.currentChannelMessages.push({
      //   id: new Date().getTime(),
      //   content: this.newMessage,
      // });

      SOCKET_SERVER.emit('sendMessage', {
        channelId: 1,
        text: this.newMessage,
      });

      this.newMessage = "";
    },
  },
};
</script>
