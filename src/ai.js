// The purpose of this AI is not to be a relistic opponant, but to give an example of a vaild AI player.
function AITest(p) {
	this.alertList = "";
	this.origin = p;

	// This variable is static, it is not related to each instance.
	if (this.constructor.count == undefined) {
        this.constructor.count = 0;
    }
	this.constructor.count++;

	p.name = "AI Test " + this.constructor.count;

	// Decide whether to buy a property the AI landed on.
	// Return: boolean (true to buy).
	// Arguments:
	// index: the property's index (0-39).
	this.buyProperty = function(index) {
		var s = square[index];

		if (p.money > s.buyPrice() + 50) {
			return true;
		} else {
			return false;
		}

	}

	// Determine the response to an offered trade.
	// Return: boolean/instanceof Trade: a valid Trade object to counter offer (with the AI as the recipient); false to decline; true to accept.
	// Arguments:
	// tradeObj: the proposed trade, an instanceof Trade, has the AI as the recipient.
	this.acceptTrade = function(tradeObj) {
		console.log("acceptTrade");

		/*var tradeValue = 0;
		var money = tradeObj.getMoney();
		var initiator = tradeObj.getInitiator();
		var recipient = tradeObj.getRecipient();
		var property = [];

		tradeValue += 10 * tradeObj.getCommunityChestJailCard();
		tradeValue += 10 * tradeObj.getChanceJailCard();

		tradeValue += money;

		for (var i = 0; i < 40; i++) {
			property[i] = tradeObj.getProperty(i);
			tradeValue += tradeObj.getProperty(i) * square[i].price * (square[i].mortgage ? 0.5 : 1);
		}

		console.log(tradeValue);

		var proposedMoney = 25 - tradeValue + money;

		if (tradeValue > 25) {
			return true;
		} else if (tradeValue >= -50 && initiator.money > proposedMoney) {

			return new Trade(initiator, recipient, proposedMoney, property, tradeObj.getCommunityChestJailCard(), tradeObj.getChanceJailCard());
		}

		return false;*/
	}

	// This function is called at the beginning of the AI's turn, before any dice are rolled. The purpose is to allow the AI to manage property and/or initiate trades.
	// Return: boolean: Must return true if and only if the AI proposed a trade.
	this.beforeTurn = function() {
		console.log("beforeTurn");
		/*
		var s;
		var allGroupOwned;
		var max;
		var leastHouseProperty;
		var leastHouseNumber;

		// Buy houses.
		for (var i = 0; i < 40; i++) {
			s = square[i];

			if (s.owner === p.index && s.groupNumber >= 3) {
				max = s.group.length;
				allGroupOwned = true;
				leastHouseNumber = 6; // No property will ever have 6 houses.

				for (var j = max - 1; j >= 0; j--) {
					if (square[s.group[j]].owner !== p.index) {
						allGroupOwned = false;
						break;
					}

					if (square[s.group[j]].house < leastHouseNumber) {
						leastHouseProperty = square[s.group[j]];
						leastHouseNumber = leastHouseProperty.house;
					}
				}

				if (!allGroupOwned) {
					continue;
				}

				if (p.money > leastHouseProperty.houseprice + 100) {
					buyHouse(leastHouseProperty.index);
				}


			}
		}

		// Unmortgage property
		for (var i = 39; i >= 0; i--) {
			s = square[i];

			if (s.owner === p.index && s.mortgage && p.money > s.price) {
				unmortgage(i);
			}
		}

		return false;*/
	}

	var utilityForRailroadFlag = true; // Don't offer this trade more than once.


	// This function is called every time the AI lands on a square. The purpose is to allow the AI to manage property and/or initiate trades.
	// Return: boolean: Must return true if and only if the AI proposed a trade.
	this.onLand = function() {
		console.log("onLand");
		
	}

	// Determine whether to post bail/use get out of jail free card (if in possession).
	// Return: boolean: true to post bail/use card.
	this.postBail = function() {
		console.log("postBail");

		// p.jailroll === 2 on third turn in jail.
		/*if ((p.communityChestJailCard || p.chanceJailCard) && p.jailroll === 2) {
			return true;
		} else {
			return false;
		}*/
	}

	// Mortgage enough properties to pay debt.
	// Return: void: don't return anything, just call the functions mortgage()/sellhouse()
	this.payDebt = function() {
		console.log("payDebt");
		/*for (var i = 39; i >= 0; i--) {
			s = square[i];

			if (s.owner === p.index && !s.mortgage && s.house === 0) {
				mortgage(i);
				console.log(s.name);
			}

			if (p.money >= 0) {
				return;
			}
		}*/

	}
	
	var self = this;
	this.rollLobby = function(){
		lobbyTypes.forEach(function(key){
			key = key.name;
            if (Math.random() > 0.5) 
				self.origin.setLobbyRating(key, self.origin.lobby[key] + self.origin.party.lobbyAddition(game.rollDice()));
        });
	}
	
	this.rollVacation = function(){
		if (self.origin.money > Math.random() > self.origin.party.difficulty * 0.2)
			sendToVacation(self.origin, self.origin.party.defaultVacation);
	}

	// Determine what to bid during an auction.
	// Return: integer: 0 for pass, a positive value for the bid.
	this.bid = function(property, currentBid) {
		
		if (Math.random() > 0.8)  return 0;

		var bid;
		bid = currentBid + Math.round(Math.random() * property.price().buy + 1);
		if (p.money < bid + 50 || bid > property.price().buy * 5) {
			return 0;
		} else {
			return bid;
		}

	}
}
