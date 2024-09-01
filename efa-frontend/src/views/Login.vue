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
  <main>
    <form v-if="!isLoggedIn" @submit.prevent="handleSubmitLogin">
      <input type="email" placeholder="email" v-model="email">
      <input type="password" placeholder="mdp" v-model="password">
      <button type="submit">Valider</button>
    </form>
    <RouterLink v-if="!isLoggedIn" to="/register">Créer un compte</RouterLink>
  </main>
</template>