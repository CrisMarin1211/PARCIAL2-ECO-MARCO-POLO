const { assignRoles } = require('../utils/helpers');
const { players } = require('../db');

// Maneja cuando un jugador se une al juego
const joinGameHandler = (socket, db, io) => {
	return (user) => {
		db.players.push({ id: socket.id, ...user, score: 0 }); // Agrega el campo score al jugador
		console.log(db.players);
		io.emit('userJoined', db);
	};
};

// Maneja el inicio del juego asignando roles a los jugadores
const startGameHandler = (socket, db, io) => {
	return () => {
		db.players = assignRoles(db.players);

		db.players.forEach((element) => {
			io.to(element.id).emit('startGame', element.role);
		});
	};
};

// Notifica a los Polos cuando Marco grita "Marco!"
const notifyMarcoHandler = (socket, db, io) => {
	return () => {
		const rolesToNotify = db.players.filter((user) => user.role === 'polo' || user.role === 'polo-especial');

		rolesToNotify.forEach((element) => {
			io.to(element.id).emit('notification', {
				message: 'Marco!!!',
				userId: socket.id,
			});
		});
	};
};

// Notifica a los Marcos cuando Polo grita "Polo!"
const notifyPoloHandler = (socket, db, io) => {
	return () => {
		const rolesToNotify = db.players.filter((user) => user.role === 'marco');

		rolesToNotify.forEach((element) => {
			io.to(element.id).emit('notification', {
				message: 'Polo!!',
				userId: socket.id,
			});
		});
	};
};

// Maneja la selección de un Polo por parte del Marco
const onSelectPoloHandler = (socket, db, io) => {
	return (userID) => {
		const marco = db.players.find((user) => user.id === socket.id);
		const poloSelected = db.players.find((user) => user.id === userID);

		// Si el Polo seleccionado es el Polo especial
		if (poloSelected.role === 'polo-especial') {
			marco.score += 50; // Marco gana 50 puntos
			poloSelected.score -= 10; // Polo especial pierde 10 puntos

			// Notificar a todos los jugadores sobre el final del juego
			db.players.forEach((element) => {
				io.to(element.id).emit('notifyGameOver', {
					message: `El marco ${marco.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado`,
				});
			});
		} else {
			// Si el Polo seleccionado no es el Polo especial
			marco.score -= 10; // Marco pierde 10 puntos
			poloSelected.score += 10; // Polo gana 10 puntos

			db.players.forEach((element) => {
				io.to(element.id).emit('notifyGameOver', {
					message: `El marco ${marco.nickname} ha perdido, ${poloSelected.nickname} escapó`,
				});
			});
		}

		// Emitir la actualización de los puntajes
		io.emit('updateScore', { players: db.players });

		// Comprobar si hay un ganador
		CheckWinnerPlayer(io, db.players);
	};
};

// Comprobar si hay un jugador que ha alcanzado el puntaje necesario para ganar
const CheckWinnerPlayer = (io, players) => {
	const Winner = players.find((player) => player.score >= 100);
	if (Winner) {
		// Ordenar jugadores por puntaje de mayor a menor
		const PlayerOrder = players.sort((a, b) => b.score - a.score);

		// Notificar al ganador y mostrar la lista de jugadores ordenada
		io.emit('ScreenWinner', {
			Winner: Winner.nickname,
			players: PlayerOrder.map((player, index) => ({
				position: index + 1,
				nickname: player.nickname,
				score: player.score,
			})),
		});

		// Reiniciar los puntajes y roles de los jugadores
		players.forEach((player) => {
			player.score = 0;
			player.role = null;
		});

		// Emitir el evento para reiniciar el juego
		io.emit('RestarGame', players);
	}
};

// Reinicia el juego reiniciando los puntajes y roles
const GameRestart = (socket, db, io) => {
	console.log('El juego se reiniciará');
	return () => {
		db.players.forEach((player) => {
			player.score = 0;
			player.role = null;
		});
		io.emit('RestarGame', db.players);
	};
};

// Ordena a los jugadores alfabéticamente por su nickname
const SortAphabetically = (socket, db, io) => {
	return () => {
		const PlayerOrder = db.players.sort((a, b) => a.nickname.localeCompare(b.nickname));

		io.emit('UpdateListPlayer', {
			players: PlayerOrder.map((player, index) => ({
				position: index + 1,
				nickname: player.nickname,
				score: player.score,
			})),
		});
	};
};

// Obtiene la lista de jugadores con sus puntajes y posiciones
const GetPlayerList = (socket, db, io) => {
	return () => {
		const PlayerStatus = db.players.map((player, index) => ({
			position: index + 1,
			nickname: player.nickname,
			score: player.score,
		}));
		socket.emit('getPlayersList', {
			players: PlayerStatus,
		});
	};
};

module.exports = {
	joinGameHandler,
	startGameHandler,
	notifyMarcoHandler,
	notifyPoloHandler,
	onSelectPoloHandler,
	GameRestart,
	CheckWinnerPlayer,
	SortAphabetically,
	GetPlayerList,
};
