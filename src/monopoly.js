var game;

var player;

var turn = 0;

// Overwrite an array with numbers from one to the array's length in a random order.
Array.prototype.randomize = function(length) {
	length = (length || this.length);
	var num;
	var indexArray = [];

	for (var i = 0; i < length; i++)
		indexArray[i] = i;

	for (var i = 0; i < length; i++) {
		// Generate random number between 0 and indexArray.length - 1.
		num = Math.floor(Math.random() * indexArray.length);
		this[i] = indexArray[num] + 1;

		indexArray.splice(num, 1);
	}
};

function wrapMoney(amount) {
    return moneySign[0] + amount + moneySign[1];
}


// Game Panels

function GameLog() {
	this.log = $("#game-log");
	
	this.add = function(alertText, playerInfo, color){
		playerInfo = playerInfo ? '<div class="party-icon ' + playerInfo.style + '"></div>' : "";
		color = (color && color != 0) ? (' class="' + (color > 0 ? "gain" : "loss") + '"') : "";

		alertText = "<span" + color + ">" + alertText + "</span>";
		$(document.createElement("div")).html(playerInfo + alertText).appendTo(this.log);

		// Animate scrolling down alert element.
		this.scrollTop();
	
		if (!player[turn].human) {
			player[turn].AI.alertList += "<div>" + alertText + "</div>";
		}
	}
	this.scrollTop = function(){
		this.log.stop().animate({"scrollTop": this.log.prop("scrollHeight")}, 1000);
	}
}
var gameLog = new GameLog();

function Alert() {
	this.popup = $("#popup");
	this.text = $("#popup-text");

	this.showAccept = function(HTML, action) {
		this.text.html(HTML);
		this.text.append("<div><button id='popupclose'>" + getString("OK") + "</button></div>");
		
		$("#popupclose").on("click", this.fadeOut).on('click', action).focus();
		this.fadeIn();
	}
	this.showConfirm = function(HTML, action) {
		this.text.html(HTML);
		this.text.append("<div><button id='popupyes'>" + getString("yes") + "</button><button id='popupno'>" + getString("no") + "</button></div>");
	
		$("#popup-yes, #popup-no").off("click").on("click", this.fadeOut);
	
		$("#popup-yes").on("click", action);
		this.fadeIn();
	}
	this.showInput = function(HTML, action) {
		this.text.html(HTML);
		this.text.append("<div><input id='popup-input'/><button id='popup-accept'>" + getString("OK") + "</button><button id='popup-pass'>" + getString("pass") + "</button></div>");
		
		$("#popup-accept").on("click", this.fadeOut).on('click', function(){
			action($('#popup-input').val());
		}).focus();
		$("#popup-pass").on("click", this.fadeOut).on('click', function(){
			action();
		}).focus();
		this.fadeIn();
	}
	this.showChoose = function(HTML, buttons, actions) {
		this.text.html(HTML);
		
		HTML = "";
		for (var i = 0; i < buttons.length; i++){
			HTML += "<button id='popup-" + buttons[i] + "'>" + getString(buttons[i]) + "</button>";
		}
		this.text.append("<div>" + HTML + "</div>");
	
		for (var i = 0; i < buttons.length; i++){
			let j = i;
			$("#popup-" + buttons[i]).off("click").on("click", this.fadeOut).on('click', function() {
				if (Array.isArray(actions)) actions[j]();
                else actions(j);
			});
		}
	
		this.fadeIn();
	}
	this.fadeIn = function(){
		$("#popupbackground").fadeIn(400, function() {
			$("#popupwrap").show();
		});
	}
	this.fadeOut = function(){
		$("#popupwrap").hide();
		$("#popupbackground").fadeOut(400);
	}
}
var browserAlert = alert;
var alert = new Alert();


// 'enlarge' for mouse, 'control-enlarge' for center panel
function setEnlarge(square, enlargeID){
	var list = ["enlarge"]; square.classList.forEach(function(i){ list.push(i); });
	if (list[2] != "board-corner") {
        list[2] = "board-bottom";
    }
	$("#" + enlargeID)
			.removeClass()
			.addClass(list.join(' '))
			.html(square.innerHTML)
			.show();
	$("#" + enlargeID + " .chip-dock").remove();
}



function Buttons() {
    this.rollDices = $("#roll-dices");
	this.endTurn = $("#end-turn");
	this.buy = $("#buy-menu-item");
	this.manage = $("#manage-menu-item");
	
	this.update = function(items) {
		Array.from($("#menu .menu-item")).forEach(function(i){
			i.classList.add("hidden");
		});
		
		this.rollDices.hide();
		this.endTurn.hide();
		
		if (items != undefined && items.length > 0) {
			items.forEach(function(i){
				$("#menu #" + i + "-menu-item").removeClass("hidden");
			});
			if (items.includes('roll-dices')) this.rollDices.show();
			if (items.includes('end-turn')) this.endTurn.show();
		}
	}
	this.performEndTurn = function(){
		this.update();
		this.rollDices.hide();
		this.endTurn.show();
	}
	this.performRoll = function(){
		this.update();
		this.rollDices.show();
		this.endTurn.hide();
	}
}
var buttons = new Buttons();



function LandedPanel() {
    this.object = $("#landed");
	
	this.show = function(text){
		this.object.html(text);
		this.object.show();
	};
	this.hide = function(){
		this.object.hide();
	}
}
var landedPanel = new LandedPanel();



function Stats() {
    this.show = function(){
		var HTML, sq, p;
		var mortgagetext,
		housetext;
		var write;
		HTML = "<table align='center'><tr>";
	
		for (var x = 1; x < player.length; x++) {
			write = false;
			p = player[x];
			if (x == 5) {
				HTML += "</tr><tr>";
			}
			// Player name
			HTML += "<td class='statscell' id='statscell'><div class='statsplayername'>" +
					    '<div class="party-icon ' + p.style + '"></div>' +
						'<span class="p-name" >' + p.name + '</span></div>';
	
			// Player money
			HTML += "<span class='statscellheader'>" + getString('money-header') + ": " + p.money + "</span>";
			
			// Lobby info
			HTML += "<span class='statscellheader'>" + getString('lobby-header') + "</span><ul class='stats-lobby-rating'>";
			Object.keys(p.lobby).forEach(function(key) {
				HTML += "<li>" + getString('lobby-type-' + key) + ": " + p.lobby[key] + " " + getString("points") + "</li>";
			});
			HTML += "</ul>";
			
			for (var i = 0; i < cellsCount; i++) {
				sq = square[i];
	
				if (sq.owner == x) {
					mortgagetext = "",
					housetext = "";
	
					if (sq.mortgage) {
						mortgagetext = "title='Mortgaged' style='color: grey;'";
					}
	
					if (!write) {
						write = true;
						HTML += "<table>";
					}
	
					if (sq.house == 5) {
						housetext += "<span style='float: right; font-weight: bold;'>1&nbsp;x&nbsp;<img src='images/hotel.png' alt='' title='Hotel' class='hotel' style='float: none;' /></span>";
					} else if (sq.house > 0 && sq.house < 5) {
						housetext += "<span style='float: right; font-weight: bold;'>" + sq.house + "&nbsp;x&nbsp;<img src='images/house.png' alt='' title='House' class='house' style='float: none;' /></span>";
					}
	
					HTML += "<tr><td class='statscellcolor' style='background: " + sq.color + ";";
	
					if (sq.groupNumber == 1 || sq.groupNumber == 2) {
						HTML += " border: 1px solid grey;";
					}
	
					HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='statscellname' " + mortgagetext + ">" + sq.name + housetext + "</td></tr>";
				}
			}
	
			if (p.communityChestJailCard) {
				if (!write) {
					write = true;
					HTML += "<table>";
				}
				HTML += "<tr><td class='statscellcolor'></td><td class='statscellname'>Get Out of Jail Free Card</td></tr>";
	
			}
			if (p.chanceJailCard) {
				if (!write) {
					write = true;
					HTML += "<table>";
				}
				HTML += "<tr><td class='statscellcolor'></td><td class='statscellname'>Get Out of Jail Free Card</td></tr>";
	
			}
	
			if (!write) {
				HTML += p.name + " dosen't have any properties.";
			} else {
				HTML += "</table>";
			}
	
			HTML += "</td>";
		}
		HTML += "</tr></table><div id='titledeed'></div>";
	
		document.getElementById("statstext").innerHTML = HTML;
		// Show using animation.
		$("#statsbackground").fadeIn(400, function() {
			$("#statswrap").show();
		});
	}
	$("#viewstats").on("click", this.show);
	$("#statsclose, #statsbackground").on("click", function() {
		$("#statswrap").hide();
		$("#statsbackground").fadeOut(400);
	});
}
var stats = new Stats();


/*
 *
 * UPDATE MAP
 *
 */

function updatePosition() {
	p = player[turn];
	square[p.position].cell.getElementsByClassName("chip-dock")[0].appendChild(p.chip);
	setEnlarge(square[p.position].cell, "control-enlarge");
}

function updateMoney() {
	var currentPlayer = player[turn];

	$("#main-player-money").html(wrapMoney(currentPlayer.money));

	if (currentPlayer.money < 0) {
		buttons.rollDices.hide();
	}
}

function updateDice() {
	var die0 = game.getDie(1);
	var die1 = game.getDie(2);

	$("#die0").show();
	$("#die1").show();

	if (document.images) {
		var element0 = document.getElementById("die0");
		var element1 = document.getElementById("die1");

		element0.classList.remove("die-no-img");
		element1.classList.remove("die-no-img");

		element0.title = "Die (" + die0 + " spots)";
		element1.title = "Die (" + die1 + " spots)";

		if (element0.firstChild) {
			element0 = element0.firstChild;
		} else {
			element0 = element0.appendChild(document.createElement("img"));
		}

		element0.src = "images/Die_" + die0 + ".png";
		element0.alt = die0;

		if (element1.firstChild) {
			element1 = element1.firstChild;
		} else {
			element1 = element1.appendChild(document.createElement("img"));
		}

		element1.src = "images/Die_" + die1 + ".png";
		element1.alt = die0;
	} else {
		document.getElementById("die0").textContent = die0;
		document.getElementById("die1").textContent = die1;

		document.getElementById("die0").title = "Die";
		document.getElementById("die1").title = "Die";
	}
}

function updateOwned() {
	var currentPlayer = player[turn];
	var checkedproperty = getCheckedProperty();

	var count = 0;
	var squareItem;

	for (var i = 0; i < cellsCount; i++) {
		squareItem = square[i];
		if (squareItem.group == undefined) continue;
		if (squareItem.owner == turn) {
            count++;
        }
		
		$("#cell" + i + "owner").attr('class', "cell-owner " + (squareItem.owner > 0 ? player[squareItem.owner].style : "hidden"));
		$("#cell" + i + " .cell-spec").attr('class', "cell-spec" + (currentPlayer.party.specialization.includes(squareItem.group) ? " active" : ""));
		
		var array = $("#" + squareItem.cell.id + " .cell-card div");
		for (var j = 0; j < 3; j++) {
			array[j].className = "";
			if (i != currentPlayer.position || buttons.rollDices.is(":visible")) continue;
			if (j < squareItem.state) {
				array[j].className = "bill-state-green";
			} else if (j == squareItem.state && i == player[turn].position) {
				array[j].className = "bill-state-yellow";
            }
        }
		
		var amandments = $("#cell" + i + "amandments");
		if (squareItem.state == 0) {
            amandments.attr('class', 'hidden');
			continue;
        }
		
		var direction = Math.trunc(squareItem.direction * 100) / 100;
		if (direction > 0){
			direction = "+" + direction;
			amandments.attr('class', 'cell-amandments up');
		} else if (direction < 0) {
			amandments.attr('class', 'cell-amandments down');
		} else {
			amandments.attr('class', 'cell-amandments neutral');
		}
		amandments.html("<span class='cell-rating'>" + direction + "</span><br><span class='cell-paper'>" + squareItem.amendments + "</span>");
	}

	setEnlarge(square[p.position].cell, "control-enlarge");
	document.getElementById("owned").innerHTML =
		getString("review-bills-count") + count + " / " + getString("accepted-bills-count") + currentPlayer.acceptedBills + " / " + getString("rejected-bills-count") + currentPlayer.rejectedBills;
}

function chanceCommunityChest() {
	var p = player[turn];

	// Community Chest
	if (p.position === 2 || p.position === 17 || p.position === 33) {
		var communityChestIndex = communityChestCards.deck[communityChestCards.index];

		// Remove the get out of jail free card from the deck.
		if (communityChestIndex === 0) {
			communityChestCards.deck.splice(communityChestCards.index, 1);
		}

		alert.showAccept("<img src='images/community_chest_icon.png' style='height: 50px; width: 53px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>Community Chest:</div><div style='text-align: justify;'>" + communityChestCards[communityChestIndex].text + "</div>", function() {
			communityChestAction(communityChestIndex);
		});

		communityChestCards.index++;

		if (communityChestCards.index >= communityChestCards.deck.length) {
			communityChestCards.index = 0;
		}

	// Chance
	} else if (p.position === 7 || p.position === 22 || p.position === 36) {
		var chanceIndex = chanceCards.deck[chanceCards.index];

		// Remove the get out of jail free card from the deck.
		if (chanceIndex === 0) {
			chanceCards.deck.splice(chanceCards.index, 1);
		}

		alert.showAccept("<img src='images/chance_icon.png' style='height: 50px; width: 26px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>Chance:</div><div style='text-align: justify;'>" + chanceCards[chanceIndex].text + "</div>", function() {
			chanceAction(chanceIndex);
		});

		chanceCards.index++;

		if (chanceCards.index >= chanceCards.deck.length) {
			chanceCards.index = 0;
		}
	} else {
		if (!p.human) {
			p.AI.alertList = "";

			if (!p.AI.onLand()) {
				nextTurn();
			}
		}
	}
}

function chanceAction(chanceIndex) {
	var p = player[turn]; // This is needed for reference in action() method.

	// $('#popupbackground').hide();
	// $('#popupwrap').hide();
	chanceCards[chanceIndex].action(p);

	updateMoney();

	if (chanceIndex !== 15 && !p.human) {
		p.AI.alertList = "";
		nextTurn();
	}
}

function communityChestAction(communityChestIndex) {
	var p = player[turn]; // This is needed for reference in action() method.

	// $('#popupbackground').hide();
	// $('#popupwrap').hide();
	communityChestCards[communityChestIndex].action(p);

	updateMoney();

	if (communityChestIndex !== 15 && !p.human) {
		p.AI.alertList = "";
		nextTurn();
	}
}

function addamount(amount, cause) {
	var p = player[turn];

	p.money += amount;

	gameLog.add(p.name + " received $" + amount + " from " + cause + ".", p, +1);
}

function subtractamount(amount, cause) {
	var p = player[turn];

	p.pay(amount, 0);

	gameLog.add(p.name + " lost $" + amount + " from " + cause + ".", p, -1);
}

function gotojail() {
	var p = player[turn];
	gameLog.add(p.name + " was sent directly to jail.", p);
	landedPanel.show("You are in jail.");

	p.jail = true;
	game.doublecount = 0;

	buttons.endTurn();

	if (p.human) {
		buttons.rollDices.focus();
	}

	updatePosition();
	updateOwned();

	if (!p.human) {
		alert.showAccept(p.AI.alertList, game.next);
		p.AI.alertList = "";
	}
}

function gobackthreespaces() {
	var p = player[turn];

	p.position -= 3;

	land();
}

function payeachplayer(amount, cause) {
	var p = player[turn];
	var total = 0;

	for (var i = 1; i < player.length; i++) {
		if (i != turn) {
			player[i].money += amount;
			total += amount;
			creditor = p.money >= 0 ? i : creditor;

			p.pay(amount, creditor);
		}
	}

	gameLog.add(p.name + " lost $" + total + " from " + cause + ".", p, -1);
}

function collectfromeachplayer(amount, cause) {
	var p = player[turn];
	var total = 0;

	for (var i = 1; i < player.length; i++) {
		if (i != turn) {
			money = player[i].money;
			if (money < amount) {
				p.money += money;
				total += money;
				player[i].money = 0;
			} else {
				player[i].pay(amount, turn);
				p.money += amount;
				total += amount;
			}
		}
	}

	gameLog.add(p.name + " received $" + total + " from " + cause + ".", p, 1);
}

function streetrepairs(houseprice, hotelprice) {
	var cost = 0;
	for (var i = 0; i < cellsCount; i++) {
		var s = square[i];
		if (s.owner == turn) {
			if (s.hotel == 1)
				cost += hotelprice;
			else
				cost += s.house * houseprice;
		}
	}

	var p = player[turn];

	if (cost > 0) {
		p.pay(cost, 0);

		// If function was called by Community Chest.
		if (houseprice === 40) {
			gameLog.add(p.name + " lost $" + cost + " to Community Chest.", p, -1);
		} else {
			gameLog.add(p.name + " lost $" + cost + " to Chance.", p, -1);
		}
	}

}

function payfifty() {
	var p = player[turn];

	document.getElementById("jail").style.border = '1px solid black';
	document.getElementById("cell11").style.border = '2px solid ' + p.color;

	$("#landed").hide();
	doublecount = 0;

	p.jail = false;
	p.jailroll = 0;
	p.position = 10;
	p.pay(50, 0);

	gameLog.add(p.name + " paid the $50 fine to get out of jail.", p, -1);
	updateMoney();
	updatePosition();
}

function useJailCard() {
	var p = player[turn];

	document.getElementById("jail").style.border = '1px solid black';
	document.getElementById("cell11").style.border = '2px solid ' + p.color;

	$("#landed").hide();
	p.jail = false;
	p.jailroll = 0;

	p.position = 10;

	doublecount = 0;

	if (p.communityChestJailCard) {
		p.communityChestJailCard = false;

		// Insert the get out of jail free card back into the community chest deck.
		communityChestCards.deck.splice(communityChestCards.index, 0, 0);

		communityChestCards.index++;

		if (communityChestCards.index >= communityChestCards.deck.length) {
			communityChestCards.index = 0;
		}
	} else if (p.chanceJailCard) {
		p.chanceJailCard = false;

		// Insert the get out of jail free card back into the chance deck.
		chanceCards.deck.splice(chanceCards.index, 0, 0);

		chanceCards.index++;

		if (chanceCards.index >= chanceCards.deck.length) {
			chanceCards.index = 0;
		}
	}

	gameLog.add(p.name + " used a \"Get Out of Jail Free\" card.", p);
	updateOwned();
	updatePosition();
}

function buyHouse(index) {
	var sq = square[index];
	var p = player[sq.owner];
	var houseSum = 0;
	var hotelSum = 0;

	if (p.money - sq.houseprice < 0) {
		if (sq.house == 4) {
			return false;
		} else {
			return false;
		}

	} else {
		for (var i = 0; i < cellsCount; i++) {
			if (square[i].hotel === 1) {
				hotelSum++;
			} else {
				houseSum += square[i].house;
			}
		}

		if (sq.house < 4) {
			if (houseSum >= 32) {
				return false;

			} else {
				sq.house++;
				gameLog.add(p.name + " placed a house on " + sq.name + ".", p);
			}

		} else {
			if (hotelSum >= 12) {
				return;

			} else {
				sq.house = 5;
				sq.hotel = 1;
				gameLog.add(p.name + " placed a hotel on " + sq.name + ".", p);
			}
		}

		p.pay(sq.houseprice, 0);

		updateOwned();
		updateMoney();
	}
}

function sellHouse(index) {
	sq = square[index];
	p = player[sq.owner];

	if (sq.hotel === 1) {
		sq.hotel = 0;
		sq.house = 4;
		gameLog.add(p.name + " sold the hotel on " + sq.name + ".", p);
	} else {
		sq.house--;
		gameLog.add(p.name + " sold a house on " + sq.name + ".", p);
	}

	p.money += sq.houseprice * 0.5;
	updateOwned();
	updateMoney();
}

function buyChooseSide(playerIndex, bill, cost) {
	if (!playerIndex) {
        p = player[turn];
		playerIndex = turn;
		bill = square[p.position], 
		cost = bill.price().buy;
    }
	if (!player[playerIndex].AI) {
        alert.showChoose(getString("buy-choose-side-text"), bill.sides, function(index){
			buy(playerIndex, bill, cost, index == 0 ? 1 : -1);
		});
    } else {
		buy(playerIndex, bill, cost, player[playerIndex].party.groupsReaction[bill.style]);
	}
}

function buy(playerIndex, bill, cost, direction) {
	var p = player[playerIndex];

	if (p.money >= cost) {
		p.pay(cost);

		bill.owner = playerIndex;
		bill.direction += direction;
		bill.moveState();
		gameLog.add(getString("buy-message").replace("%player", p.name).replace("%name", bill.uiName).replace("%price", cost), p, -1);

		updateOwned();

	} else {
		if (!p.AI)
            alert.showAccept(getString("you-need-money").replace("%money", (cost - p.money)));
	}
	nextTurn();
}

function moveBill() {
    var p = player[turn];
	var bill = square[p.position];

	var cost = bill.price().buy;
	if (p.money >= cost) {
		p.pay(cost);
		bill.moveState();
		gameLog.add(getString("move-state-message").replace("%player", p.name).replace("%name", bill.uiName).replace("%price", cost), p, -1);

		updateOwned();

	} else {
		if (!p.AI)
            alert.showAccept(getString("you-need-money").replace("%money", (cost - p.money)));
	}
	nextTurn();
}

function passBuy() {
	var p = player[turn];
	var bill = square[p.position];
	if (bill.state == 0) {
        makeAuction();
    }
	buttons.performEndTurn();
}

function amend() {
	var p = player[turn];
	var bill = square[p.position];
    var rent = bill.price().visit;
			
	p.pay(bill.price().visit);
	bill.direction += p.party.groupsReaction[bill.style] * 0.1;
	bill.amendments++;
	gameLog.add(getString("amended-to").replace("%player", p.name).replace("%place", bill.uiName).replace("%price", rent), p, -1);
	
	nextTurn();
}


function makeAuction(bill){
	var auctionData = { 'index': 0, 'price': 0, 'next': 0, 'players': []};
	for (var i = 1; i < player.length; i++) 
		if (i != turn) auctionData['players'].push(i);
	
	makeAuctionRound(bill, auctionData);
}

function makeAuctionRound(bill, auctionData) {
	if (auctionData['next'] >= auctionData['players'].length) {
        auctionData['next'] = 0;
    }
	var playerIndex = auctionData['players'][auctionData['next']];
	if ((auctionData['players'].length == 1 && auctionData['index'] == playerIndex) || auctionData['players'].length == 0) {
		if (auctionData['price'] != 0) {
            buyChooseSide(auctionData['index'], bill, auctionData['price']);
        }
		return;
    }
	
	auctionData['next']++;
	
	
	var p = player[playerIndex];
		
	if (p.AI) {
			
            var offer = p.AI.bid(bill, auctionData['price']);
			if (offer > auctionData['price']) {
                auctionData['index'] = playerIndex;
				auctionData['price'] = offer;
            } else {
				auctionData['players'] = auctionData['players'].filter(function(item) {
					return item !== playerIndex
				});
				auctionData['next']--;
			}
			makeAuctionRound(bill, auctionData);
			
    } else {
			
			alert.showInput(
				'<h2>' + getString('auction') + '</h2>' + 
				getString("auction-how-much-message").replace("%player", p.name).replace("%place", bill.uiName).replace("%last", auctionData['price']),
				
				function(value){
					value = parseInt(value);
					if (value == value && value > auctionData['price'] && value <= p.money) {
                        auctionData['index'] = playerIndex;
						auctionData['price'] = value;		
                    } else {
						auctionData['players'] = auctionData['players'].filter(function(item) {
							return item !== playerIndex;
						});
						auctionData['next']--;
					}
					makeAuctionRound(bill, auctionData);
				}
			);
			
    }

}


function soldSoul() {
    //code
}

/*
 *
 *  ON VISIT EVENTS
 *
 */

function landOnBill(s, playerIndex) {
	var p = player[playerIndex];
    // Allow player to buy the property on which he landed.
	if (s.state == 0) {
		if (p.AI) {
			if (p.AI.buyProperty(p.position)) {
				buyChooseSide(playerIndex, s, s.price().buy);
			} else {
				makeAuction();
			}
			updateOwned();
		} else {
			buttons.update(["buy", "pass"]);
		}
		return;
	}

	// Collect rent
	if (s.state > 0){
		if (s.owner != turn) {
			if (p.AI){
				amend(playerIndex, s);
			} else {
				buttons.update(["amend"]);
			}
        } else {
			if (p.AI){
				moveBill(s);
			} else {
				buttons.update(['move']);
			}
		}
		return;
	} 
}

function addCommunityCard(square, player) {
    if (!p.human) {
		alert.showAccept(p.AI.alertList, chanceCommunityChest);
		p.AI.alertList = "";
	} else {
		chanceCommunityChest();
	}
	nextTurn();
}
function lobby(square, player) {
    nextTurn();
}
function chance(square, player) {
    nextTurn();
}
function corruptionVisit(square, player) {
    nextTurn();
}
function corruptionTake(square, player) {
    updateMoney();
	updatePosition();

	if (p.human) {
		alert.showAccept("<div>Go to jail. Go directly to Jail. Do not pass GO. Do not collect $200.</div>", goToJail);
	} else {
		gotojail();
	}
}
function meeting(square, player) {
	nextTurn();
}
function vacation(square, player) {
	nextTurn();
}
function scandal(square, player) {
	nextTurn();
}

/*
 *
 * HANDLING TURNS
 *
 */

function land() {
	
	var currentPlayer = player[turn];
	var s = square[p.position];

	var squareName = s.uiName;
	landedPanel.show(getString("you-landed").replace("#name", currentPlayer.name) + " " + squareName + ".");
	gameLog.add(getString("landed-on").replace("%player", currentPlayer.name).replace("%place", squareName), currentPlayer);
	
	updatePosition();

	console.log(currentPlayer + " " + s.style);
	if (currentPlayer.AI)
		currentPlayer.AI.onLand();
	s.onVisit(s, turn);

	updateMoney();
	updateOwned();
}

function roll() {
	var currentPlayer = player[turn];
	console.log(currentPlayer.name + " rolling");

	buttons.buy.show();
	buttons.manage.hide();

	if (currentPlayer.human) {
		buttons.rollDices.focus();
	}

	game.rollDice();
	var die1 = game.getDie(1);
	var die2 = game.getDie(2);
	
	gameLog.add(
		getString("rolled").replace("%player", currentPlayer.name).replace("%number", (die1 + die2)) +
		(die1 == die2 ? " - " + getString("doubles") + "." : "."), p
	);

	if (die1 == die2 && !currentPlayer.jail) {
		updateDice(die1, die2);

		if (game.doublecount < 3) {
			buttons.rollDices.attr('value', getString("roll-again"));
			buttons.rollDices.attr('title', getString("threw-doubles-title"));

		// If player rolls doubles three times in a row, send him to jail
		} else if (game.doublecount === 3) {
			currentPlayer.jail = true;
			game.doublecount = 0;
			gameLog.add(p.name + " rolled doubles three times in a row.");
			updateMoney();

			if (currentPlayer.human) {
				alert.showAccept(getString("go-to-jail-after-doubles"), goToJail);
			} else {
				gotojail();
			}

			return;
		}
	}

	updatePosition();
	updateMoney();
	updateOwned();

	if (currentPlayer.jail === true) {
		currentPlayer.jailroll++;

		updateDice(die1, die2);
		if (die1 == die2) {
			document.getElementById("jail").style.border = "1px solid black";
			document.getElementById("cell11").style.border = "2px solid " + p.color;
			$("#landed").hide();

			currentPlayer.jail = false;
			currentPlayer.jailroll = 0;
			currentPlayer.position = 10 + die1 + die2;
			doublecount = 0;

			gameLog.add(currentPlayer.name + " rolled doubles to get out of jail.", p);

			land();
		} else {
			if (currentPlayer.jailroll === 3) {

				if (currentPlayer.human) {
					alert.showAccept("<p>You must pay the $50 fine.</p>", function() {
						payFifty();
						payfifty();
						currentPlayer.position=10 + die1 + die2;
						land();
					});
				} else {
					payfifty();
					currentPlayer.position = 10 + die1 + die2;
					land();
				}
			} else {
				$("#landed").show();
				document.getElementById("landed").innerHTML = "You are in jail.";

				if (!currentPlayer.human) {
					alert.showAccept(currentPlayer.AI.alertList, game.next);
					currentPlayer.AI.alertList = "";
				}
			}
		}


	} else {
		updateDice(die1, die2);

		// Move player
		currentPlayer.position += die1 + die2;

		// Collect $200 salary as you pass GO
		if (currentPlayer.position >= cellsCount) {
			currentPlayer.position -= cellsCount;
			currentPlayer.money += startPayment - currentPlayer.party.partyFee;
			gameLog.add(getString("new-session-pay").replace("%player", currentPlayer.name).replace("%amount", wrapMoney(startPayment)), p, 1);
			gameLog.add(getString("party-fee-pay").replace("%player", currentPlayer.name).replace("%amount", wrapMoney(currentPlayer.party.partyFee)), p, -1);
		}

		land();
	}
}

function nextTurn() {
	console.log(player[turn].name + ' end ' + game.shouldEndTurn());
	var currentPlayer = player[turn];
	if (currentPlayer.AI){
		if (currentPlayer.money < 0) {
			currentPlayer.AI.payDebt();
	
			if (currentPlayer.money < 0) {
				popup("<p>" + p.name + " is bankrupt. All of its assets will be turned over to " + player[p.creditor].name + ".</p>", game.bankruptcy);
			} else {
				roll();
			}
		} else if (game.shouldEndTurn()) {
			play();
		} else {
			roll();
		}
	} else {
		if (game.shouldEndTurn()) {
			buttons.performEndTurn();
		} else {
			buttons.performRoll();
		}
	}
}

function play() {
	turn++;
	if (turn >= player.length) {
		turn = 1;
	}

	var currentPlayer = player[turn];
	console.log(currentPlayer.name + " start");
	game.resetDice();

	document.getElementById("main-player-name").innerHTML = currentPlayer.name;

	gameLog.add(getString("it-is-turn").replace("%player", currentPlayer.name), currentPlayer);

	// Check for bankruptcy.
	currentPlayer.pay(0);

	$("#landed, #option, #manage").hide();
	$("#board, #control, #moneybar, #viewstats, #buy").show();

	$("#die0").hide();
	$("#die1").hide();

	if (currentPlayer.jail) {
		$("#landed").show();
		document.getElementById("landed").innerHTML = "You are in jail.<input type='button' title='Pay $50 fine to get out of jail immediately.' value='Pay $50 fine' onclick='payfifty();' />";

		if (currentPlayer.communityChestJailCard || p.chanceJailCard) {
			document.getElementById("landed").innerHTML += "<input type='button' id='gojfbutton' title='Use &quot;Get Out of Jail Free&quot; card.' onclick='useJailCard();' value='Use Card' />";
		}

		document.getElementById("roll-dices").title = "Roll the dice. If you throw doubles, you will get out of jail.";

		if (currentPlayer.jailroll === 0)
			gameLog.add("This is " + currentPlayer.name + "'s first turn in jail.");
		else if (currentPlayer.jailroll === 1)
			gameLog.add("This is " + currentPlayer.name + "'s second turn in jail.");
		else if (currentPlayer.jailroll === 2) {
			document.getElementById("landed").innerHTML += "<div>NOTE: If you do not throw doubles after this roll, you <i>must</i> pay the $50 fine.</div>";
			gameLog.add("This is " + currentPlayer.name + "'s third turn in jail.");
		}

		if (currentPlayer.AI && currentPlayer.AI.postBail()) {
			if (currentPlayer.communityChestJailCard || currentPlayer.chanceJailCard) {
				useJailCard();
			} else {
				payfifty();
			}
		}
	}
	
	$(".moneybarcell").removeClass("selected");
	$("#moneybarrow" + turn + " .moneybarcell").addClass("selected");

	buttons.update();
	buttons.endTurn.hide();
	buttons.rollDices.show();
	updateMoney();
	updatePosition();
	updateOwned();

	if (currentPlayer.AI) {
		if (!currentPlayer.AI.beforeTurn()) {
			roll();
		}
	}
}

function cellInner(point, id){
	var content =
	    '<div class="cell-inner">' +
			'<div class="chip-dock"></div>';
	if (point.constructor.name == 'Bill') {
        content +=
			'<div class="cell-top-panel">' +
				'<div class="cell-owner hidden" id="cell' + id + 'owner"></div>' +
				'<div class="cell-amandments" id="cell' + id + 'amandments"></div>' +
			'</div>' +
			'<div class="cell-card">' +
			   '<span class="cell-cat">' + getString(point.group.name) + '</span>' +
		       '<span class="cell-name">' + getString(point.name) + '</span>' +
		       '<div><span class="cell-goal">' + getString('first-goal') + '</span><span class="cell-money">' + point.prices[0].buy + '/' + point.prices[0].visit + '</span></div>' +
		       '<div><span class="cell-goal">' + getString('second-goal') + '</span><span class="cell-money">' + point.prices[1].buy + '/' + point.prices[1].visit + '</span></div>' +
		       '<div><span class="cell-goal">' + getString('third-goal') + '</span><span class="cell-money">' + point.prices[2].buy + '/' + point.prices[2].visit + '</span></div>' +
			   '<div class="cell-spec"></div>' +
		   '</div>';
	}
	content +=
		'</div>';
	return content;
}

function setup() {
	game = new GameState();
	
	// Initialize players
	var pc = parseInt(document.getElementById("playernumber").value, 10);
	player = [ undefined ];

	for (var i = 1; i <= pc; i++) {
		var name  = document.getElementById("player" + i + "name").value,
		    party = players[document.getElementById("player" + i + "color").value],
			type  = document.getElementById("player" + i + "ai").value == 1;
		
		player.push(new Player(name, party, type));
		player[i].index = i;
	}

	// Switch panels
	$("#board, #moneybar").show();
	$("#setup").hide();

	
	// Shuffle decks
	function sort_deck(array) {
		array.index = 0;
		array.deck = [];
		for (var i = 0; i < array.length; i++) chanceCards.deck[i] = i;
		array.deck.sort(function() {return Math.random() - 0.5;});
    }
	sort_deck(chanceCards);
	sort_deck(communityChestCards);
	

	/*var enlargeWrap = document.body.appendChild(document.createElement("div"));

	enlargeWrap.id = "enlarge-wrap";

	var HTML = "";
	for (var i = 0; i < 40; i++) {
		HTML += "<div id='enlarge" + i + "' class='enlarge'>";
		HTML += "<div id='enlarge" + i + "color' class='enlarge-color'></div><br /><div id='enlarge" + i + "name' class='enlarge-name'></div>";
		HTML += "<br /><div id='enlarge" + i + "price' class='enlarge-price'></div>";
		HTML += "<br /><div id='enlarge" + i + "token' class='enlarge-token'></div></div>";
	}

	enlargeWrap.innerHTML = HTML;
	*/
	
	for (var i = 0; i < square.length; i++) {
		var point = square[i];
        if (point.constructor.name == 'Bill'){
			point.onVisit = landOnBill;
			continue;
		}
		switch (point.style) {
            case 'com-chest': point.onVisit = addCommunityCard; break;
			case 'lobby': point.onVisit = lobby; break;
			case 'chance': point.onVisit = chance; break;
			case 'jail': point.onVisit = corruptionVisit; break;
			case 'scandal': point.onVisit = corruptionTake; break;
			case 'meeting': point.onVisit = meeting; break;
			case 'vacation': point.onVisit = vacation; break;
			case 'new-session': point.onVisit = nextTurn; break;
        }

    }
	
	var board = document.createElement("table"), tr;
	    
	// Top
	tr = document.createElement("tr");
	/// Vacation
	var cell = $("<td>", { class: "board-side-field", id: "vacation-side" });
	cell.appendTo(tr);
	for (var i = 0, j; i < squareSize[0]; i++) {
		j = squareSize[0] + squareSize[1] + i - 2;
		var point = square[j];
		cell = document.createElement("td");
		switch (i) {
            case 0:
			case squareSize[0] - 1:
				cell.className = "cell board-corner " + point.style;
				cell.id = point.style;
				break;
			default:
				cell.className = "cell board-top " + point.style;
				cell.id = "cell" + j;
				break;
        }
		cell.innerHTML = cellInner(point, j);
		tr.appendChild(cell);
		point.cell = cell;
	}
	cell = $("<td>", { class: "cell side-field", rowspan: squareSize[1] });
	cell.appendTo(tr);
	board.appendChild(tr);
	
	// Sides
	for (var i = 0; i < squareSize[1] - 2; i++) {
		tr = document.createElement("tr");
		var i1 = squareSize[0] + squareSize[1] - i - 3, i2 = 2 * squareSize[0] + squareSize[1] - 2 + i;
		var point1 = square[i1],
			point2 = square[i2];
		var cell1 = document.createElement("td"),
		    cell2 = document.createElement("td");
		cell1.className = "cell board-left " + point1.style;
		cell1.id = "cell" + i1;
		cell1.innerHTML = cellInner(point1, i1);
		cell2.className = "cell board-right " + point2.style;
		cell2.id = "cell" + i2;
		cell2.innerHTML = cellInner(point2, i2);
		if (i == 0) 
            tr.innerHTML += '<td rowspan="' + (squareSize[1] - 2) + '" class="board-side-field"></td>';
		tr.appendChild(cell1);
		point1.cell = cell1;
		tr.appendChild($('<td colspan="' + (squareSize[0] - 2) + '" class="board-center"></td>').get(0));
		tr.appendChild(cell2);
		point2.cell = cell2;
		if (i == 0) 
            tr.appendChild($('<td rowspan="' + (squareSize[1] - 2) + '" class="board-side-field"></td>').get(0));
		board.appendChild(tr);
	}
	
	// Bottom
	tr = document.createElement("tr");
	/// Jail
	cell = $("<td>", { class: "board-side-field jail", id: "jail-side" });
	cell.appendTo(tr);
	for (var i = 0; i < squareSize[0]; i++) {
		var j = squareSize[0] - i - 1;
		var point = square[j];
		cell = document.createElement("td"); 
		switch (i) {
            case 0:
			case squareSize[0] - 1:
				cell.className = "cell board-corner " + point.style;
				cell.id = point.style;
				break;
			default:
				cell.className = "cell board-bottom " + point.style;
				cell.id = "cell" + j;
				break;
        }
		cell.innerHTML = cellInner(point, j);
		tr.appendChild(cell);
		point.cell = cell;
	}
	board.appendChild(tr);
	
	
	
	var board_wrap = $('<div id="board"></div>');
	board_wrap.append(board);
	$(".game-window").append(board_wrap);

	/*
	// Add images to enlarges.
	document.getElementById("enlarge0token").innerHTML += '<img src="images/arrow_icon.png" height="40" width="136" alt="" />';
	document.getElementById("enlarge20price").innerHTML += "<img src='images/free_parking_icon.png' height='80' width='72' alt='' style='position: relative; top: -20px;' />";
	document.getElementById("enlarge38token").innerHTML += '<img src="images/tax_icon.png" height="60" width="70" alt="" style="position: relative; top: -20px;" />';
	*/

	// Create event handlers for hovering and draging.

	var drag, dragX, dragY, dragObj, dragTop, dragLeft;

	$(".cell").on("mouseover", function(){
		setEnlarge(this, "enlarge");
	}).on("mouseout", function() {
		$("#enlarge").hide();

	}).on("mousemove", function(e) {
		var element = document.getElementById("enlarge");

		if (e.clientY + 20 > window.innerHeight - 204) {
			element.style.top = (window.innerHeight - 204) + "px";
		} else {
			element.style.top = (e.clientY + 20) + "px";
		}

		element.style.left = (e.clientX + 10) + "px";
	});
	
	$("body").on("mousemove", function(e) {
		var object;

		if (e.target) {
			object = e.target;
		} else if (window.event && window.event.srcElement) {
			object = window.event.srcElement;
		}
		if (drag) {
			if (e) {
				dragObj.style.left = (dragLeft + e.clientX - dragX) + "px";
				dragObj.style.top = (dragTop + e.clientY - dragY) + "px";

			} else if (window.event) {
				dragObj.style.left = (dragLeft + window.event.clientX - dragX) + "px";
				dragObj.style.top = (dragTop + window.event.clientY - dragY) + "px";
			}
		}
	});
	$("body").on("mouseup", function() {
		drag = false;
	});
	document.getElementById("statsdrag").onmousedown = function(e) {
		dragObj = document.getElementById("stats");
		dragObj.style.position = "relative";

		dragTop = parseInt(dragObj.style.top, 10) || 0;
		dragLeft = parseInt(dragObj.style.left, 10) || 0;

		if (window.event) {
			dragX = window.event.clientX;
			dragY = window.event.clientY;
		} else if (e) {
			dragX = e.clientX;
			dragY = e.clientY;
		}

		drag = true;
	};
	
	document.getElementById("popupdrag").onmousedown = function(e) {
		dragObj = document.getElementById("popup");
		dragObj.style.position = "relative";

		dragTop = parseInt(dragObj.style.top, 10) || 0;
		dragLeft = parseInt(dragObj.style.left, 10) || 0;

		if (window.event) {
			dragX = window.event.clientX;
			dragY = window.event.clientY;
		} else if (e) {
			dragX = e.clientX;
			dragY = e.clientY;
		}

		drag = true;
	};

	$("#mortgagebutton").click(function() {
		var checkedProperty = getCheckedProperty();
		var s = square[checkedProperty];

		if (s.mortgage) {
			if (player[s.owner].money < Math.round(s.price * 0.6)) {
				alert.showAccept("<p>You need $" + (Math.round(s.price * 0.6) - player[s.owner].money) + " more to unmortgage " + s.name + ".</p>");

			} else {
				alert.showConfirm("<p>" + player[s.owner].name + ", are you sure you want to unmortgage " + s.name + " for $" + Math.round(s.price * 0.6) + "?</p>", function() {
					unmortgage(checkedProperty);
				});
			}
		} else {
			alert.showConfirm("<p>" + player[s.owner].name + ", are you sure you want to mortgage " + s.name + " for $" + Math.round(s.price * 0.5) + "?</p>", function() {
				mortgage(checkedProperty);
			});
		}

	});

	$("#buyhousebutton").on("click", function() {
		var checkedProperty = getCheckedProperty();
		var s = square[checkedProperty];
		var p = player[s.owner];
		var houseSum = 0;
		var hotelSum = 0;

		if (p.money < s.houseprice) {
			if (s.house === 4) {
				alert.showAccept("<p>You need $" + (s.houseprice - player[s.owner].money) + " more to buy a hotel for " + s.name + ".</p>");
				return;
			} else {
				alert.showAccept("<p>You need $" + (s.houseprice - player[s.owner].money) + " more to buy a house for " + s.name + ".</p>");
				return;
			}
		}

		for (var i = 0; i < cellsCount; i++) {
			if (square[i].hotel === 1) {
				hotelSum++;
			} else {
				houseSum += square[i].house;
			}
		}

		if (s.house < 4 && houseSum >= 32) {
			alert.showAccept("<p>All 32 houses are owned. You must wait until one becomes available.</p>");
			return;
		} else if (s.house === 4 && hotelSum >= 12) {
			alert.showAccept("<p>All 12 hotels are owned. You must wait until one becomes available.</p>");
			return;
		}

		buyHouse(checkedProperty);

	});

	$("#sellhousebutton").click(function() { sellHouse(getCheckedProperty()); });

	buttons.buy.click(function() {
		buttons.buy.show();
		buttons.manage.hide();

		// Scroll alerts to bottom.
		$("#alert").scrollTop($("#alert").prop("scrollHeight"));
	});

	buttons.manage.click(function() {
		buttons.manage.show();
		buttons.buy.hide();
	});


	$("#trade-menu-item").click(game.trade);

	/// Generate stats block
	for (var i = 1; i < player.length; i++) {
		var element = 
			'<tr id="moneybarrow' + i + '" class="money-bar-row">' +
				'<td><div class="party-icon ' + player[i].style + '"></div></td>' +
				'<td class="moneybarcell">' +
					'<div class=""><span class="p-name" >' + player[i].name + '</span></div>' +
				'</td>' +
			'</tr>';
		$("#moneybar table").append(element);
	}
	
	play();
	
}

function setPlayersSelection(count) {
	var setup = document.getElementById("setup");
	
	for (var i = 1; i <= count; i++){
		var player = document.createElement("div");
		player.id = "player-input-" + i;
		player.className = "player-input";
		var html = getString("player") + " " + i + ": ";
		html +=
			    '<input type="text" class="player-name" id="player' + i + 'name" title="Player name" maxlength="20" value="Player ' + i + '" />\n' + 
				'<select class="select-player" data-usesprite="russian-parties" onchange="updateSelection(this);" id="player' + i + 'color" title="Player color" style="width:250px">\n';
		for (var j = 0; j < players.length; j++){
			var p = players[j];
			var selected = (i - 1 == j ? 'selected=""' : "");
			html +=
					'<option ' + selected + ' value="' + j + '" class="russian-party ' + p.style + '">' + getString(p.text) + ' (' + getString(difficultiesNames[p.difficulty-1]) + ')</option>\n';
		}
		var sel0 = (i == 1 ? 'selected=""' : ""),
		    sel1 = (i != 1 ? 'selected=""' : "");
		html +=
				'</select>\n' + 
				'<select style="width:100px" class="select-player-ai" id="player' + i + 'ai" title="Выберите, будет ли этот игрок контролироваться вручную или компьютером." onclick="document.getElementById(\'player' + i + 'name\').disabled = this.value !== \'0\';">\n' + 
				'	<option ' + sel0 + ' value="0">' + getString('human') + '</option>\n' + 
				'	<option ' + sel1 + ' value="1">' + getString('ai') + '</option>\n' +
				'</select>'
		player.innerHTML = html;
		setup.appendChild(player);
	}
	$(".select-player").msDropdown('{"width": 250}');
	$(".select-player-ai").msDropdown();
}

function getCheckedProperty() {
	for (var i = 0; i < 42; i++) {
		if (document.getElementById("propertycheckbox" + i) && document.getElementById("propertycheckbox" + i).checked) {
			return i;
		}
	}
	return -1; // No property is checked.
}

