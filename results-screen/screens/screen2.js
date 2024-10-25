import { router, socket } from '../routes.js';

export default function renderScreen2() {
	const app = document.getElementById('app');
	app.innerHTML = `
        <h1>PODIUM</h1>
        <button id="OrderButton">Ordenar Alfabéticamente</button>
        <div id="winnerMessage"></div>
        <ul id="PlayerEnd"></ul>
    `;

	socket.emit('checkWinner');

	// Listener para mostrar al ganador y la lista de jugadores
	socket.on('ScreenWinner', (data) => {
		const { Winner, players } = data;

		document.getElementById('winnerMessage').textContent = `¡El ganador es ${Winner}!`;
		// Ordenar solo aquí por puntaje de mayor a menor
		PlayersRender(players, true);
	});

	// Listener para actualizar la lista cuando cambian los puntajes
	socket.on('updateScore', (data) => {
		const { players } = data;
		PlayersRender(players, true); // Muestra los jugadores ordenados por puntaje
	});

	function PlayersRender(players, sortByScore = false) {
		// Si sortByScore es verdadero, ordenamos por puntaje, de lo contrario no
		if (sortByScore) {
			players.sort((a, b) => b.score - a.score);
		}

		let playerList = '';
		players.forEach((player, index) => {
			playerList += `<li>${index + 1}. ${player.nickname} (${player.score} pts)</li>`;
		});

		document.getElementById('PlayerEnd').innerHTML = playerList;
	}

	// Botón para ordenar jugadores alfabéticamente
	document.getElementById('OrderButton').addEventListener('click', () => {
		socket.emit('SortAphabetically');
	});

	// Listener para cuando se recibe la lista de jugadores ordenada alfabéticamente
	socket.on('UpdateListPlayer', (data) => {
		const { players } = data;
		PlayersRender(players, false);
	});
}
