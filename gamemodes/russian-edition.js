function Square(name, style) {
	this.name = name;
	this.style = style;
	this.type = style;
	
	this.uiName = getString(style);
}
function Bill(name, groupNumber, prices, sides) {
	group = groups[groupNumber];
	
	this.name = name;
	this.style = group.style;
	this.group = group;
	this.owner = undefined;
	this.type = "bill";
	
	this.state = 0;
	this.amendments = 0;
	this.direction = 0;
	
	this.prices = prices;
	
	this.sides = sides;
	for (var i = 0; i < sides.length; i++) {
        this.sides[i] = "buy-side-" + this.sides[i];
    }
	
	this.uiName = getString(this.style) + ": " + getString(this.name)
	
	this.price = function(){ return this.prices[this.state]; }
	
	this.refusePropose = function(){
		if (this.state == 0) {
            makeAuction(this);
        }
	};
	
	this.moveState = function(){
		this.state++;
	};
}
function Price(buy, visit) {
	this.buy = buy;
	this.visit = visit;
}

function MoneyCard(index, positive) {
	this.amount = 0;
	this.randomize = function(){
		this.amount = 10 * Math.range(1, 20);
	}
	if (positive) {
        this.textTemplate = "add-money-card" + index;
		this.action = function(p){
			p.money += this.amount;
			gameLog.add(getString("player-got").replace("%player", p.name).replace("%thing", wrapMoney(this.amount)), p, 1);
			updateMoney();
		};
    } else {
		this.textTemplate = "remove-money-card" + index;
		this.action = function(p){
			p.pay(this.amount);
			gameLog.add(getString("player-lost").replace("%player", p.name).replace("%thing", wrapMoney(this.amount)), p, -1);
			updateMoney();
		};
	}
	this.text = () => getString(this.textTemplate).replace("%amount", wrapMoney(this.amount));
	
}
function TicketCard(name, index) {
	this._text = getString("ticket-card-" + name + index);
	this.text = () => this._text;
	this.ticketName = name;
	this.randomize = () => {};
	this.action = function(player) {
		player.addTicket(this.ticketName);
		gameLog.add(getString("player-got").replace("%player", p.name).replace("%thing", getString(this.ticketName + "-title")), p, 1);
		updateTickets();
	}
}
function ActionCard(name, index) {
	this._text = getString("action-card-" + name + index);
	this.text = () => this._text;
	this.ticketName = name;
	this.randomize = () => {};
	this.action = function(player) {
		useTicket(this.ticketName);
	}
}
function RatingCard(index, type, positive) {
	if (positive) {
        this._text = getString(type + "-ratingup-card" + index);
    } else {
		this._text = getString(type + "-ratingdown-card" + index);
	}
	this.text = () => this._text;
	this.amount = 0;
	this.randomize = function(){
		this.amount = Math.range(1, 10);
	}
	this.positive = positive;
	this.type = type;
	this.action = function(player) {
		if (this.type == "assembly") {
            player.assemblyRating += this.amount;
		} else if (this.type == "people") {
            player.peopleRating += this.amount;
        } else return;
		if (this.positive) {
            gameLog.add(getString("increased-" + this.type + "-rating").replace("%player", p.name).replace("%amount", this.amount), p, 1);
        } else {
			gameLog.add(getString("decreased-" + this.type + "-rating").replace("%player", p.name).replace("%amount", this.amount), p, 1);
        }
		updateMoney();
	}
}
function GotoCard(name, index) {
	this._text = getString("goto-" + name + index);
	this.text = () => this._text;
	this.ticketName = name;
	this.randomize = () => {};
	this.action = function(player) {
		player.addTicket(this.ticketName);
		gameLog.add(getString("player-got").replace("%player", p.name).replace("%thing", this.ticketName + "-title"), p, 1);
		updateTickets();
	}
}

function Group(name) {
    this.name = name;
	this.style = name;
}
Group.prototype.toString = function(){return '"' + this.name + '" group' ;};

var square = [];
squareSize = [17, 9];
cellsCount = 48;

var groups = [
	new Group("self-gov"),
	new Group("taxes"),
	new Group("law"),
	new Group("speech"),
	new Group("soe"),
	new Group("business"),
	new Group("elections"),
	new Group("privacy"),
	new Group("ecology"),
	new Group("foreign-invest"),
	new Group("human-rights"),
	new Group("piar")
]

square[0] = new Square("new-session", "new-session");

square[1] = new Bill("self-gov-rights", 0, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"]);
square[2] = new Bill("self-gov-budget", 0, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"]);
square[3] = new Bill("self-gov-elections", 0, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"]);

square[4] = new Square("com-chest1", "com-chest");

square[5] = new Bill("taxes-public-utility", 1, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["strengthen", "reformat", "ease"]);
square[6] = new Bill("taxes-self-employment", 1, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["decrease", "reformat", "increase"]);
square[7] = new Bill("taxes-indirect", 1, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["decrease", "reformat", "increase"]);

square[8] = new Square("lobby1", "lobby");

square[9] = new Bill("law-administrative", 2, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"]);
square[10] = new Bill("law-criminal", 2, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"]);
square[11] = new Bill("law-procedural", 2, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"]);

square[12] = new Square("chance1", "chance");

square[13] = new Bill("speech-assembly", 3, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"]);
square[14] = new Bill("speech-press", 3, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"]);
square[15] = new Bill("speech-internet", 3, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"]);

square[16] = new Square("jail", "jail");

square[17] = new Bill("soe-taxes", 4, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"]);
square[18] = new Bill("soe-privileges", 4, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"]);
square[19] = new Bill("soe-control", 4, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["strengthen", "reformat", "ease"]);

square[20] = new Square("meeting1", "meeting");

square[21] = new Bill("business-taxes", 5, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["decrease", "reformat", "increase"]);
square[22] = new Bill("business-supervision", 5, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"]);
square[23] = new Bill("business-easy-doing", 5, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"]);

square[24] = new Square("vacation", "vacation");

square[25] = new Bill("elections-enter", 6, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"]);
square[26] = new Bill("elections-parties", 6, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"]);
square[27] = new Bill("elections-procedures", 6, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"]);

square[28] = new Square("com-chest3", "com-chest");

square[29] = new Bill("privacy-data", 7, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"]);
square[30] = new Bill("privacy-physical", 7, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["decrease", "reformat", "increase"]);
square[31] = new Bill("privacy-registry", 7, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["decrease", "reformat", "increase"]);

square[32] = new Square("lobby2", "lobby");

square[33] = new Bill("ecology-garbage", 8, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"]);
square[34] = new Bill("ecology-exhaust", 8, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["strengthen", "reformat", "ease"]);
square[35] = new Bill("ecology-fireprotection", 8, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["strengthen", "reformat", "ease"]);

square[36] = new Square("chance3", "chance");

square[37] = new Bill("foreign-invest-npo", 9, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"]);
square[38] = new Bill("foreign-invest-media", 9, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"]);
square[39] = new Bill("foreign-invest-commerse", 9, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"]);

square[40] = new Square("scandal", "scandal");

square[41] = new Bill("human-rights-movement", 10, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"]);
square[42] = new Bill("human-rights-self-defence", 10, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"]);
square[43] = new Bill("human-rights-trade", 10, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"]);

square[44] = new Square("meeting2", "meeting");

square[45] = new Bill("piar-ban", 11, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["amend"]);
square[46] = new Bill("piar-rename", 11, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["amend"]);
square[47] = new Bill("piar-create", 11, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["amend"]);

var communityChestCards = [];
var chanceCards = [];

communityChestCards.push(new TicketCard("amendCard", 1));
/*for (var i = 1; i <= 1; i++) {
    communityChestCards.push(new MoneyCard(i, true));
	chanceCards.push(new MoneyCard(i, true));
	chanceCards.push(new MoneyCard(i, false));
}
for (var i = 1; i <= 1; i++) {
    communityChestCards.push(new TicketCard("amendCard", i));
	chanceCards.push(new TicketCard("amendCard", i));
	chanceCards.push(new ActionCard("amendCard", i));
}
for (var i = 1; i <= 1; i++) {
    communityChestCards.push(new TicketCard("jailCard", i));
	chanceCards.push(new TicketCard("jailCard", i));
}
for (var i = 1; i <= 1; i++) {
    communityChestCards.push(new TicketCard("moveBillCard", i));
	chanceCards.push(new TicketCard("moveBillCard", i));
	chanceCards.push(new ActionCard("moveBillCard", i));
}
for (var i = 1; i <= 1; i++) {
    communityChestCards.push(new TicketCard("createBillCard", i));
	chanceCards.push(new TicketCard("createBillCard", i));
	chanceCards.push(new ActionCard("createBillCard", i));
}
for (var i = 1; i <= 1; i++) {
    communityChestCards.push(new TicketCard("gotoCard", i));
	chanceCards.push(new TicketCard("gotoCard", i));
	chanceCards.push(new ActionCard("gotoCard", i));
}
for (var i = 1; i <= 1; i++) {
    communityChestCards.push(new RatingCard(i, "assembly"));
	chanceCards.push(new RatingCard(i, "assembly"));
	chanceCards.push(new RatingCard(i, "assembly"));
}
for (var i = 1; i <= 1; i++) {
    communityChestCards.push(new RatingCard(i, "people"));
	chanceCards.push(new RatingCard(i, "people"));
	chanceCards.push(new RatingCard(i, "assembly"));
}
chanceCards.push(new GotoCard(i, "law"));
chanceCards.push(new GotoCard(i, "jail"));
chanceCards.push(new GotoCard(i, "vacation"));
chanceCards.push(new GotoCard(i, "meeting"));
chanceCards.push(new GotoCard(i, "lobby"));*/

function Party(text, difficulty, groupsReaction, specialization) {
    this.text = text;
	this.style = "russian-party " + text;
	this.difficulty = difficulty;
	this.bonus = 0.2;
	this.groupsReaction = {};
	for (var i = 0; i < groups.length; i++) {
        this.groupsReaction[groups[i].name] = groupsReaction[i];
    }
	this.specialization = [];
	for (var i = 0; i < specialization.length; i++) {
        this.specialization.push(groups[specialization[i]]);
    }
	
	
	switch (difficulty) {
        case 1: {
			this.partyFee = 20;
		} break;
		case 2: {
			this.partyFee = 50;
		} break;
		case 3: {
			this.partyFee = 100;
		} break;
		case 4: {
			this.partyFee = 200;
		} break;
		case 5: {
			this.partyFee = 300;
		} break;
    }
}

var players = [];

players[0]  = new Party("conservative",      1, [-1, -1, -1, -1,   -1, -1,   -1, -1, -1, -1,   -1,  1], [1,2,3,4,6]);
players[1]  = new Party("communist",         2, [-1,  1, -1, -1,    1, -1,    1, -1,  1, -1,   -1, -1], [1,4,5,10]);
players[2]  = new Party("populist",          2, [ 1,  1, -1, -1,    1,  1,    1, -1,  1, -1,    1,  1], [0,1,2,11]);
players[3]  = new Party("socialist",         3, [ 1, -1, -1,  1,   -1,  1,   -1, -1,  1, -1,    1,  1], [6,7,10]);
players[4]  = new Party("traditionalist",    3, [-1, -1, -1, -1,   -1, -1,   -1, -1, -1, -1,   -1,  1], [2,3,4]);
players[5]  = new Party("economist",         3, [ 1,  1,  1,  1,    1,  1,    1,  1,  1,  1,    1, -1], [1,5,9]);
players[6]  = new Party("democrat",          3, [ 1,  1,  1,  1,    1, -1,    1,  1,  1,  1,    1,  1], [0,3,6]);
players[7]  = new Party("liberal",           4, [ 1,  1,  1,  1,    1,  1,    1,  1,  1,  1,    1, -1], [3,10]);
players[8]  = new Party("green",             4, [ 1, -1, -1,  1,    1, -1,    1,  1,  1,  1,    1, -1], [5,8]);
players[9]  = new Party("monarchist",        4, [-1, -1, -1, -1,   -1, -1,   -1, -1, -1, -1,   -1,  1], [3,7]);
players[10] = new Party("right",             4, [ 1,  1,  1,  1,    1,  1,    1,  1,  1,  1,    1, -1], [5,9]);
players[11] = new Party("pirate",            4, [ 1,  1,  1,  1,    1,  1,    1,  1,  1,  1,    1, -1], [2,7]);
players[12] = new Party("ultraconservative", 4, [-1,  1, -1, -1,    1, -1,   -1, -1,  1, -1,   -1,  1], [3,7]);
players[13] = new Party("progressivist",     5, [ 1,  1,  1,  1,    1,  1,    1,  1,  1,  1,    1,  1], [4]);
players[14] = new Party("nationalist",       5, [ 1,  1,  1,  1,   -1, -1,    1,  1,  1, -1,    1,  1], [10]);
players[15] = new Party("libertartian",      5, [ 1,  1,  1,  1,    1,  1,    1,  1, -1,  1,    1,  1], [5]);
players[16] = new Party("marxist",           5, [-1,  1,  1,  1,    1,  1,    1, -1,  1, -1,    1, -1], [3]);

var difficultiesNames = ['easy', 'normal', 'hard', 'very hard', 'impossible']

var startPayment = 450;

var moneySign = ["", "к ₽"];

var lobbyTypes = ['interior', 'soe', 'local', 'business'];