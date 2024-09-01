<script setup lang="ts">
import { onMounted, ref } from 'vue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

const store = useAuthStore();

const email = ref('');
const password = ref('');
const nametag = ref('');

const isConnected = ref();

function handleSubmitRegister() {
  fetch('http://localhost:3000/auth/register', {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      email: email.value,
      nametag: nametag.value,
      password: password.value,
    })
  })
    .then((response) => {
      return response.json()
    })
  router.push('/login');
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
});

</script>

<template>
  <form @submit.prevent="handleSubmitRegister">
    <input type="email" placeholder="email" v-model="email">
    <input type="text" placeholder="Pseudo" v-model="nametag">
    <input type="password" placeholder="Mot de passe" v-model="password">
    <button type="submit">Valider</button>
  </form>
</template>