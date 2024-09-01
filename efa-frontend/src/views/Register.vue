<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const store = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');

function handleSubmitRegister() {
  if (password.value !== confirmPassword.value) {
    error.value = "Les mots de passe ne correspondent pas";
    return;
  }

  fetch('http://localhost:3000/auth/register', {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  })
    .then((response) => response.json())
    .then((payload) => {
      if (payload.access_token) {
        store.login(payload.access_token);
        router.push('/');
      }
    });
}
</script>

<template>
  <div class="min-h-screen bg-my-black flex items-center justify-center">
    <div class="bg-my-grey-800 p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-my-pink-400 to-my-yellow-400 text-transparent bg-clip-text">
        Inscription
      </h2>
      <div v-if="error" class="bg-my-pink-400 text-my-white p-3 rounded mb-4 text-center">
        {{ error }}
      </div>
      <form @submit.prevent="handleSubmitRegister">
        <div class="mb-4">
          <input
            type="email"
            placeholder="Email"
            v-model="email"
            class="w-full px-3 py-2 bg-my-grey-600 text-my-white rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div class="mb-4">
          <input
            type="password"
            placeholder="Mot de passe"
            v-model="password"
            class="w-full px-3 py-2 bg-my-grey-600 text-my-white rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div class="mb-6">
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            v-model="confirmPassword"
            class="w-full px-3 py-2 bg-my-grey-600 text-my-white rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <button
          type="submit"
          class="w-full py-2 bg-gradient-to-r from-my-pink-400 to-my-yellow-400 text-my-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          Valider
        </button>
      </form>
      <div class="mt-4 text-center">
        <RouterLink to="/login" class="text-pink-500 hover:underline">
          Déjà un compte ? Connexion
        </RouterLink>
      </div>
    </div>
  </div>
</template>

