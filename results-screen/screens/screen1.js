import { router, socket } from '../routes.js';

export default function renderScreen1() {
	const app = document.getElementById('app');
	app.innerHTML = `
        <h1>RESULTADOS</h1>
        <p>PUNTOS</p>
        <div id="MensajeGanador"></div>
        <ul id="PlayerList"></ul>
    `;

	socket.emit('getPlayersList');

	socket.on('getPlayersList', (data) => {
		const { players } = data;
		PlayerListRender(players);
	});

	socket.on('updateScore', (data) => {
		const { players } = data;
		PlayerListRender(players);
	});

	socket.on('userJoined', (db) => {
		const { players } = db;
		PlayerListRender(players);
	});

	socket.on('ScreenWinner', (data) => {
		const { Winner, players } = data;
		document.getElementById('MensajeGanador').textContent = `¡${Winner} ha ganado!`;
		PlayerListRender(players);
		router.navigateTo('/screen2');
	});

	function PlayerListRender(players) {
		let playerList = '';
		players.forEach((player, index) => {
			playerList += `<li>${index + 1}. ${player.nickname} (${player.score} pts)</li>`;
		});
		document.getElementById('PlayerList').innerHTML = playerList;
	}
}
