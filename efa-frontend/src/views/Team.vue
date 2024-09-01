<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

interface TeamMember {
  userId: string;
  lane: string;
  user: {
    nametag: string;
  };
}

interface Team {
  id: string;
  name: string;
  users: TeamMember[];
}

const navigateHome = () => {
  router.push('/');
};

const store = useAuthStore();

const teams = ref<Team[]>([]);

async function fetchTeams() {
  try {
    const response = await fetch('http://localhost:3000/my/user', {
      headers: {
        'Authorization': `Bearer ${store.token}`
      }
    });
    if (response.ok) {
      teams.value = await response.json();
    } else {
      throw new Error('Failed to fetch user teams');
    }
  } catch (error) {
    console.error('Error fetching user teams:', error);
  }
}

function copyTeamTag(team: Team) {
  const teamTag = `${team.name}#${team.id.slice(-5)}`;
  navigator.clipboard.writeText(teamTag)
    .then(() => alert('Tag d\'équipe copié dans le presse-papier !'))
    .catch(err => console.error('Erreur lors de la copie :', err));
}

async function deleteTeam(teamId: string) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
    try {
      const response = await fetch(`http://localhost:3000/team/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${store.token}`
        }
      });
      if (response.ok) {
        teams.value = teams.value.filter(team => team.id !== teamId);
        alert('Équipe supprimée avec succès');
      } else {
        throw new Error('Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Erreur lors de la suppression de l\'équipe. L\'équipe est surement inscrite dans un tournois.');
    }
  }
}

onMounted(() => {
  fetchTeams();
});

</script>

<template>
  <div class="min-h-screen bg-my-black p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-my-pink-400 to-my-yellow-400 text-transparent bg-clip-text">
        Team Dashboard
      </h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="team in teams" :key="team.id" class="bg-my-grey-800 rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-my-white mb-4">{{ team.name }}</h2>
          <ul class="mb-4">
            <li v-for="(member, index) in team.users" :key="index" class="text-my-white">
               {{ member.lane }} : {{ member.user.nametag }}
            </li>
          </ul>
          <div class="flex justify-between">
            <button
              @click="copyTeamTag(team)"
              class="px-4 py-2 bg-my-blue-400 text-my-white rounded hover:bg-my-blue-600 transition"
            >
              Copy Team Tag
            </button>
            <button
              @click="deleteTeam(team.id)"
              class="px-4 py-2 bg-my-pink-400 text-my-white rounded hover:bg-my-pink-600 transition"
            >
              Delete Team
            </button>
          </div>
        </div>
      </div>
      <button
        @click="navigateHome"
        class="mt-8 w-full py-2 px-4 bg-gradient-to-r from-my-pink-400 to-my-yellow-400 text-my-white font-semibold rounded-lg shadow-md hover:from-my-pink-600 hover:to-my-yellow-600 transition"
      >
        Menu principale
      </button>
    </div>
  </div>
</template>