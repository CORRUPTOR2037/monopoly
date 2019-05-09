function Square(name, onVisit, style) {
	this.name = name;
	this.onVisit = onVisit;
	this.style = style;
}
function Bill(name, groupNumber, prices) {
	group = groups[groupNumber];
	
	this.name = name;
	this.onVisit = landOnBill;
	this.style = group.style;
	this.group = group;
	this.owner = undefined;
	
	this.state = 0;
	this.amendments = 0;
	
	this.prices = prices;
	
	var self = this;
	this.price = function(){ return self.prices[self.state]; }
	
	this.acceptPropose = function(player){
		self.state++;
	};
	this.refusPropose = function(){
		game.addPropertyToAuctionQueue(self);
	};
	
	this.moveState = function(){
		self.state++;
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

function Visit(text, set_args, add_args) {
    this.text = text;
	this.set_args = set_args;
	this.add_args = add_args;
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

	$("#landed").show().text("You landed on Luxury Tax. Pay $100.");
}

function citytax() {
	addAlert(player[turn].name + " paid $200 for landing on City Tax.");
	player[turn].pay(200, 0);

	$("#landed").show().text("You landed on City Tax. Pay $200.");
}

function Group(name) {
    this.name = name;
	this.style = name;
}

var square = [];
squareSize = [17, 9];
cellsCount = 48;

var groups = [
	new Group("self-gov"),
	new Group("taxes"),
	new Group("law"),
	new Group("speech"),
	new Group("monopoly"),
	new Group("business"),
	new Group("elections"),
	new Group("privacy"),
	new Group("ecology"),
	new Group("foreign-invest"),
	new Group("human-rights"),
	new Group("piar")
]

function addCommunityCard(square, player) {
    if (!p.human) {
		popup(p.AI.alertList, chanceCommunityChest);
		p.AI.alertList = "";
	} else {
		chanceCommunityChest();
	}
}
function lobby(square, player) {
    
}
function chance(square, player) {
    
}
function corruption_visit(square, player) {
    
}
function corruption_take(square, player) {
    updateMoney();
	updatePosition();

	if (p.human) {
		popup("<div>Go to jail. Go directly to Jail. Do not pass GO. Do not collect $200.</div>", goToJail);
	} else {
		gotojail();
	}
}
function meeting(square, player) {

}
function vacation(square, player) {

}
function scandal(square, player) {

}

function landOnBill(square, player) {
    // Allow player to buy the property on which he landed.
	if (square.price !== 0 && square.state == 0) {
		if (!player.human) {
			if (player.AI.buyProperty(p.position)) {
				square.acceptPropose(player);
			} else {
				square.refusePropose();
			}
		} else {
			updateOptions(["buy"]);
		}
	}

	/*// Collect rent
	if (s.price !== 0 && s.state > 0 && s.owner != turn) {
		var rent = s.price().visit;

		addAlert(p.name + getString("amended-to") + getString(s.name) + ".");
		p.pay(s.price().visit);

		document.getElementById("landed").innerHTML = "You landed on " + s.name + ". " + player[s.owner].name + " collected $" + rent + " rent.";
	} else if (s.owner > 0 && s.owner != turn && s.mortgage) {
		document.getElementById("landed").innerHTML = "You landed on " + s.name + ". Property is mortgaged; no rent was collected.";
	}*/
}


square[0] = new Square("new-session", new Visit("new-session-collect", {'energy': 100}, {'money':100}), "new-session");

square[1] = new Bill("self-gov-rights", 0, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[2] = new Bill("self-gov-budget", 0, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[3] = new Bill("self-gov-elections", 0, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

square[4] = new Square("com-chest1", addCommunityCard, "com-chest");

square[5] = new Bill("taxes-public-utility", 1, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[6] = new Bill("taxes-self-employment", 1, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[7] = new Bill("taxes-indirect", 1, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

square[8] = new Square("lobby1", lobby, "lobby");

square[9] = new Bill("law-administrative", 2, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[10] = new Bill("law-criminal", 2, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[11] = new Bill("law-procedural", 2, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

square[12] = new Square("chance1", chance, "chance");

square[13] = new Bill("speech-assembly", 3, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[14] = new Bill("speech-press", 3, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[15] = new Bill("speech-internet", 3, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

square[16] = new Square("jail", corruption_visit, "jail");

square[17] = new Bill("monopoly-taxes", 4, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[18] = new Bill("monopoly-privileges", 4, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[19] = new Bill("monopoly-control", 4, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

square[20] = new Square("meeting1", meeting, "meeting");

square[21] = new Bill("business-taxes", 5, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[22] = new Bill("business-supervision", 5, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[23] = new Bill("business-easy-doing", 5, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

square[24] = new Square("vacation", vacation, "vacation");

square[25] = new Bill("elections-enter", 6, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[26] = new Bill("elections-parties", 6, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[27] = new Bill("elections-procedures", 6, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

square[28] = new Square("com-chest3", addCommunityCard, "com-chest");

square[29] = new Bill("privacy-data", 7, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[30] = new Bill("privacy-physical", 7, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[31] = new Bill("privacy-registry", 7, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

square[32] = new Square("lobby2", lobby, "lobby");

square[33] = new Bill("ecology-garbage", 8, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[34] = new Bill("ecology-gas-exhaust", 8, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[35] = new Bill("ecology-animals", 8, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

square[36] = new Square("chance3", chance, "chance");

square[37] = new Bill("foreign-invest-npo", 9, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[38] = new Bill("foreign-invest-media", 9, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[39] = new Bill("foreign-invest-commerse", 9, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

square[40] = new Square("scandal", scandal, "scandal");

square[41] = new Bill("human-rights-movement", 10, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[42] = new Bill("human-rights-self-defence", 10, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[43] = new Bill("human-rights-trade", 10, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

square[44] = new Square("meeting2", meeting, "meeting");

square[45] = new Bill("piar-ban", 11, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[46] = new Bill("piar-rename", 11, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);
square[47] = new Bill("piar-create", 11, [
	new Price(5, 5), new Price(10, 10), new Price(15, 15)
]);

var communityChestCards = [];
var chanceCards = [];

communityChestCards[0] = new Card("Get out of Jail, Free. This card may be kept until needed or sold.", function(p) { p.communityChestJailCard = true; updateOwned();});
communityChestCards[1] = new Card("You have won second prize in a beauty contest. Collect $10.", function() { addamount(10, 'Community Chest');});
communityChestCards[2] = new Card("From sale of stock, you get $50.", function() { addamount(50, 'Community Chest');});
communityChestCards[3] = new Card("Life insurance matures. Collect $100.", function() { addamount(100, 'Community Chest');});
communityChestCards[4] = new Card("Income tax refund. Collect $20.", function() { addamount(20, 'Community Chest');});
communityChestCards[5] = new Card("Holiday fund matures. Receive $100.", function() { addamount(100, 'Community Chest');});
communityChestCards[6] = new Card("You inherit $100.", function() { addamount(100, 'Community Chest');});
communityChestCards[7] = new Card("Receive $25 consultancy fee.", function() { addamount(25, 'Community Chest');});
communityChestCards[8] = new Card("Pay hospital fees of $100.", function() { subtractamount(100, 'Community Chest');});
communityChestCards[9] = new Card("Bank error in your favor. Collect $200.", function() { addamount(200, 'Community Chest');});
communityChestCards[10] = new Card("Pay school fees of $50.", function() { subtractamount(50, 'Community Chest');});
communityChestCards[11] = new Card("Doctor's fee. Pay $50.", function() { subtractamount(50, 'Community Chest');});
communityChestCards[12] = new Card("It is your birthday. Collect $10 from every player.", function() { collectfromeachplayer(10, 'Community Chest');});
communityChestCards[13] = new Card("Advance to \"GO\" (Collect $200).", function() { advance(0);});
communityChestCards[14] = new Card("You are assessed for street repairs. $40 per house. $115 per hotel.", function() { streetrepairs(40, 115);});
communityChestCards[15] = new Card("Go to Jail. Go directly to Jail. Do not pass \"GO\". Do not collect $200.", function() { gotojail();});


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


function Party(text, difficulty) {
    this.text = text;
	this.style = "russian-party " + text;
	this.difficulty = difficulty;
	this.bonus = 0.2;
}

var players = [];

players[0] = new Party("conservative", 1);
players[1] = new Party("communist", 2);
players[2] = new Party("populist", 2);
players[3] = new Party("socialist", 3);
players[4] = new Party("traditionalist", 3);
players[5] = new Party("economist", 3);
players[6] = new Party("democrat", 3);
players[7] = new Party("liberal", 4);
players[8] = new Party("green", 4);
players[9] = new Party("monarchist", 4);
players[10] = new Party("right", 4);
players[11] = new Party("pirate", 4);
players[12] = new Party("ultraconservative", 4);
players[13] = new Party("progressivist", 5);
players[14] = new Party("nationalist", 5);
players[15] = new Party("libertartian", 5);
players[16] = new Party("marxist", 5);

var difficultiesNames = ['easy', 'normal', 'hard', 'very hard', 'impossible']

var startPayment = 450;

var moneySign = ["", "к Р"];