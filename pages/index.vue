<template>
<div class="flex flex-col m-6 items-center justify-center">
<div class="flex flex-row justify-between border-l border-t p-2 border-r border-green-800 wcalc">
<div><span class="text-slate-500"> username </span><strong>{{ username }}</strong></div>
<div v-if="userLocation" class="text-xs text-slate-500">[{{ userLocation.latitude }}° {{ userLocation.longitude }}°]</div>
</div>
    <div class="messages wcalc overflow-y-scroll min-h-20 p-2 bg-slate-800 border-l border-b border-r border-green-800" ref="messageContainer">
      <div v-for="msg in messages" :key="msg" class="text-green-300">
        <div v-if="msg.isYou" class="text-right text-blue-200">{{ msg.text }}</div>
        <div v-if="!msg.isYou" class="text-left">{{ msg.text }} </div>
      </div>
    </div>

    <div class="flex flex-row wcalc">
      <textarea v-model="input" @keyup.enter="sendMessage" placeholder="Type a message..." class="w-full p-2 rounded-l outline-none text-lg"></textarea>
      <button @click="sendMessage" class="bg-slate-800 text-white p-2">send</button>
    </div>
</div>
</template>

<style scoped>
.messages {
  height: calc(100vh - 17em);
}

.wcalc {
  width: calc(100vw - 2em);
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { generateRandomName } from '@/utils/randomNameGen';
interface Message {
    isYou: boolean;
    text: string;
    timestamp: number;
}

const errorMessage = ref(null);
const userLocation = ref({latitude: 0, longitude: 0}); // Initial dummy value, will be replaced
const username = ref(generateRandomName());
const messages = ref<Message[]>([]);
const input = ref('');
const messageContainer = ref(null);

let socket: WebSocket | null = null;

function initializeWebSocket() {
    let chatServerHost = window.location.protocol === "https:" ? "wss://geochat-bridge-quqoh4a5iq-ew.a.run.app/chat" : "ws://localhost:8081/chat";
    socket = new WebSocket(chatServerHost);

    socket.onopen = function(event) {
        console.log('Connected to WebSocket');
        // Send location immediately upon connection
        if (socket) {
            socket.send(JSON.stringify({
                type: 'location',
                latitude: userLocation.value.latitude,
                longitude: userLocation.value.longitude
            }));
        }
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
}

onMounted(() => {
          if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation.value = {
                    latitude: position.coords.latitude.toFixed(1),
                    longitude: position.coords.longitude.toFixed(1)
                };
                // Initialize WebSocket connection after getting location
                initializeWebSocket();
            },
            error => {
                errorMessage.value = `Error getting user location: ${error.message}`;
                // Consider initializing WebSocket with default location or handling error
            }
        );
    } else {
        errorMessage.value = 'Geolocation is not supported by this browser.';
        // Consider initializing WebSocket with default location or handling error
    }
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
                  socket.send(JSON.stringify({
                type: 'chat',
                content: `${username.value}: ${input.value}`,
            }));
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
