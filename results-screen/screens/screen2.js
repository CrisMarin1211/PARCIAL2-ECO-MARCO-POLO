import { router, socket } from '../routes.js';

export default function renderScreen2() {
	const app = document.getElementById('app');
	app.innerHTML = `
        <h1>PODIUM</h1>
        <button id="OrderButton">Ordenar Alfabéticamente</button>
        <div id="winnerMessage"></div>
        <ul id="PlayerEnd"></ul>
    `;

	// Emitir evento para revisar si hay un ganador
	socket.emit('checkWinner');

	// Listener para mostrar al ganador y la lista de jugadores
	socket.on('ScreenWinner', (data) => {
		const { Winner, players } = data;

		// Mostrar el mensaje del ganador
		document.getElementById('winnerMessage').textContent = `¡El ganador es ${Winner}!`;
		PlayersRender(players);
	});

	// Función para renderizar la lista de jugadores en pantalla
	function PlayersRender(players) {
		// Ordenar por puntaje de mayor a menor
		players.sort((a, b) => b.score - a.score);

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
		PlayersRender(players);
	});
}
