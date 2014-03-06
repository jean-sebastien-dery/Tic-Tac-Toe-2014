 var uuid = require('node-uuid');

function Game (rounds, timer, creatorName, creatorID) {
	this.id      = uuid.v4();
	this.creator = creatorName;
	this.rounds  = rounds;
	this.timer   = timer;
	this.waiting = true;
	this.players = [];
	this.players.push({playerID:creatorID, username:creatorName});
}

Game.prototype.playerMoved = function (grid, cb) {
	this.grid = grid;
	cb(null);
}

Game.prototype.status = function (cb) {
	var r1 = this.grid[0];
	var r2 = this.grid[1];
	var r3 = this.grid[2];

	var c1 = [r1[0], r2[0], r3[0]];
	var c2 = [r1[1], r2[1], r3[1]];
	var c3 = [r1[2], r2[2], r3[2]];

	var d1 = [r1[0], r2[1], r3[2]];
	var d2 = [r1[2], r2[1], r3[0]];

	function checkRow (row) {
		if (row[0] != 0) {
			if (row[0] == row[1] && row[0] == row[2] && row[1] == row[2]) {
				return true;
			}
		}
	}

	function isGridFull () {
		if (r1[0] != 0 && r1[1] != 0 && r1[2] != 0 &&
			r2[0] != 0 && r2[1] != 0 && r2[2] != 0 &&
			r3[0] != 0 && r3[1] != 0 && r3[2] != 0) 
		{
			return true;
		} else {
			return false;
		}
	}

	if (checkRow(r1)) {
		cb(r1[0]);
	} else if (checkRow(r2)) {
		cb(r2[0]);
	} else if (checkRow(r3)) {
		cb(r3[0]);
	} else if (checkRow(c1)) {
		cb(c1[0]);
	} else if (checkRow(c2)) {
		cb(c2[0]);
	} else if (checkRow(c3)) {
		cb(c3[0]);
	} else if (checkRow(d1)) {
		cb(d1[0]);
	} else if (checkRow(d2)) {
		cb(d2[0]);
	}else if (isGridFull()) {
		cb(3);
	} else {
		cb(null);
	}
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
