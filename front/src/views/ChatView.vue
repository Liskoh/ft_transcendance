<script setup lang="ts">

import ChatMsg from "@/components/ChatMessage.vue"

</script>

<script lang="ts">
import { mapGetters, mapMutations, mapState } from "vuex";
import { Message } from "@/models/message.model";
import { Channel } from "@/models/channel.model";
import { COMMANDS, getCommandByName } from "@/consts";
import { AbstractCommand } from "@/commands/abstract.command";
import { store } from "@/stores/store";
import { Notyf } from "notyf";
import 'notyf/notyf.min.css';
import io, { Socket } from "socket.io-client";

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
		joinedChannels(): Channel[] {
			return this.$store.getters.getJoinedChannels;
		},
		availableChannels(): Channel[] {
			return this.$store.getters.getAvailableChannels;
		},
		directChannels(): Channel[] {
			return this.$store.getters.getDirectChannels;
		},
		channelMessages(): Message[] {
			return this.$store.getters.getCurrentChannel.messages;
		},
		createChannel() {
			const randomName = Math.random().toString(36).substring(7);
			this.getChannelSocket.emit('createChannel', {
				name: randomName,
			});
			this.getChannelSocket.emit('getChannels');
			console.log('create channel with success');
		},
	},
	data() {
		return {
			newMessage: "",
			currentChannelMessages() {
				return [];
			},
		};
	},

	mounted() {
		// mapState(['joinedChannels', 'availableChannels', 'directChannels']);

		this.getChannelSocket.on('getChannelSuccess', (data) => {
			const channel = data;
			this.$store.commit('setCurrentChannel', channel);

			const channelFromStore = this.$store.getters.getCurrentChannel;
			console.log('channel from store ' + channelFromStore.name);
			if (channelFromStore)
				this.currentChannelMessages = channelFromStore.messages;


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
				data.content,
				data.userId,
				data.nickname,
				data.date
			);
			// message.content = data.nickname + ': ' + message.content;
			this.currentChannelMessages.push(message);
			console.log(message);
			this.$forceUpdate();
		});

	},

	methods: {
		joinChannel(id: number, password?: string) {
			this.getChannelSocket.emit('joinChannel', {
				id: id,
				password: password
			});
			this.getChannelSocket.emit('getChannels');
			console.log('join channel with success');
		},

		selectChannel(channelId: number) {
			console.log('select channel ' + channelId);
			this.getChannelSocket.emit('getChannel', {
				id: channelId,
			});
			this.joinChannel(channelId);
		},
		sendMessage() {
			if (!this.newMessage)
				return;
			
			const msgContent :string = this.newMessage;
			this.$refs.msgBoxForm.reset();

			const currentChannel = this.$store.getters.getCurrentChannel;
			if (!currentChannel) {
				this.showNotification('You are not in any channel', 'error');
				return;
			}

			const commandArray = msgContent.split(' ');
			const commandName = commandArray[0];

			if (commandName[0] === '/') {
				const commandArgs = commandArray.slice(1);
				const command = getCommandByName(commandName);
				// msgContent = "";
				if (command) {
					command.emitCommand(command.getCommandData(currentChannel.id, commandArgs), this.getChannelSocket);
					return;
				}

				this.sendHelp();
				return;
			}

			this.getChannelSocket.emit('sendMessage', {
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
						'System',
						new Date()
					)
				);
			});
		},

		testMsg() : Message {
			return (new Message(1, 'aled', 1, 'Myresa', new Date()));
		},

		testMsg2() : Message {

			let cmdStr : string = '';
			COMMANDS.forEach(command => {cmdStr += command.getCommandHelp() + '\n';});

			return (new Message(
						-1,
						cmdStr,
						-1,
						'System',
						new Date()
					));
		}
	},
};

</script>

<template>
	<div class="c-chat">

		<div class="c-channel-bar">
			<button @click="createChannel">Create Channel</button>

			<div class="c-channels">
				<div>Joined channels</div>
				<div v-for="channel in joinedChannels" :key="channel.id" class="channel-item">
					{{ channel.name }}
					<button @click="selectChannel(channel.id)" class="leave-button">SELECT</button>
				</div>
			</div>

			<div class="c-channels">
				<div>Direct channels</div>
				<div v-for="channel in directChannels" :key="channel.id" class="channel-item">
					{{ channel.name }}
					<button @click="selectChannel(channel.id)" class="leave-button">SELECT</button>
				</div>
			</div>

			<div class="c-channels">
				<div>Available channels</div>
				<div v-for="channel in availableChannels" :key="channel.id" class="channel-item">
					{{ channel.name }}
					<button @click="selectChannel(channel.id)" class="leave-button">SELECT</button>
				</div>
			</div>

		</div>

		<div class="c-message-area">
			<div class="c-messages">
				<ChatMsg v-for="message in currentChannelMessages" :key="message.id" message="message"/>
				<ChatMsg :message="testMsg()"/>
				<ChatMsg :message="testMsg()"/>
				<ChatMsg :message="testMsg()"/>
				<ChatMsg :message="testMsg2()"/>
				<ChatMsg :message="testMsg()"/>
				<ChatMsg :message="testMsg()"/>
				<ChatMsg :message="testMsg()"/>
				<ChatMsg :message="testMsg()"/>
				<ChatMsg :message="testMsg2()"/>
				<ChatMsg :message="testMsg2()"/>
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

.c-chat {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	height: 100%;
	width: 100%;
}

.c-channel-bar {
	flex: 3;
	overflow-x: hidden;
    overflow-y: auto;
	display: flex;
	flex-direction: column;
	align-items: center;
	border-right: 8px solid var(--color-border-header);
	max-height: 100%;
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
	/* height: 100%; */
	overflow-x: hidden;
	overflow-y: auto;
	max-height: 90%;
	height: 90%;
}

.c-input-box {
	display: flex;
	background-color: #004000;
	width: 100%;
	align-items: center;
	justify-content: center;
	padding-top: 24px;
	padding-bottom: 24px;
	height: 10%;
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

</style>


