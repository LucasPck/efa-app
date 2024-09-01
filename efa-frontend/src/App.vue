<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';

const store = useAuthStore();
const isConnected = ref(false);
const user = ref(null);

async function isLoggedIn() {
  if (store.token) {
    console.log("Connected")
    isConnected.value = true;
    await fetchUserData();
  } else {
    console.log("Disconnected")
    isConnected.value = false;
    router.push('/login');
  }
}

async function fetchUserData() {
  try {
    const response = await fetch('http://localhost:3000/auth', {
      headers: {
        'Authorization': `Bearer ${store.token}`
      }
    });
    if (response.ok) {
      user.value = await response.json();
    } else {
      throw new Error('Failed to fetch user data');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    handleLogout();
  }
}

function handleLogout() {
  store.logout();
  isConnected.value = false;
  router.push('/login');
}

function copyUserTag() {
  if (user.value) {
    const userId = user.value.id;
    const userTag = `${user.value.nametag}#${userId.slice(-5)}`;
    navigator.clipboard.writeText(userTag)
      .then(() => alert('Tag copié dans le presse-papier !'))
      .catch(err => console.error('Erreur lors de la copie :', err));
  }
}

store.$subscribe((mutation, state) => {
  isConnected.value = !!state.token;
  if (state.token) {
    fetchUserData()
  }
})

onMounted(() => {
  isLoggedIn();
});
</script>

<template>
  <div class="min-h-screen bg-my-black">
    <header class="bg-my-grey-800 shadow-lg">
      <nav v-if="isConnected" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <RouterLink v-if="isConnected" to="/" class="text-my-white hover:text-pink-500 transition">Menu principal</RouterLink>
          <RouterLink v-if="isConnected" to="/team" class="text-my-white hover:text-pink-500 transition">Équipes</RouterLink>
        </div>
        <div class="flex items-center space-x-4">
          <button v-if="isConnected" @click="copyUserTag" class="bg-my-grey-600 text-my-white px-4 py-2 rounded hover:bg-gray-600 transition">
            Récupérer mon id
          </button>
          <button v-if="isConnected" @click="handleLogout" class="bg-my-pink-400 text-my-white px-4 py-2 rounded hover:bg-my-pink-600 transition">
            Déconnexion
          </button>
        </div>
      </nav>
    </header>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
  </div>
</template>

<style>
body {
  @apply bg-my-black text-my-white;
}

.router-link-active {
  @apply text-pink-500;
}
</style>