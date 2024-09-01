<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

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
  <h1>Équipes</h1>
  <section>
    <h2>Mes équipes</h2>
    <ul>
      <li v-for="team in teams" :key="team.id" :style="{ backgroundColor: ['#FB37AD', '#FFA320', '#04DCD1', '#A530C5'][teams.indexOf(team) % 4] }">
        <h3>{{ team.name }}</h3>
        <ul>
          <li v-for="member in team.users" :key="member.userId">
            {{ member.lane }}: {{ member.user.nametag }}
          </li>
        </ul>
        <button @click="copyTeamTag(team)">Code de team</button>
        <button @click="deleteTeam(team.id)">Supprimer l'équipe</button>
      </li>
    </ul>
  </section>
</template>