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
const team = ref('');

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
      console.log('Tournaments retrieved:', userTournaments.value);
    } else {
      console.error('Error retrieving tournaments:', await response.text());
    }
  } catch (error) {
    console.error('Error retrieving tournaments:', error);
  }
}

async function fetchTournamentDetails(tournamentId: string) {
  if (!tournamentId) return;
  try {
    const response = await fetch(`http://localhost:3000/tournament/${tournamentId}`, {
      headers: {
        'Authorization': `Bearer ${store.token}`
      }
    });
    if (response.ok) {
      const tournamentData = await response.json();
      selectedTournament.value = tournamentData;
      teamsInTournament.value = tournamentData.teams || [];
      tournamentMatches.value = tournamentData.matches || [];
      console.log('Tournament details retrieved:', tournamentData);
    } else {
      console.error('Error retrieving tournament details:', await response.text());
    }
  } catch (error) {
    console.error('Error retrieving tournament details:', error);
  }
}

watch(() => selectedTournament.value, (newTournament) => {
  if (newTournament) {
    fetchTournamentDetails(newTournament.id);
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

function getTeamName(teamId: string) {
  const team = teamsInTournament.value.find(t => t.teamId === teamId);
  return team ? team.team.name : 'Équipe inconnue';
}

  function handleSubmitTeam() {
    fetch('http://localhost:3000/team/createTeam', {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        'Authorization': `Bearer ${store.token}`
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
      .then(() => {
        teamName.value = '';
        toplaner.value = '';
        jungler.value = '';
        midlaner.value = '';
        botlaner.value = '';
        support.value = '';
      })
      .catch((error) => {
        console.error('Error creating team:', error);
      });
  }

  function handleSubmitTournament() {
    fetch('http://localhost:3000/tournament/createTournament', {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        'Authorization': `Bearer ${store.token}`
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
      .then(() => {
        tournamentName.value = '';
        mode.value = '';
        number.value = '';
        team.value = '';
        fetchUserTournaments();
      })
      .catch((error) => {
        console.error('Error creating tournament:', error);
      });
  }

  async function addTeamToTournament() {
    if (!selectedTournament.value || !teamToAdd.value) return;

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
        fetchTournamentDetails(selectedTournament.value.id);
        teamToAdd.value = '';
      } else {
        console.error('Erreur lors de l\'ajout de l\'équipe:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'équipe:', error);
    }
  }

async function startTournament() {
  if (!selectedTournament.value) {
    console.error("Aucun tournoi sélectionné");
    return;
  }

  try {
    console.log("Démarrage du tournoi:", selectedTournament.value);
    const response = await fetch(`http://localhost:3000/tournament/${selectedTournament.value.id}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${store.token}`
      },
      body: JSON.stringify({
        mode: 'BO1',
        number: '8'
      })
    });
    console.log("Number value:", selectedTournament.value);

    if (response.ok) {
      const result = await response.json();
      console.log('Tournoi démarré avec succès:', result);
      await fetchTournamentDetails(selectedTournament.value.id);
    } else {
      const errorText = await response.text();
      console.error('Erreur lors du démarrage du tournoi:', errorText);
    }
  } catch (error) {
    console.error('Erreur lors du démarrage du tournoi:', error);
  }
}

  async function updateMatchResult(matchId: string, winnerId: string) {
    if (!selectedTournament.value) return;

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
        fetchTournamentDetails(selectedTournament.value.id);
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
          <form @submit.prevent="handleSubmitTeam">
            <input
              type="text"
              placeholder="Nom de l'équipe"
              v-model="teamName"
              class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded"
            />
            <input type="text"  placeholder="Toplaner" v-model="toplaner" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
            <input type="text" placeholder="Jungler" v-model="jungler" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
            <input type="text" placeholder="Midlaner" v-model="midlaner" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
            <input type="text" placeholder="Botlaner" v-model="botlaner" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
            <input type="text" placeholder="Support" v-model="support" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
            <button type="submit" class="w-full py-2 px-4 bg-my-blue-400 text-my-black rounded hover:bg-my-blue-600 transition">
              Créer l'équipe
            </button>
          </form>
        </div>

        <div class="bg-my-grey-800 rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold text-my-white mb-4">
            Créer un tournoi
          </h2>
          <form @submit.prevent="handleSubmitTournament">
            <input
              type="text"
              placeholder="Nom du tournois"
              v-model="tournamentName"
              class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded"
            />
            <select v-model="number" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
              <option value="">Choisir le nombre de participant</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
            </select>
            <select v-model="mode" class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded">
              <option value="">Choisir un mode</option>
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
            <button type="submit" class="w-full py-2 px-4 bg-my-blue-400 text-my-black rounded hover:bg-my-blue-600 transition">
              Créer le tournoi
            </button>
          </form>
        </div>
      </div>

      <div class="mt-8 bg-my-grey-800 rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-my-white mb-4">Tournois</h2>
        <select
          v-model="selectedTournament"
          class="w-full p-2 mb-4 bg-my-grey-600 text-my-white rounded"
          @change="fetchTournamentDetails(selectedTournament.id)"
        >
          <option :value="null">Sélectionner un tournoi</option>
          <option v-for="tournament in userTournaments" :key="tournament.id" :value="tournament">
            {{ tournament.name }}
          </option>
        </select>

        <div v-if="selectedTournament">
          <div class="mb-4">
            <h3 class="font-bold text-my-white">Statut du tournoi : {{ selectedTournament.stage }}</h3>
          </div>

          <form v-if="selectedTournament.stage === 'NOT_STARTED'" @submit.prevent="addTeamToTournament" class="mb-4">
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

          <div class="mb-4">
            <h3 class="font-bold text-my-white">Équipes inscrites :</h3>
            <ul v-if="teamsInTournament.length > 0" class="list-disc pl-5 text-my-white">
              <li v-for="teamEntry in teamsInTournament" :key="teamEntry.teamId">
                {{ teamEntry.team?.name || 'Nom d\'équipe inconnu' }}
              </li>
            </ul>
            <p v-else class="text-my-white">Aucune équipe inscrite pour le moment</p>
          </div>

          <button
            v-if="selectedTournament?.stage === 'NOT_STARTED'"
            @click="startTournament"
            class="w-full py-2 px-4 bg-my-pink-400 text-my-white rounded hover:bg-my-pink-600 transition mb-4"
          >
            Démarrer le tournoi
          </button>

          <div v-if="selectedTournament.stage === 'IN_PROGRESS'" class="mb-4">
            <h3 class="font-bold text-my-white mb-2">Matchs en cours :</h3>
            <div v-for="match in tournamentMatches" :key="match.id" class="bg-my-grey-700 p-3 rounded mb-2">
              <p class="text-my-white">{{ getTeamName(match.team1Id) }} vs {{ getTeamName(match.team2Id) }}</p>
              <p class="text-my-white">Statut : {{ match.status }}</p>
              <div v-if="match.status === 'PENDING'" class="mt-2">
                <button @click="updateMatchResult(match.id, match.team1Id)" class="mr-2 px-3 py-1 bg-my-blue-400 text-my-white rounded hover:bg-my-blue-600 transition">
                  {{ getTeamName(match.team1Id) }} Gagne
                </button>
                <button @click="updateMatchResult(match.id, match.team2Id)" class="px-3 py-1 bg-my-blue-400 text-my-white rounded hover:bg-my-blue-600 transition">
                  {{ getTeamName(match.team2Id) }} Gagne
                </button>
              </div>
            </div>
          </div>

          <div v-if="selectedTournament.stage === 'FINISHED'" class="mb-4">
            <h3 class="font-bold text-my-white mb-2">Résultat final :</h3>
            <p class="text-my-white">Vainqueur : {{ selectedTournament.winner?.name || 'Nom d\'équipe inconnu' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>