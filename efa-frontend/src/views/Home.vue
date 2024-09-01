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
  <section>
    <h2>Créer une équipe</h2>
    <form @submit.prevent="handleSubmitTeam">
      <input type="text" placeholder="Nom de l'équipe" v-model="teamName">
      <input type="text"  placeholder="Toplaner" v-model="toplaner">
      <input type="text" placeholder="Jungler" v-model="jungler">
      <input type="text" placeholder="Midlaner" v-model="midlaner">
      <input type="text" placeholder="Botlaner" v-model="botlaner">
      <input type="text" placeholder="Support" v-model="support">
      <button type="submit">Créer</button>
    </form>
  </section>

  <section>
    <h2>Créer un tournois</h2>
    <form @submit.prevent="handleSubmitTournament">
      <input type="text" placeholder="Nom du tournois" v-model="tournamentName">
      <select v-model="number">
        <option>4</option>
        <option>8</option>
        <option>16</option>
      </select>
      <select v-model="mode">
        <option disabled value="">Veuillez selectionner un mode</option>
        <option>BO1</option>
        <option>BO3</option>
        <option>BO5</option>
      </select>
      <input v-model="team" placeholder="Rentrer le code équipe">
      <button type="submit">Créer</button>
    </form>
  </section>

  <section>
    <h2>Tournois</h2>
    <div>
      <select v-model="selectedTournament">
        <option :value="null">Sélectionnez un tournoi</option>
        <option v-for="tournament in userTournaments" :key="tournament.id" :value="tournament">
          {{ tournament.name }}
        </option>
      </select>
      <p v-if="userTournaments.length === 0">Aucun tournoi disponible</p>
      <form @submit.prevent="addTeamToTournament" v-if="selectedTournament">
        <input v-model="teamToAdd" type="text" placeholder="Rentrer le code d'équipe">
        <button type="submit">Inscrire</button>
      </form>
      <div>
        <h3>Équipes inscrites :</h3>
        <ul v-if="teamsInTournament.length > 0">
          <li v-for="team in teamsInTournament" :key="team.teamId">
            {{ team.team?.name || 'Nom d\'équipe inconnu' }}
          </li>
        </ul>
        <p v-else>Aucune équipe inscrite pour le moment</p>
      </div>
    </div>
    <div v-if="selectedTournament && selectedTournament.stage === 'NOT_STARTED'">
      <button @click="startTournament">Démarrer le tournoi</button>
    </div>
    <div v-if="selectedTournament && selectedTournament.stage === 'IN_PROGRESS'">
      <h3>Matchs du tournoi</h3>
      <div v-for="match in tournamentMatches" :key="match.id">
        <h4>{{ match.stage }} - Match {{ match.id }}</h4>
        <div :style="{ backgroundColor: match.winner === match.team1Id ? 'aqua' : 'white' }">
          <p>{{ match.team1.name }}</p>
          <button v-if="!match.winner" @click="updateMatchResult(match.id, match.team1Id)">
            Déclarer vainqueur
          </button>
          <p v-if="match.winner === match.team1Id">Vainqueur</p>
          <p v-else-if="match.winner && match.winner !== match.team1Id">Perdant</p>
        </div>
        <div :style="{ backgroundColor: match.winner === match.team2Id ? 'aqua' : 'white' }">
          <p>{{ match.team2.name }}</p>
          <button v-if="!match.winner" @click="updateMatchResult(match.id, match.team2Id)">
            Déclarer vainqueur
          </button>
          <p v-if="match.winner === match.team2Id">Vainqueur</p>
          <p v-else-if="match.winner && match.winner !== match.team2Id">Perdant</p>
        </div>
      </div>
    </div>
    <div v-if="selectedTournament && selectedTournament.stage === 'FINISHED'">
      <p>Les vainqueurs sont l'équipe {{ selectedTournament.winner.name }}</p>
    </div>
    <div v-if="!selectedTournament">
      Pas de tournois en cours...
    </div>
  </section>
</template>