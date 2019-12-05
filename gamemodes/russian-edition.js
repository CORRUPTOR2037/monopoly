function Square(name, style) {
	this.name = name;
	this.style = style;
	
	this.uiName = getString(style);
}
function Bill(name, groupNumber, prices, sides) {
	group = groups[groupNumber];
	
	this.name = name;
	this.style = group.style;
	this.group = group;
	this.owner = undefined;
	
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
function Card(text, action) {
	this.text = text;
	this.action = action;
}

function MoneyCard(index) {
	this.text = "money-card" + index;
	this.action = function(player) {
		player.money += 10 * Math.range(1, 20);
	}
}
function TicketCard(name, index) {
	this.text = "ticket-card-" + name + index;
	this.ticketName = name;
	this.action = function(player) {
		player.addTicket(this.ticketName);
	}
}
function AssemblyRatingCard(index) {
	this.text = "assembly-rating-card" + index;
	this.action = function(player) {
		player.assemblyRating += Math.range(1, 10);
	}
}
function PeopleRatingCard(index) {
	this.text = "assembly-rating-card" + index;
	this.action = function(player) {
		player.peopleRating += Math.range(1, 10);
	}
}

function corrections() {
	document.getElementById("cell1name").textContent = "Mediter-ranean Avenue";

	// Add images to enlarges.
	document.getElementById("enlarge5token").innerHTML += '<img src="images/train_icon.png" height="60" width="65" alt="" style="position: relative; bottom: 20px;" />';
	document.getElementById("enlarge15token").innerHTML += '<img src="images/train_icon.png" height="60" width="65" alt="" style="position: relative; top: -20px;" />';
	document.getElementById("enlarge25token").innerHTML += '<img src="images/train_icon.png" height="60" width="65" alt="" style="position: relative; top: -20px;" />';
	document.getElementById("enlarge35token").innerHTML += '<img src="images/train_icon.png" height="60" width="65" alt="" style="position: relative; top: -20px;" />';
	document.getElementById("enlarge12token").innerHTML += '<img src="images/electric_icon.png" height="60" width="48" alt="" style="position: relative; top: -20px;" />';
	document.getElementById("enlarge28token").innerHTML += '<img src="images/water_icon.png" height="60" width="78" alt="" style="position: relative; top: -20px;" />';
}

function utiltext() {
	return '&nbsp;&nbsp;&nbsp;&nbsp;If one "Utility" is owned rent is 4 times amount shown on dice.<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;If both "Utilitys" are owned rent is 10 times amount shown on dice.';
}

function transtext() {
	return '<div style="font-size: 14px; line-height: 1.5;">Rent<span style="float: right;">$25.</span><br />If 2 Railroads are owned<span style="float: right;">50.</span><br />If 3 &nbsp; &nbsp; " &nbsp; &nbsp; " &nbsp; &nbsp; "<span style="float: right;">100.</span><br />If 4 &nbsp; &nbsp; " &nbsp; &nbsp; " &nbsp; &nbsp; "<span style="float: right;">200.</span></div>';
}

function luxurytax() {
	addAlert(player[turn].name + " paid $100 for landing on Luxury Tax.");
	player[turn].pay(100, 0);

	landedPanel.show("You landed on Luxury Tax. Pay $100.");
}

function citytax() {
	addAlert(player[turn].name + " paid $200 for landing on City Tax.");
	player[turn].pay(200, 0);

	landedPanel.show("You landed on City Tax. Pay $200.");
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

for (var i = 1; i <= 1; i++) 
    communityChestCards.push(new MoneyCard(i));
for (var i = 1; i <= 1; i++) 
    communityChestCards.push(new TicketCard("amendCard", i));
for (var i = 1; i <= 1; i++) 
    communityChestCards.push(new TicketCard("jailCard", i));
for (var i = 1; i <= 1; i++) 
    communityChestCards.push(new TicketCard("moveBillCard", i));
for (var i = 1; i <= 1; i++) 
    communityChestCards.push(new TicketCard("createBillCard", i));
for (var i = 1; i <= 1; i++) 
    communityChestCards.push(new TicketCard("gotoCard", i));
for (var i = 1; i <= 1; i++) 
    communityChestCards.push(new AssemblyRatingCard(i));
for (var i = 1; i <= 1; i++) 
    communityChestCards.push(new PeopleRatingCard(i));



chanceCards[0] = new Card("GET OUT OF JAIL FREE. This card may be kept until needed or traded.", function(p) { p.chanceJailCard=true; updateOwned();});
chanceCards[1] = new Card("Make General Repairs on All Your Property. For each house pay $25. For each hotel $100.", function() { streetrepairs(25, 100);});
chanceCards[2] = new Card("Speeding fine $15.", function() { subtractamount(15, 'Chance');});
chanceCards[3] = new Card("You have been elected chairman of the board. Pay each player $50.", function() { payeachplayer(50, 'Chance');});
chanceCards[4] = new Card("Go back three spaces.", function() { gobackthreespaces();});
chanceCards[5] = new Card("ADVANCE TO THE NEAREST UTILITY. IF UNOWNED, you may buy it from the Bank. IF OWNED, throw dice and pay owner a total ten times the amount thrown.", function() { advanceToNearestUtility();});
chanceCards[6] = new Card("Bank pays you dividend of $50.", function() { addamount(50, 'Chance');});
chanceCards[7] = new Card("ADVANCE TO THE NEAREST RAILROAD. If UNOWNED, you may buy it from the Bank. If OWNED, pay owner twice the rental to which they are otherwise entitled.", function() { advanceToNearestRailroad();});
chanceCards[8] = new Card("Pay poor tax of $15.", function() { subtractamount(15, 'Chance');});
chanceCards[9] = new Card("Take a trip to Reading Rail Road. If you pass \"GO\" collect $200.", function() { advance(5);});
chanceCards[10] = new Card("ADVANCE to Boardwalk.", function() { advance(39);});
chanceCards[11] = new Card("ADVANCE to Illinois Avenue. If you pass \"GO\" collect $200.", function() { advance(24);});
chanceCards[12] = new Card("Your building loan matures. Collect $150.", function() { addamount(150, 'Chance');});
chanceCards[13] = new Card("ADVANCE TO THE NEAREST RAILROAD. If UNOWNED, you may buy it from the Bank. If OWNED, pay owner twice the rental to which they are otherwise entitled.", function() { advanceToNearestRailroad();});
chanceCards[14] = new Card("ADVANCE to St. Charles Place. If you pass \"GO\" collect $200.", function() { advance(11);});
chanceCards[15] = new Card("Go to Jail. Go Directly to Jail. Do not pass \"GO\". Do not collect $200.", function() { gotojail();});


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

var moneySign = ["", "к Р"];

var lobbyTypes = ['interior', 'soe', 'local', 'business'];