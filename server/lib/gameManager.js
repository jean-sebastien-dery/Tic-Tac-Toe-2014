function Game (id, rounds, timer, creator) {
	this.id      = id;
	this.rounds  = rounds;
	this.timer   = timer;
	this.waiting = true;
	this.players = [];
	this.players.push(creator);
}

Game.prototype.joinGame = function (player) {
	this.waiting = false;
	this.players.push(player)
}

module.exports = Game;