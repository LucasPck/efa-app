<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const store = useAuthStore();

const router = useRouter();
const email = ref('');
const password = ref('');
const isLoggedIn = ref(false);

const isConnected = ref();

function handleSubmitLogin() {
  fetch('http://localhost:3000/auth/login', {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // Authorization: Bearer ${token}
    },
    method: "POST",
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
    .then((response) => response.json())
    .then((payload) => {
      if (payload.access_token) {
        store.login(payload.access_token);
        isLoggedIn.value = true;
        router.push('/');
      }
      console.log(payload.access_token);
    });
}

function isRedirectionNeeded() {
  if (store.token) {
    console.log("Connected")
    isConnected.value = true;
    router.push('/');
  }
}

onMounted(() => {
  isRedirectionNeeded();
  isLoggedIn.value = !!store.token;
});

</script>

<template>
  <div class="min-h-screen bg-my-black flex items-center justify-center">
    <div class="bg-my-grey-800 p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-my-pink-400 to-my-yellow-400 text-transparent bg-clip-text">
        Connexion
      </h2>
      <div v-if="error" class="bg-my-pink-400 text-my-white p-3 rounded mb-4 text-center">
        {{ error }}
      </div>
      <form @submit.prevent="handleSubmitLogin">
        <div class="mb-4">
          <input
            type="email"
            placeholder="Email"
            v-model="email"
            class="w-full px-3 py-2 bg-my-grey-600 text-my-white rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div class="mb-6">
          <input
            type="password"
            placeholder="Mot de passe"
            v-model="password"
            class="w-full px-3 py-2 bg-my-grey-600 text-my-white rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <button
          type="submit"
          class="w-full py-2 px-4 bg-gradient-to-r from-my-pink-400 to-my-yellow-400 text-my-white font-semibold rounded-lg shadow-md hover:from-my-pink-600 hover:to-my-yellow-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75"
        >
          Valider
        </button>
      </form>
      <div class="mt-4 text-center">
        <RouterLink to="/register" class="text-pink-400 hover:text-pink-300">
          Créer un compte
        </RouterLink>
      </div>
    </div>
  </div>
</template>