const db = require('../db');
const {
	joinGameHandler,
	startGameHandler,
	notifyMarcoHandler,
	notifyPoloHandler,
	onSelectPoloHandler,
	SortAphabetically,
	GameRestart,
	CheckWinnerPlayer,
	GetPlayerList,
} = require('../event-handlers/gameHandlers');
const { assignRoles } = require('../utils/helpers');

const gameEvents = (socket, io) => {
	socket.on('joinGame', joinGameHandler(socket, db, io));

	socket.on('startGame', startGameHandler(socket, db, io));

	socket.on('notifyMarco', notifyMarcoHandler(socket, db, io));

	socket.on('notifyPolo', notifyPoloHandler(socket, db, io));

	socket.on('onSelectPolo', onSelectPoloHandler(socket, db, io));

	socket.on('SortAphabetically', SortAphabetically(socket, db, io));

	socket.on('RestarGame', GameRestart(socket, db, io));

	// Cambiamos el evento `checkWinner` para pasar `io` y `db.players` a `CheckWinnerPlayer`
	socket.on('checkWinner', () => CheckWinnerPlayer(io, db.players));

	socket.on('getPlayersList', GetPlayerList(socket, db, io));
};

module.exports = { gameEvents };
