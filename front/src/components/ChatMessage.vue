<script setup lang="ts">
import type { Message } from "@/models/message.model";
defineProps<{
	message: Message
}>()

function formatDate(d :Date) : string
{
	let split = d.toTimeString().split(' ')[0];
	return split;
}

</script>

<template>
	<div class="c-msg">
		<img class="c-msg-avatar" width="48" height="48" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Transgender_Pride_flag.svg/512px-Transgender_Pride_flag.svg.png" alt="message.nickname"/>

		<div class="c-msg-textarea">
			<div class="c-msg-header">
				<div class="c-msg-sender">
					{{ message.nickname }} 
				</div>
				<div class="c-msg-timestamp">
					{{ formatDate(message.date) }} 
				</div>
			</div>
			<div class="c-msg-content">
				{{ message.content }}
			</div>
		</div>
	</div>
</template>

<style>
.c-msg {
	display: flex;
	flex-direction: row;
}

.c-msg-avatar {
	border-radius: 50%;
	padding: 8px;
	width: 64px;
	height: 64px;
}

.c-msg-textarea {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.c-msg-header {
	display: flex;
	flex-direction: row;
	align-items: flex-end;
}

.c-msg-sender {
	font-size: 125%;
	padding-right: 12px;
}

.c-msg-timestamp {
	font-size: 70%;
	padding-bottom: 4px;
	color: var(--color-text-soft);
}

.c-msg-content {
	white-space: pre-line;
	margin-bottom: 4px;
	margin-right: 8px;
	border-bottom: 1px solid var(--color-chat-separator);

}
</style>