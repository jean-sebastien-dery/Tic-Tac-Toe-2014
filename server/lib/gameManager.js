 var uuid = require('node-uuid');

function Game (rounds, timer, creatorName, creatorID) {
	this.id      = uuid.v4();
	this.creator = creatorName;
	this.rounds  = rounds;
	this.timer   = timer;
	this.waiting = true;
	this.players = [];
	this.players.push(creatorID);
}

exports.joinGame = function (player) {
	this.waiting = false;
	this.players.push(player)
}

exports.parseGame = function (game, clientID, cb) {

	var err = []
	  , parsedGame = {};

	if (game.time  == undefined || game.time == 0) {
		err.push('no time lapse defined');
	}

	if (game.rounds == undefined || game.rounds == 0) {
		err.push('no round amount defined');
	}

	if (game.creator == undefined || game.creator == "") {
		err.push('no creator name defined');
	}

	if (clientID == undefined) {
		err.push('clientID is undefined');
	}

	if (err.length == 0) {
		parsedGame = new Game(game.rounds, game.time, game.creator, clientID)
	}

	err = (err.length > 0 ? err : null);

	cb(err, parsedGame);

}

