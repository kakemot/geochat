<template>
<div class="flex flex-col m-8 mb-16 items-center justify-center">
    <div class="overflow-y-auto w-screen h-4/5 p-2 bg-slate-800 rounded" ref="messageContainer">
      <div v-for="msg in messages" :key="msg" class="text-green-300">
        <div v-if="msg.isYou" class="text-right">{{ msg.text }}</div>
        <div v-if="!msg.isYou" class="text-left">{{ msg.text }} </div>
      </div>
    </div>

    <div class="flex flex-row">
      <input type="text" v-model="input" @keyup.enter="sendMessage" placeholder="Type a message..." class="flex-1 p-2 rounded-l outline-none">
      <button @click="sendMessage" class="bg-blue-500 text-white p-2 rounded-r">Send</button>
    </div>
</div>

</template>

<script setup lang="ts">
interface Message {
    isYou: boolean;
    text: string;
    timestamp: number;
}

const messages = ref<Message[]>([]);
const input = ref('');
const messageContainer = ref(null);

let socket: any = null;

onMounted(() => {
  let wsProtocol = window.location.protocol === "https:" ? "wss:" : "wss:";
  socket = new WebSocket(`wss://geochat-bridge-quqoh4a5iq-ew.a.run.app`);
  socket.onopen = function(event: any) {
    console.log('Connected to WebSocket');
  };

  socket.onmessage = function(event: any) {
    let newMessage = {
        isYou: false,
        text: event.data,
        timestamp: 12345
    }

    messages.value.push(newMessage);
  };

  socket.onclose = function(event: any) {
    console.log('Disconnected from WebSocket');
  };

  socket.onerror = function(error: any) {
    console.error('WebSocket Error:', error);
  };
});

onUnmounted(() => {
  if (socket !== null) {
    socket.close();
  }
});

function sendMessage() {
  if (socket && input.value.trim() !== '') {
    socket.send(input.value);
        let newMessage = {
        isYou: true,
        text: input.value,
        timestamp: 12345
    }

    messages.value.push(newMessage);
    input.value = '';
        nextTick(() => {
      scrollToBottom();
    });
  }
}

const scrollToBottom = () => {
};
</script>
