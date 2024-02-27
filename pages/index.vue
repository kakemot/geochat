<template>
<div class="flex flex-col m-6 items-center justify-center">
<div class="flex flex-row justify-between border-l border-t p-2 border-r border-green-800 wcalc">
<div><span class="text-slate-500"> username </span><strong>{{ username }}</strong></div>
<div v-if="userLocation" class="text-xs text-slate-500">[{{ userLocation.city }}]</div>
</div>
    <div v-if="connected" class="messages wcalc overflow-y-scroll min-h-20 p-2 bg-slate-800 border-l border-b border-r border-green-800" ref="messageContainer">
      <div v-for="msg in messages" :key="msg" class="text-green-300">
        <div v-if="msg.username == username" class="text-right text-blue-200">{{ msg.text }}</div>
        <div v-if="msg.username != username" class="text-left">{{msg.username}}: {{ msg.text }} </div>
      </div>
    </div>

    <div v-else class="w-full text-center">
      Connecting...
          <Icon class="animate-spin" name="uil:spinner-alt"/>
          <p v-if="!disconnected">Connection will happen when device location is found. You must allow location services on your device.</p>
          <p v-if="disconnected">You session ended abruptly or perhaps very long ago. Refresh the page to reconnect.</p>
          <UButton @click="refresh">Refresh page</UButton>
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
    username: string;
    timestamp: number;
}

interface ReverseGeocodeResponse {
  city: string;
}

const errorMessage = ref(null);
const userLocation = ref({latitude: 0, longitude: 0, city: 'Antarctica'}); // Initial dummy value, will be replaced

    const username = ref('');
    // Initialize the cookie with 'username' key. The useCookie composable handles the reactivity.
  const cookie = useCookie('username');
    // Check if the cookie has a value. If not, generate a new random name and set it as the cookie's value.
    if (!cookie.value) { // Correctly check the value of the reactive reference
      cookie.value = generateRandomName(); // Set the cookie's value
    }

    // Bind the cookie's value to the username ref. This will update username whenever the cookie changes.
    username.value = cookie.value;


const messages = ref<Message[]>([]);
const input = ref('');
const messageContainer = ref(null);
const connected = ref(false);
const disconnected = ref(false);

let socket: WebSocket | null = null;

function refresh() {
  location.reload();
}

function initializeWebSocket() {
    let chatServerHost = window.location.protocol === "https:" ? "wss://geochat-bridge-quqoh4a5iq-ew.a.run.app/chat" : "ws://localhost:8081/chat";
    socket = new WebSocket(chatServerHost);

    socket.onopen = function(event) {
        console.log('Connected to WebSocket');
        connected.value = true;
        // Send location immediately upon connection
        if (socket) {
            socket.send(JSON.stringify({
                type: 'location',
                latitude: userLocation.value.latitude,
                longitude: userLocation.value.longitude,
                city: userLocation.city,
                username: username.value
            }));
        }
    };
        socket.onmessage = function(event: MessageEvent) {
        if (event.data instanceof Blob) {
            // Convert Blob to text
            const reader = new FileReader();
            reader.onload = function() {
                const text = reader.result as string;
                const obj = JSON.parse(text);
                let isYou = event.data.includes(username.value);
                     console.log(obj.content);
                addMessage(isYou, obj.content, obj.username );
            };
            reader.readAsText(event.data);
        } else {
          const obj = JSON.parse(event.data);
            let isYou = event.data.username == username.value;
            addMessage(isYou, obj.content, obj.username);
        }
    };

    socket.onclose = function(event: CloseEvent) {
        connected.value = false;
        disconnected.value = true;
        console.log('Disconnected from WebSocket');
    };

    socket.onerror = function(error: Event) {
        console.error('WebSocket Error:', error);
    };
}

async function fetchCityByCoordinates(latitude: number, longitude: number): Promise<string> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: ReverseGeocodeResponse = await response.json();
    return data.city;
  } catch (error) {
    console.error('Failed to fetch city:', error);
    throw error; // Rethrow the error if you want to handle it outside this function
  }
}

onMounted(() => {
          if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async position => {
                userLocation.value = {
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6),
                    city: await fetchCityByCoordinates(position.coords.latitude, position.coords.longitude),
                    username: username.value
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

function addMessage(isYou: boolean, text: string, user: string) {
    const newMessage: Message = {
        isYou,
        text,
        username: user,
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
                content: `${input.value}`,
                username: username.value
            }));
        addMessage(true, input.value, username.value);
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
