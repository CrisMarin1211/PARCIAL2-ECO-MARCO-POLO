import { router, socket } from '../routes.js';

export default function renderScreen1() {
	const app = document.getElementById('app');
	app.innerHTML = `
        <h1>RESULTADOS</h1>
        <p>PUNTOS</p>
        <div id="MensajeGanador"></div>
        <ul id="PlayerList"></ul>
    `;

	// Emitir evento para obtener la lista de jugadores
	socket.emit('getPlayersList');

	// Listener para recibir la lista de jugadores
	socket.on('getPlayersList', (data) => {
		const { players } = data;
		PlayerListRender(players);
	});

	// Listener para actualizar la lista cuando se actualizan los puntajes
	socket.on('updateScore', (data) => {
		const { players } = data;
		PlayerListRender(players);
	});

	// Listener para cuando se une un nuevo usuario
	socket.on('userJoined', (db) => {
		const { players } = db;
		PlayerListRender(players);
	});

	// Mostrar al ganador
	socket.on('ScreenWinner', (data) => {
		const { Winner, players } = data; // Asegúrate de que el nombre de las propiedades es correcto
		document.getElementById('MensajeGanador').textContent = `¡${Winner} ha ganado!`;
		PlayerListRender(players);
		router.navigateTo('/screen2');
	});

	// Función para renderizar la lista de jugadores
	function PlayerListRender(players) {
		let playerList = '';
		players.forEach((player, index) => {
			playerList += `<li>${index + 1}. ${player.nickname} (${player.score} pts)</li>`;
		});
		document.getElementById('PlayerList').innerHTML = playerList;
	}
}
