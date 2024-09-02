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
          <RouterLink v-if="isConnected" to="/" class="text-my-white hover:text-pink-500 transition">
            <div class="w-25 h25">
              <svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                <path d="M21.5184 0H14.4881C12.9358 0 11.676 1.27092 11.676 2.83688V9.92908C11.676 11.4979 12.9358 12.766 14.4881 12.766H21.5184C23.0707 12.766 24.3306 11.4979 24.3306 9.92908V2.83688C24.3306 1.27092 23.0707 0 21.5184 0Z" fill="#FB37AD"/>
                <path d="M21.4594 14.4681H14.5444C12.9105 14.4681 11.6057 15.8184 11.6788 17.4326L12.5702 37.2908C12.6405 38.8057 13.9032 40 15.4386 40H20.5679C22.1034 40 23.366 38.8057 23.4335 37.2908L24.3278 17.4326C24.4009 15.8184 23.0961 14.4681 21.4594 14.4681Z" fill="url(#paint0_linear_96_7)"/>
                <path d="M7.59838 1.2766C7.42122 1.2766 7.23843 1.29645 7.05845 1.33617L1.99661 2.43688C1.78008 2.48511 1.57198 2.55887 1.38076 2.65532C1.25421 2.72057 1.13329 2.79433 1.01799 2.87943C0.733967 3.08936 0.50056 3.35887 0.326207 3.66525C0.255904 3.78723 0.196849 3.91489 0.149043 4.04823C0.0534305 4.31489 0 4.60142 0 4.89645V10.244C0 11.6369 1.13329 12.7631 2.53092 12.7631H7.59276C8.99039 12.7631 10.1237 11.6369 10.1237 10.244V3.79858C10.1237 2.37447 8.95383 1.27376 7.59276 1.2766H7.59838Z" fill="#04DCD1"/>
                <path d="M10.1068 16.5277C10.0478 15.1234 8.77667 14.0624 7.30873 14.1929L2.38188 14.627C0.947689 14.7546 -0.106861 15.966 0.0168728 17.322C0.0196849 17.356 0.0224971 17.3901 0.0281213 17.427L2.33407 34.4596C2.47749 35.5234 3.32394 36.3688 4.42911 36.5532L7.82336 37.1234C7.98646 37.1518 8.14675 37.1631 8.30423 37.1603C8.46171 37.1603 8.61638 37.1433 8.76823 37.1149C9.9887 36.8936 10.9392 35.8383 10.8858 34.5674L10.1096 16.5277H10.1068Z" fill="url(#paint1_linear_96_7)"/>
                <path d="M35.8519 4.05106C35.8041 3.91773 35.745 3.79007 35.6747 3.66809C35.5032 3.3617 35.267 3.09504 34.9829 2.88227C34.8705 2.79716 34.7495 2.7234 34.6202 2.65816C34.4289 2.5617 34.2237 2.48511 34.0043 2.43972L28.9425 1.33901C28.7625 1.29929 28.5797 1.27943 28.4025 1.27943C27.0415 1.2766 25.8716 2.3773 25.8716 3.80142V10.2496C25.8716 11.6426 27.0049 12.7688 28.4025 12.7688H33.4644C34.862 12.7688 35.9953 11.6426 35.9953 10.2496V4.90213C35.9953 4.60709 35.9447 4.32057 35.8463 4.0539L35.8519 4.05106Z" fill="#FFA320"/>
                <path d="M33.6275 14.627L28.6978 14.1929C27.2327 14.0624 25.9616 15.1234 25.8997 16.5277L25.1264 34.5674C25.0674 35.9319 26.1697 37.0468 27.5195 37.1518C27.7361 37.1716 27.961 37.1603 28.186 37.1234L31.5803 36.5532C32.6854 36.3688 33.5291 35.5234 33.6725 34.4596L35.9784 17.427C35.9841 17.3844 35.9897 17.339 35.9925 17.2965C36.0994 15.9546 35.0532 14.7546 33.6275 14.627Z" fill="url(#paint2_linear_96_7)"/>
                <defs>
                  <linearGradient id="paint0_linear_96_7" x1="18" y1="0" x2="18" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FB37AD"/>
                    <stop offset="1" stop-color="#FFA320"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_96_7" x1="18" y1="0" x2="18" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#04DCD1"/>
                    <stop offset="1" stop-color="#FB37AD"/>
                  </linearGradient>
                  <linearGradient id="paint2_linear_96_7" x1="30.562" y1="14.1821" x2="30.562" y2="37.1615" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFA320"/>
                    <stop offset="1" stop-color="#04DCD1"/>
                  </linearGradient>
                  <radialGradient id="paint3_radial_96_7" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(156 35) rotate(-25.5234) scale(61.502 78.0023)">
                    <stop stop-color="#04DCD1"/>
                    <stop offset="1" stop-color="#FB37AD"/>
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </RouterLink>
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
  @apply text-my-pink-400;
}
</style>