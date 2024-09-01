<script setup lang="ts">
import { onMounted, ref } from 'vue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

const store = useAuthStore();

const isConnected = ref();

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

store.$subscribe( (mutation, state) => {
  isConnected.value = !!state.token;
})

onMounted(() => {
  isLoggedIn();
});

</script>

<template>
  <header>
    <nav  v-if="isConnected">
      <RouterLink to="/">Menu principale</RouterLink>
      <RouterLink to="/team">Équipes</RouterLink>
    </nav>
    <nav>
      <button v-if="isConnected" @click="copyUserTag">Récupérer mon id</button>
      <button v-if="isConnected" @click="handleLogout">Déconnexion</button>
      <RouterLink to="/login" v-if="!isConnected" >Connexion</RouterLink>
    </nav>
  </header>
  <RouterView/>
</template>

<style>
/* Votre style ici */
</style>
