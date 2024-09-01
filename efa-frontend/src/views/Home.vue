<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';

const store = useAuthStore();

const teamName = ref('');
const toplaner = ref('');
const jungler = ref('');
const midlaner = ref('');
const botlaner = ref('');
const support = ref('');

const tournamentName = ref('');
const mode = ref('');
const number = ref('');
const team = ref('')

const userTournaments = ref([]);
const selectedTournament = ref(null);
const teamToAdd = ref('');
const teamsInTournament = ref([]);
const tournamentMatches = ref([]);

async function fetchUserTournaments() {
  try {
    const response = await fetch('http://localhost:3000/my/user-tournaments', {
      headers: {
        'Authorization': `Bearer ${store.token}`
      }
    });
    if (response.ok) {
      userTournaments.value = await response.json();
      console.log('Tournois récupérés:', userTournaments.value);
    } else {
      console.error('Erreur lors de la récupération des tournois:', await response.text());
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des tournois:', error);
  }
}

async function fetchTeamsInTournament(tournamentId: string) {
  if (!tournamentId) return;
  try {
    const response = await fetch(`http://localhost:3000/tournament/${tournamentId}`, {
      headers: {
        'Authorization': `Bearer ${store.token}`
      }
    });
    if (response.ok) {
      const tournamentData = await response.json();
      teamsInTournament.value = tournamentData.teams || [];
      console.log('Équipes récupérées:', teamsInTournament.value);
    } else {
      console.error('Erreur lors de la récupération des équipes du tournoi:', await response.text());
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des équipes:', error);
  }
}

async function fetchTournamentMatches(tournamentId: string) {
  if (!tournamentId) return;
  try {
    const response = await fetch(`http://localhost:3000/tournament/${tournamentId}/matches`, {
      headers: {
        'Authorization': `Bearer ${store.token}`
      }
    });
    if (response.ok) {
      tournamentMatches.value = await response.json();
      console.log('Matchs récupérés:', tournamentMatches.value);
    } else {
      console.error('Erreur lors de la récupération des matchs:', await response.text());
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des matchs:', error);
  }
}

watch(() => selectedTournament.value, (newTournament) => {
  if (newTournament) {
    fetchTeamsInTournament(newTournament.id);
    fetchTournamentMatches(newTournament.id);
  } else {
    teamsInTournament.value = [];
    tournamentMatches.value = [];
  }
});

let intervalId: number | null = null;

onMounted(() => {
  fetchUserTournaments();
  intervalId = setInterval(fetchUserTournaments, 5000);
});

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});

function handleSubmitTeam() {
  fetch('http://localhost:3000/team/createTeam', {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      name: teamName.value,
      toplaner: toplaner.value,
      jungler: jungler.value,
      midlaner: midlaner.value,
      botlaner: botlaner.value,
      support: support.value,
    })
  })
    .then((response) => {
      return response.json()
    })
}

function handleSubmitTournament() {
  fetch('http://localhost:3000/tournament/createTournament', {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      name: tournamentName.value,
      mode: mode.value,
      number: number.value,
      team: team.value,
    })
  })
    .then((response) => {
      return response.json()
    })
}

async function addTeamToTournament() {
  if (!selectedTournament.value || !teamToAdd.value) return;

  console.log(teamsInTournament.value.teams)

  try {
    const response = await fetch(`http://localhost:3000/tournament/${selectedTournament.value.id}/addTeam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${store.token}`
      },
      body: JSON.stringify({ teamTag: teamToAdd.value })
    });

    if (response.ok) {
      console.log('Équipe ajoutée avec succès');
      fetchTeamsInTournament(selectedTournament.value.id);
      teamToAdd.value = '';
    } else {
      console.error('Erreur lors de l\'ajout de l\'équipe:', await response.text());
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'équipe:', error);
  }
}

async function startTournament() {
  if (!selectedTournament.value) return;

  try {
    const response = await fetch(`http://localhost:3000/tournament/${selectedTournament.value.id}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${store.token}`
      },
      body: JSON.stringify({
        mode: selectedTournament.value.mode,
        number: selectedTournament.value.number
      })
    });

    if (response.ok) {
      console.log('Tournoi démarré avec succès');
      fetchTournamentMatches(selectedTournament.value.id);
    } else {
      console.error('Erreur lors du démarrage du tournoi:', await response.text());
    }
  } catch (error) {
    console.error('Erreur lors du démarrage du tournoi:', error);
  }
}

async function updateMatchResult(matchId: string, winnerId: string) {
  try {
    const response = await fetch(`http://localhost:3000/tournament/${selectedTournament.value.id}/match/${matchId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${store.token}`
      },
      body: JSON.stringify({ winnerId })
    });

    if (response.ok) {
      console.log('Résultat du match mis à jour');
      fetchTournamentMatches(selectedTournament.value.id);
    } else {
      console.error('Erreur lors de la mise à jour du résultat:', await response.text());
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du résultat:', error);
  }
}
</script>

<template>
  <div class="min-h-screen bg-my-black p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-my-pink-400 to-my-yellow-400 text-transparent bg-clip-text">
        Dashboard Tournois
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-my-grey-800 rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold text-my-white mb-4">Créer une équipe</h2>
          <form @submit="handleSubmitTeam">
            <input
              type="text"
              placeholder="Team Name"
              v-model="teamName"
              class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded"
            />
            <input type="text"  placeholder="Toplaner" v-model="toplaner" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
            <input type="text" placeholder="Jungler" v-model="jungler" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
            <input type="text" placeholder="Midlaner" v-model="midlaner" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
            <input type="text" placeholder="Botlaner" v-model="botlaner" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
            <input type="text" placeholder="Support" v-model="support" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
            <button type="submit" class="w-full py-2 px-4 bg-my-blue-400 text-my-black rounded hover:bg-my-my-blue-600 transition">
              Créer l'équipe
            </button>
          </form>
        </div>

        <div class="bg-my-grey-800 rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold text-my-white mb-4">
            Créer un tournois
          </h2>
          <form @submit="handleSubmitTournament">
            <input
              type="text"
              placeholder="Tournament Name"
              v-model="tournamentName"
              class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded"
            />
            <select v-model="number" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
              <option value="">Select number of teams</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
            </select>
            <select v-model="mode" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
              <option value="">Select mode</option>
              <option value="BO1">BO1</option>
              <option value="BO3">BO3</option>
              <option value="BO5">BO5</option>
            </select>
            <input
              type="text"
              placeholder="Team Code"
              v-model="team"
              class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded"
            />
            <button type="submit" class="w-full py-2 px-4 bg-my-blue-400 text-my-black rounded hover:bg-my-my-blue-600 transition">
              Créer le tournois
            </button>
          </form>
        </div>
      </div>

      <div class="mt-8 bg-my-grey-800 rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-my-white mb-4">Tournaments</h2>
        <select v-model="selectedTournament" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
          <option value="">Select a tournament</option>
          <option v-for="tournament in userTournaments" :key="tournament.id" :value="tournament">
            {{ tournament.name }}
          </option>
        </select>

        <div v-if="selectedTournament">
          <form @submit="addTeamToTournament" class="mb-4">
            <input
              type="text"
              placeholder="Team Code"
              v-model="teamToAdd"
              class="w-full p-2 mb-2 bg-my-grey-600 text-my-white rounded"
            />
            <button type="submit" class="w-full py-2 px-4 bg-my-yellow-400 text-my-white rounded hover:bg-my-yellow-600 transition">
              Ajouter une équipe
            </button>
          </form>
          <div>
            <h3 class="font-bold">Équipes inscrites :</h3>
            <ul v-if="teamsInTournament.length > 0">
              <li v-for="team in teamsInTournament" :key="team.teamId">
                {{ team.team?.name || 'Nom d\'équipe inconnu' }}
              </li>
            </ul>
            <p v-else>Aucune équipe inscrite pour le moment</p>
          </div>

          <button v-if="selectedTournament.stage === 'IN_PROGRESS'" @click="startTournament" class="w-full py-2 px-4 bg-my-pink-400 text-my-white rounded hover:bg-my-pink-600 transition mb-4">
            Start Tournament
          </button>

          <p v-if="selectedTournament.stage === 'FINISHED'" class="text-my-white mb-4">
            Winner: {{ selectedTournament.winner.name }}
          </p>

          <!-- Add tournament matches display here -->
        </div>
      </div>
    </div>
  </div>
</template>