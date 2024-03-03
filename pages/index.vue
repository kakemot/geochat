<template>
  <div class="flex flex-col items-center justify-center overflow-hidden w-full">
    <div
      class="flex flex-row justify-between border-l border-t p-2 border-r border-green-800 wcalc abs bg-slate-900"
    >
      <div>
        <span class="text-slate-500"> username </span
        ><strong class="text-slate-50">{{ username }}</strong>
      </div>
      <div v-if="userLocation" class="text-xs text-slate-500 w-20">
        [{{ userLocation.city }}][{{ userLocation.locality }}]
      </div>
    </div>
    <div
      v-if="connected"
      class="messages wcalc mt-12 p-2 pb-20 bg-slate-800 border-l border-b border-r border-green-800"
      ref="messageContainer"
    >
      <div v-for="msg in messages" :key="msg" class="text-green-300 mb-4">
        <div v-if="msg.username == username" class="text-left text-blue-200">
          <span class="block p-0 text-xs/[10px] text-slate-400"
            >[{{ msg.locality }}]
            <span class="text-slate-300">{{ msg.username }}</span>
            {{ formatDate(msg.timestamp) }}
          </span>
          {{ msg.text }}
        </div>
        <div v-if="msg.username != username" class="text-left">
          <span class="block p-0 text-xs/[10px] text-slate-400">
            [{{ msg.locality }}]
            <span class="text-slate-300">{{ msg.username }}</span>
            {{ formatDate(msg.timestamp) }}
          </span>
          {{ msg.text }}
        </div>
      </div>
    </div>

    <div v-else class="w-full text-center mt-20">
      Connecting...
      <Icon class="animate-spin" name="uil:spinner-alt" />
      <p v-if="!disconnected">
        Connection will happen when device location is found. You must allow
        location services on your device.
      </p>
      <p v-if="disconnected">
        You session ended abruptly. Trying reconnect. Refresh the page to
        reconnect immediately.
      </p>
      <UButton @click="refresh">Refresh page</UButton>
    </div>

    <div class="flex flex-row w-full textfield abs-bottom">
      <textarea
        v-model="input"
        @keyup.enter="sendMessage"
        placeholder="Type a message..."
        class="w-full p-2 outline-none border border-slate-400 bg-slate-900 rounded-none text-lg"
      ></textarea>
      <button :disabled="disconnected" @click="sendMessage" class="bg-green-800 w-16 disabled:bg-gray-700 disabled:text-gray-400 text-white border border-slate-400 p-2 hover:bg-orange-300">
        <Icon size="20" name="uil:message" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.wcalc {
  width: 100vw;
}

.abs {
  position: absolute;
  top: 0px;
}

.messages {
  height: calc(100vh - 10vh); /* Subtract the height of the .abs-bottom container from the viewport height */
  overflow-y: auto; /* Add scroll to the messages container if content overflows */
}

.abs-bottom {
  height: 10vh;
  position: absolute;
  bottom: 0px;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { generateRandomName } from "@/utils/randomNameGen";
interface Message {
  isYou: boolean;
  text: string;
  username: string;
  timestamp: number;
  locality: string;
}

interface ReverseGeocodeResponse {
  city: string;
  locality: string;
}

const errorMessage = ref(null);
const userLocation = ref({ latitude: 0, longitude: 0, city: "Antarctica" }); // Initial dummy value, will be replaced
const locResult = ref<ReverseGeocodeResponse>();
const username = ref("");
// Initialize the cookie with 'username' key. The useCookie composable handles the reactivity.
const cookie = useCookie("username");
if (!useCookie("city").value) {
  useCookie("city").value = "Antarctica";
}
// Check if the cookie has a value. If not, generate a new random name and set it as the cookie's value.
if (!cookie.value) {
  // Correctly check the value of the reactive reference
  cookie.value = generateRandomName(); // Set the cookie's value
}

// Bind the cookie's value to the username ref. This will update username whenever the cookie changes.
username.value = cookie.value;

const messages = ref<Message[]>([]);
const input = ref("");
const messageContainer = ref(null);
const connected = ref(false);
const disconnected = ref(false);

let socket: WebSocket | null = null;

function refresh() {
  location.reload();
}

function initializeWebSocket() {
  let chatServerHost =
    window.location.protocol === "https:"
      ? "wss://geochat-bridge.onrender.com/chat"
      : "ws://localhost:8081/chat";
  socket = new WebSocket(chatServerHost);

  socket.onopen = function (event) {
    console.log("Connected to WebSocket");
    disconnected.value = false;
    connected.value = true;
    // Send location immediately upon connection
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "location",
          city: useCookie("city").value,
          username: username.value,
          locality: userLocation.locality,
        })
      );
    }
  };
  socket.onmessage = function (event: MessageEvent) {
    if (event.data instanceof Blob) {
      // Convert Blob to text
      const reader = new FileReader();
      reader.onload = function () {
        const text = reader.result as string;
        const obj = JSON.parse(text);
        let isYou = event.data.includes(username.value);
        console.log(obj.content);
        addMessage(
          isYou,
          obj.content,
          obj.username,
          obj.locality,
          obj.timestamp
        );
      };
      reader.readAsText(event.data);
    } else {
      const obj = JSON.parse(event.data);
      let isYou = event.data.username == username.value;
      addMessage(isYou, obj.content, obj.username, obj.locality, obj.timestamp);
    }
  };

  socket.onclose = function (event: CloseEvent) {
    connected.value = false;
    disconnected.value = true;
    console.log("Disconnected from WebSocket");
  };

  socket.onerror = function (error: Event) {
    console.error("WebSocket Error:", error);
  };
}

async function fetchCityByCoordinates(
  latitude: number,
  longitude: number
): Promise<any> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data: ReverseGeocodeResponse = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Failed to fetch city:", error);
    throw error; // Rethrow the error if you want to handle it outside this function
  }
}

onMounted(() => {
  userLocation.value = {
    city: useCookie("city") ?? "Antarctica",
    locality: "void",
    username: username,
  };

  initializeWebSocket();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        locResult.value = await fetchCityByCoordinates(
          position.coords.latitude,
          position.coords.longitude
        );
        userLocation.value = {
          city: locResult.value.city,
          locality: locResult.value.locality ?? "void",
          username: username.value,
        };
        useCookie("city").value = locResult.value.city;
      },
      (error) => {
        errorMessage.value = `Error getting user location: ${error.message}`;
        // Consider initializing WebSocket with default location or handling error
      }
    );
  } else {
    errorMessage.value = "Geolocation is not supported by this browser.";
    // Consider initializing WebSocket with default location or handling error
  }
});

function addMessage(
  isYou: boolean,
  text: string,
  user: string,
  local: string,
  timestamp: number
) {
  const newMessage: Message = {
    isYou,
    text,
    username: user,
    timestamp: timestamp,
    locality: local,
  };
  console.log(newMessage);
  messages.value.push(newMessage);
  nextTick(() => {
    scrollToBottom();
  });
}

function sendMessage() {
  if (socket && input.value.trim() !== "") {
    socket.send(
      JSON.stringify({
        type: "chat",
        content: `${input.value}`,
        username: username.value,
        locality: userLocation.value.locality,
        timestamp: Date.now(),
      })
    );
    addMessage(
      true,
      input.value,
      username.value,
      userLocation.value.locality,
      Date.now()
    );
    input.value = "";
  }
}

const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

function formatDate(millis: string): string {
  const timestamp = new Date(parseInt(millis));
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const padNumber = (num: number) => num.toString().padStart(2, "0");
  const dayOfWeek = days[timestamp.getDay()]; // getDay() returns 0 (Sunday) to 6 (Saturday)
  const hours = padNumber(timestamp.getHours());
  const minutes = padNumber(timestamp.getMinutes());
  return `${dayOfWeek} ${hours}:${minutes}`;
}

watch(disconnected, (newValue, oldValue) => {
  if (newValue) {
    setTimeout(initializeWebSocket, 1000);
  }
});

watch(
  () => userLocation.value.city,
  (newCity, oldCity) => {
    // This callback will be executed on changes to the city property.
    // Update the cookie value here.
    if (newCity != "Antarctica") {
      useCookie("city").value = newCity;
    }
  },
  {
    deep: true, // This option is not necessary for primitive types like strings but is kept for completeness.
    immediate: true, // Trigger immediately with the current value
  }
);
</script>
