function Square(name, style) {
	this.name = name;
	this.style = style;
	this.type = style;
	
	this.uiName = getString(style);
}
function Bill(name, groupNumber, prices, sides, icon) {
	group = groups[groupNumber];
	
	this.name = name;
	this.style = group.style;
	this.group = group;
	this.owner = undefined;
	this.type = "bill";
	this.icon = icon;
	
	this.state = 0;
	this.amendments = 0;
	this.direction = 0;
	this.forceMove = false;
	this.negativeReaction = 0;
	
	this.prices = prices;
	
	this.sides = sides;
	for (var i = 0; i < sides.length; i++) {
        this.sides[i] = getString("buy-side-" + this.sides[i]);
    }
	
	this.uiName = getString(this.style) + ": " + getString(this.name)
	
	this.buyPrice = function(){ return this.prices[this.state].buy; }
	this.visitPrice = function(){ return this.prices[this.state-1].visit; }
	
	this.refusePropose = function(){};
	
	this.moveState = function(){
		this.state++;
		this.negativeReaction = false;
		if (this.forceMove) {
            this.forceMove = false;
        }
	};
	
	this.revertState = function() {
		this.state--;
		this.negativeReaction = false;
		if (this.forceMove) {
            this.forceMove = false;
        }
		if (this.state == 0) {
            this.owner = undefined;
			this.amendments = 0;
			this.direction = 0;
        }
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
function MissMoveCard(index) {
	this._text = "miss-move-card-" + index;
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
            player.setAssemblyRating(player.assemblyRating + this.amount);
		} else if (this.type == "people") {
            player.setPeopleRating(player.peopleRating + this.amount);
        } else return;
		if (this.positive) {
            gameLog.add(getString("increased-" + this.type + "-rating").replace("%player", p.name).replace("%amount", this.amount), p, 1);
        } else {
			gameLog.add(getString("decreased-" + this.type + "-rating").replace("%player", p.name).replace("%amount", this.amount), p, -1);
        }
		updateMoney();
	}
}
function GotoCard(position, name) {
	this._text = getString("goto-" + name);
	this.text = () => this._text;
	this.position = position;
	this.randomize = () => {};
	this.action = function(player) {
		player.position = this.position;
		land();
	}
}
function ChangePartyOfferCard(index) {
	this.text = getString("change-party" + index);
	this.randomize = () => {};
	this.action = function(player) {
		player.addTicket(this.ticketName);
		gameLog.add(getString("player-changed-party").replace("%player", p.name).replace("%partyName", this.ticketName + "-title"), p, 1);
		updateTickets();
	}
}
function Lobby(name, bonuses) {
    this.name = name;
	this.bonuses = bonuses;
}
function VacationType(name, cost, peopleRatingLoss, assemblyRatingLoss) {
    this.name = name;
	this.cost = cost;
	this.peopleRatingLoss = peopleRatingLoss;
	this.assemblyRatingLoss = assemblyRatingLoss;
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
], ["increase", "reformat", "decrease"], 'fa-book');
square[2] = new Bill("self-gov-budget", 0, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"], 'fa-money');
square[3] = new Bill("self-gov-elections", 0, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"], 'fa-sign-in');

square[4] = new Square("com-chest1", "com-chest");

square[5] = new Bill("taxes-public-utility", 1, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["strengthen", "reformat", "ease"], 'fa-shower');
square[6] = new Bill("taxes-self-employment", 1, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["decrease", "reformat", "increase"], 'fa-male');
square[7] = new Bill("taxes-indirect", 1, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["decrease", "reformat", "increase"], 'fa-shopping-cart');

square[8] = new Square("lobby1", "lobby");

square[9] = new Bill("law-administrative", 2, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"], 'fa-legal');
square[10] = new Bill("law-criminal", 2, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"], 'fa-slack');
square[11] = new Bill("law-procedural", 2, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"], 'fa-thumb-tack');

square[12] = new Square("chance1", "chance");

square[13] = new Bill("speech-assembly", 3, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"], 'fa-users');
square[14] = new Bill("speech-press", 3, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"], 'fa-newspaper-o');
square[15] = new Bill("speech-internet", 3, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"], 'fa-globe');

square[16] = new Square("jail", "jail");

square[17] = new Bill("soe-taxes", 4, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"], 'fa-scissors');
square[18] = new Bill("soe-privileges", 4, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"], 'fa-arrows-alt');
square[19] = new Bill("soe-control", 4, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["strengthen", "reformat", "ease"], 'fa-black-tie');

square[20] = new Square("meeting1", "meeting");

square[21] = new Bill("business-taxes", 5, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["decrease", "reformat", "increase"], 'fa-balance-scale');
square[22] = new Bill("business-supervision", 5, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"], 'fa-search');
square[23] = new Bill("business-easy-doing", 5, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"], 'fa-copy');

square[24] = new Square("vacation", "vacation");

square[25] = new Bill("elections-enter", 6, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"], 'fa-address-card');
square[26] = new Bill("elections-parties", 6, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"], 'fa-building');
square[27] = new Bill("elections-procedures", 6, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"], 'fa-briefcase');

square[28] = new Square("com-chest3", "com-chest");

square[29] = new Bill("privacy-data", 7, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["increase", "reformat", "decrease"], 'fa-cloud');
square[30] = new Bill("privacy-physical", 7, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["decrease", "reformat", "increase"], 'fa-binoculars');
square[31] = new Bill("privacy-registry", 7, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["decrease", "reformat", "increase"], 'fa-server');

square[32] = new Square("lobby2", "lobby");

square[33] = new Bill("ecology-garbage", 8, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"], 'fa-recycle');
square[34] = new Bill("ecology-exhaust", 8, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["strengthen", "reformat", "ease"], 'fa-industry');
square[35] = new Bill("ecology-fireprotection", 8, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["strengthen", "reformat", "ease"], 'fa-tree');

square[36] = new Square("chance3", "chance");

square[37] = new Bill("foreign-invest-npo", 9, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"], 'fa-plus-circle');
square[38] = new Bill("foreign-invest-media", 9, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"], 'fa-paper-plane');
square[39] = new Bill("foreign-invest-commerse", 9, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"], 'fa-bank');

square[40] = new Square("scandal", "scandal");

square[41] = new Bill("human-rights-movement", 10, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"], 'fa-plane');
square[42] = new Bill("human-rights-self-defence", 10, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["ease", "reformat", "strengthen"], 'fa-shield');
square[43] = new Bill("human-rights-trade", 10, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["simplify", "reformat", "complicate"], ' fa-shopping-basket');

square[44] = new Square("meeting2", "meeting");

square[45] = new Bill("piar-ban", 11, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["amend"], ' fa-remove');
square[46] = new Bill("piar-rename", 11, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["amend"], ' fa-quote-right');
square[47] = new Bill("piar-create", 11, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
], ["amend"], ' fa-check');

var communityChestCards = [];
var chanceCards = [];

for (var i = 1; i <= 3; i++) {
    communityChestCards.push(new MoneyCard(i, true));
	chanceCards.push(new MoneyCard(i, true));
	chanceCards.push(new MoneyCard(i, false));
}
for (var i = 1; i <= 1; i++) {
    communityChestCards.push(new TicketCard("rejectBillCard", i));
	chanceCards.push(new TicketCard("rejectBillCard", i));
	chanceCards.push(new ActionCard("rejectBillCard", i));
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
for (var i = 4; i <= 44; i+=4){
	chanceCards.push(new GotoCard(i, "jail"));
}
//chanceCards.push(new ChangePartyOfferCard(i));


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
	this.startPeopleRating = 50;
	
	switch (difficulty) {
        case 1: {
			this.fee = 20;
			this.maxPeopleRating = 100;
			this.maxAssemblyRating = 100;
			this.lobbyPayment = 25;
			this.startAssemblyRating = 50;
			this.lobbyRollBarrier = 3;
			this.starterCards = ["jailCard", "rejectBillCard", "moveBillCard", "createBillCard", "gotoCard"];
			this.defaultVacation = 1;
		} break;
		case 2: {
			this.fee = 50;
			this.maxPeopleRating = 90;
			this.maxAssemblyRating = 80;
			this.lobbyPayment = 20;
			this.startAssemblyRating = 40;
			this.lobbyRollBarrier = 4;
			this.starterCards = ["rejectBillCard", "moveBillCard", "createBillCard", "gotoCard"];
			this.defaultVacation = 2;
		} break;
		case 3: {
			this.fee = 100;
			this.maxPeopleRating = 80;
			this.maxAssemblyRating = 60;
			this.lobbyPayment = 15;
			this.startAssemblyRating = 30;
			this.lobbyRollBarrier = 4;
			this.starterCards = ["rejectBillCard", "moveBillCard", "gotoCard"];
			this.defaultVacation = 3;
		} break;
		case 4: {
			this.fee = 150;
			this.maxPeopleRating = 70;
			this.maxAssemblyRating = 40;
			this.lobbyPayment = 10;
			this.startAssemblyRating = 20;
			this.lobbyRollBarrier = 5;
			this.starterCards = ["rejectBillCard", "gotoCard"];
			this.defaultVacation = 4;
		} break;
		case 5: {
			this.fee = 200;
			this.maxPeopleRating = 60;
			this.maxAssemblyRating = 20;
			this.lobbyPayment = 5;
			this.startAssemblyRating = 10;
			this.lobbyRollBarrier = 5;
			this.starterCards = ["rejectBillCard"];
			this.defaultVacation = 5;
		} break;
    }
	
	this.lobbyAddition = function(dice){
		return dice - this.lobbyRollBarrier + ((dice >= this.lobbyRollBarrier) ? 1 : 0);
	}
}

var players = [];

players[0]  = new Party("conservative",      1, [-1, -1, -1, -1,   -1, -1,   -1, -1,  0, -1,    0,  1], [1,2,3,4,6]);
players[1]  = new Party("communist",         2, [ 0,  1, -1,  0,    1, -1,    1,  0,  0, -1,   -1,  1], [1,4,5,10]);
players[2]  = new Party("populist",          2, [ 1,  1, -1, -1,    1,  1,    1, -1,  1, -1,    1,  1], [0,1,2,11]);
players[3]  = new Party("socialist",         3, [ 1, -1,  0,  0,    0,  0,    0,  0,  1,  0,    1,  0], [6,7,10]);
players[4]  = new Party("traditionalist",    3, [ 0,  0, -1, -1,   -1, -1,   -1, -1, -1, -1,   -1,  1], [2,3,4]);
players[5]  = new Party("economist",         3, [ 1,  1,  1,  1,    1,  1,    0,  0,  0,  0,    1,  0], [1,5,9]);
players[6]  = new Party("democrat",          3, [ 1,  0,  0,  1,    0, -1,    1,  0,  1,  1,    1,  1], [0,3,6]);
players[7]  = new Party("liberal",           4, [ 1,  1,  1,  1,    1,  1,    1,  1,  1,  1,    1,  0], [3,10]);
players[8]  = new Party("green",             4, [ 1, -1, -1,  0,    1, -1,    0,  0,  1,  1,    0,  0], [5,8]);
players[9]  = new Party("monarchist",        4, [-1, -1, -1, -1,   -1, -1,   -1, -1,  0,  0,    0,  0], [3,7]);
players[10] = new Party("rightparty",        4, [ 1,  1,  1,  1,    1,  1,    1,  1,  1,  1,    1,  0], [5,9]);
players[11] = new Party("pirate",            4, [ 0,  0,  1,  1,    0,  1,    1,  1,  0,  1,    0,  0], [2,7]);
players[12] = new Party("ultraconservative", 4, [-1,  1, -1, -1,    1, -1,   -1, -1,  0, -1,   -1,  1], [3,7]);
players[13] = new Party("progressivist",     5, [ 1,  1,  1,  1,    1,  1,    1,  1,  1,  1,    1,  1], [4]);
players[14] = new Party("nationalist",       5, [ 0,  0,  1,  1,   -1,  0,    0,  0,  0,  0,    1,  1], [10]);
players[15] = new Party("libertartian",      5, [ 1,  1,  1,  1,    1,  1,    1,  1, -1,  1,    1,  1], [5]);
players[16] = new Party("marxist",           5, [-1,  1,  1,  1,    1,  1,    1, -1,  1, -1,    1, -1], [3]);

var rulingParty = players[0];

var difficultiesNames = ['easy', 'normal', 'hard', 'very hard', 'impossible']

var startPayment = 450;

var moneySign = ["", "к ₽"];

var lobbyLevelLength = 5;
var lobbyProgressLength = 21;
var lobbyTypes = [
	new Lobby('security', [2, 7, 10]),
	new Lobby('soe', [1, 4, 9]),
	new Lobby('executive', [3, 6, 11]),
	new Lobby('business', [0, 5, 8])
];


var vacationTypes = [
	new VacationType('maldives', 150, 6, 0),
	new VacationType('france', 80, 3, 0),
	new VacationType('bulgary', 40, 0, 0),
	new VacationType('black-sea', 25, 0, 3),
	new VacationType('golden-ring', 10, 0, 6),
]
var vacationDuration = 2;

var amendMultiplier = 0.2;