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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

interface Message {
    isYou: boolean;
    text: string;
    timestamp: number;
}

const messages = ref<Message[]>([]);
const input = ref('');
const messageContainer = ref(null);

let socket: WebSocket | null = null;

onMounted(() => {
    let wsProtocol = window.location.protocol === "https:" ? "wss:" : "wss:";
    socket = new WebSocket(`wss://geochat-bridge-quqoh4a5iq-ew.a.run.app/chat`);
    
    socket.onopen = function(event: Event) {
        console.log('Connected to WebSocket');
    };

    socket.onmessage = function(event: MessageEvent) {
        if (event.data instanceof Blob) {
            // Convert Blob to text
            const reader = new FileReader();
            reader.onload = function() {
                const text = reader.result as string;
                addMessage(false, text);
            };
            reader.readAsText(event.data);
        } else {
            // Data is already text
            addMessage(false, event.data);
        }
    };

    socket.onclose = function(event: CloseEvent) {
        console.log('Disconnected from WebSocket');
    };

    socket.onerror = function(error: Event) {
        console.error('WebSocket Error:', error);
    };
});

onUnmounted(() => {
    if (socket !== null) {
        socket.close();
    }
});

function addMessage(isYou: boolean, text: string) {
    const newMessage: Message = {
        isYou,
        text,
        timestamp: Date.now() // Use the current timestamp
    };
    messages.value.push(newMessage);
    nextTick(() => {
        scrollToBottom();
    });
}

function sendMessage() {
    if (socket && input.value.trim() !== '') {
        socket.send(input.value);
        addMessage(true, input.value);
        input.value = '';
    }
}

const scrollToBottom = () => {
    // Implementation to scroll to the bottom of your message container
    if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
};
</script>
