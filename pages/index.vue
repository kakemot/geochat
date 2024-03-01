<template>
<div class="flex flex-col m-6 items-center justify-center">
<div class="flex flex-row justify-between border-l border-t p-2 border-r border-green-800 wcalc">
<div><span class="text-slate-500"> username </span><strong class="text-slate-50">{{ username }}</strong></div>
<div v-if="userLocation" class="text-xs text-slate-500">[{{ userLocation.city }}][{{userLocation.locality}}]</div>
</div>
    <div class="messages wcalc overflow-y-scroll min-h-20 p-2 bg-slate-800 border-l border-b border-r border-green-800" ref="messageContainer">
      <div v-for="msg in messages" :key="msg" class="text-green-300 mb-4">
        <div v-if="msg.username == username" class="text-left text-blue-200"><span class="block p-0 text-xs/[10px] text-slate-400">[{{msg.locality}}] {{msg.username}}:</span> {{ msg.content }} </div>
        <div v-if="msg.username != username" class="text-left"><span class="block p-0 text-xs/[10px] text-slate-400">[{{msg.locality}}] {{msg.username}}:</span> {{ msg.content }} </div>
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
import { ref, onMounted, watch } from 'vue';
import { generateRandomName } from '@/utils/randomNameGen';

interface Message {
    username: string;
    city: string;
    locality: string;
    content: string;
    time: string;
}

interface ReverseGeocodeResponse {
  city: string;
  locality: string;
}

const connected = ref(true);
const errorMessage = ref<string | null>(null);
const userLocation = ref<{ latitude: string; longitude: string; city: string; locality?: string }>({ latitude: '0', longitude: '0', city: 'The Void' });
const locResult = ref<ReverseGeocodeResponse | null>(null);
const username = ref('');
const cookie = useCookie('username');
const triedLocation = ref(false);
if (!cookie.value) {
  cookie.value = generateRandomName();
}
username.value = cookie.value;

const messages = ref<Message[]>([]);
const input = ref('');
const messageContainer = ref<HTMLElement | null>(null);
let lastChecked = new Date('2018-05-05').toISOString();
const API_BASE_URL = 'https://geochat-api-quqoh4a5iq-ew.a.run.app';

const fetchMessages = async (city: string) => {
  try {
    const result = await fetch(`${API_BASE_URL}/messages?lastChecked=${lastChecked}&city=${city}`);
    if (!result.ok) {
      throw new Error('Failed to fetch messages');
    }
    const data = await result.json();
    lastChecked = new Date().toISOString();;
    // Assuming the API returns an array of messages in the expected format
    // Clear the current messages array
    // Push each fetched message into the messages array
    data.forEach((messageData: any) => {
      const message: Message = {
        username: messageData.username,
        city: messageData.city,
        locality: messageData.locality,
        content: messageData.content,
        time: messageData.time
      };
      messages.value.push(message);
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

function sendMessage() {    
  if (input.value.trim() !== '') {
    const messageData = {
      username: username.value,
      city: userLocation.value.city,
      locality: locResult.value?.locality || '',
      content: input.value,
      time: new Date().toISOString(),
    };

    fetch(`${API_BASE_URL}/postMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    })
      .then(response => {
        if (response.ok) {
          const msg: Message = {
          username: username.value,
          city: userLocation.value.city,
          locality: userLocation.value.locality,
          content: input.value.ToString(),
          time: new Date().toISOString()
      };
        messages.value.push(msg);
        input.value = '';
        }

        if (!response.ok) {
          const msg: Message = {
          username: 'Z̶̧̬̙̞͑̏̇̋Ḧ̵̳̠̩͎́͒o̸̞̗͍̫̾̌̒͠r̶̳̹͋̀g̴̣̘̪͆̏̏̅',
          city: 'Planet 68',
          locality: 'Penal Colony District 48',
          content: 'ERROR: Error caused wormhole. Explanation: not good',
          time: new Date().toISOString()
      };
        messages.value.push(msg);
        }
      })
      .catch(error => console.error('Failed to send message:', error));
  }
}

onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async position => {
        const data = await fetchCityByCoordinates(position.coords.latitude, position.coords.longitude);
        locResult.value = data;
        userLocation.value = {
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          city: data.city,
          locality: data.locality,
        };
        fetchMessages(data.city);
      },
      error => {
        triedLocation.value = true;
        errorMessage.value = `Error getting user location: ${error.message}`;
      }
    );
  } else {
    triedLocation.value = true;
    errorMessage.value = 'Geolocation is not supported by this browser.';
  }
});

async function fetchCityByCoordinates(latitude: number, longitude: number): Promise<any> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: ReverseGeocodeResponse = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Failed to fetch city:', error);
    throw error; // Rethrow the error if you want to handle it outside this function
  }
}

// Watch userLocation for changes and refetch messages accordingly
watch(userLocation, (newValue, oldValue) => {
  if (newValue.city !== oldValue.city) {
    messages.value = []
    lastChecked = new Date('2018-05-05').toISOString();
    fetchMessages(newValue.city);
  }
});

// Add a method to scroll to the bottom of the message container
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

if (userLocation.city = "The Void" && triedLocation) {
  await fetchMessages(userLocation.city);
  const msg: Message = {
        username: 'Cthulhu',
        city: 'void',
        locality: 'null',
        content: 'Greetings, you are in the void, the location-less place. You are currently not allowing GeoSPK to access your location. You can only talk to other wanderers of the dark until you do.',
        time: new Date().toISOString()
      };
      messages.value.push(msg);
}

      const msg2: Message = {
        username: 'The Creator',
        city: 'void',
        locality: 'null',
        content: 'NOTE: Lots of things are changing and the chat might not work properly for while',
        time: new Date().toISOString()
      };
      messages.value.push(msg2);

setTimeout(() => fetchMessages(userLocation.city), 7 * 1000);  
</script>
