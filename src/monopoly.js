var game;

var pcount;
var turn = 0, doublecount = 0;

// Overwrite an array with numbers from one to the array's length in a random order.
Array.prototype.randomize = function(length) {
	length = (length || this.length);
	var num;
	var indexArray = [];

	for (var i = 0; i < length; i++) {
		indexArray[i] = i;
	}

	for (var i = 0; i < length; i++) {
		// Generate random number between 0 and indexArray.length - 1.
		num = Math.floor(Math.random() * indexArray.length);
		this[i] = indexArray[num] + 1;

		indexArray.splice(num, 1);
	}
};

// function show(element) {
	// // Element may be an HTML element or the id of one passed as a string.
	// if (element.constructor == String) {
		// element = document.getElementById(element);
	// }

	// if (element.tagName == "INPUT" || element.tagName == "SPAN" || element.tagName == "LABEL") {
		// element.style.display = "inline";
	// } else {
		// element.style.display = "block";
	// }
// }

// function hide(element) {
	// // Element may be an HTML element or the id of one passed as a string.
	// if (element.constructor == String) {
		// document.getElementById(element).style.display = "none";
	// } else {
		// element.style.display = "none";
	// }
// }

function addAlert(alertText) {
	$alert = $("#alert");

	$(document.createElement("div")).text(alertText).appendTo($alert);

	// Animate scrolling down alert element.
	$alert.stop().animate({"scrollTop": $alert.prop("scrollHeight")}, 1000);

	if (!player[turn].human) {
		player[turn].AI.alertList += "<div>" + alertText + "</div>";
	}
}

function popup(HTML, action, option) {
	document.getElementById("popuptext").innerHTML = HTML;
	document.getElementById("popup").style.width = "300px";
	document.getElementById("popup").style.top = "0px";
	document.getElementById("popup").style.left = "0px";

	if (!option && typeof action === "string") {
		option = action;
	}

	option = option ? option.toLowerCase() : "";

	if (typeof action !== "function") {
		action = null;
	}

	// Yes/No
	if (option === "yes/no") {
		document.getElementById("popuptext").innerHTML += "<div><input type=\"button\" value=\"Yes\" id=\"popupyes\" /><input type=\"button\" value=\"No\" id=\"popupno\" /></div>";

		$("#popupyes, #popupno").on("click", function() {
			$("#popupwrap").hide();
			$("#popupbackground").fadeOut(400);
		});

		$("#popupyes").on("click", action);

	// Ok
	} else if (option !== "blank") {
		$("#popuptext").append("<div><input type='button' value='OK' id='popupclose' /></div>");
		$("#popupclose").focus();

		$("#popupclose").on("click", function() {
			$("#popupwrap").hide();
			$("#popupbackground").fadeOut(400);
		}).on("click", action);

	}

	// Show using animation.
	$("#popupbackground").fadeIn(400, function() {
		$("#popupwrap").show();
	});

}


function updatePosition() {
	p = player[turn];
	square[p.position].cell.getElementsByClassName("chip-dock")[0].appendChild(p.chip);
	setEnlarge(square[p.position].cell, "control-enlarge");
}

function updateMoney() {
	var p = player[turn];

	document.getElementById("pmoney").innerHTML = moneySign[0] + p.money + moneySign[1];

	for (var i = 1; i <= pcount; i++) {
		$("#moneybarrow" + i + " .p-money").html(player[i].money);
	}

	if (document.getElementById("landed").innerHTML === "") {
		$("#landed").hide();
	}

	if (p.money < 0) {
		// document.getElementById("roll-dices").disabled = true;
		$("#resignbutton").show();
		$("#roll-dices").hide();
	} else {
		// document.getElementById("roll-dices").disabled = false;
		$("#resignbutton").hide();
		$("#roll-dices").show();
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
	var p = player[turn];
	var checkedproperty = getCheckedProperty();

	var count = 0;
	var sq;

	for (var i = 0; i < cellsCount; i++) {
		sq = square[i];
		if (sq.group == undefined) continue;
		if (sq.owner == turn) {
            count++;
        }
		
		var currentCellOwner = document.getElementById("cell" + i + "owner");
		if (sq.owner > 0) {
			currentCellOwner.className = "cell-owner " + player[sq.owner].style;
		} else {
			currentCellOwner.className = "cell-owner hidden";
		}
		var array = $("#" + sq.cell.id + " .cell-card div");
		for (var j = 0; j < 3; j++) {
			array[j].className = "";
			if (sq.owner > 0) {
                if (j < sq.state) {
					array[j].className = "bill-state-green";
				} else if (j == sq.state) {
					array[j].className = "bill-state-yellow";
				}
            }
        }
		
		var currentCellAmandments = document.getElementById("cell" + i + "amandments");
		if (sq.amandments > 0) {
			currentCellAmandments.innerHTML = "<img src='images/paper_icon.png' alt='' title='" + getString("amandments-count") + "' class='amandment' /> x" + sq.amandments;
		} else {
			currentCellAmandments.innerHTML = "";
		}
	}

	var owned = document.getElementById("owned");
	owned.innerHTML = getString("review-bills-count") + count + " / " + getString("accepted-bills-count") + p.acceptedBills + " / " + getString("rejected-bills-count") + p.rejectedBills;
}

function updateOptions(items) {
	Array.from($("#menu .menu-item")).forEach(function(i){
		i.classList.add("hidden");
	});
	var cb = document.getElementById("roll-dices");
	if (items == undefined || items.length == 0) {
        cb.classList.remove("hidden");
    } else {
		cb.classList.add("hidden");
		items.forEach(function(i){
			$("#menu #" + i + "-menu-item").removeClass("hidden");
		});
	}
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

		popup("<img src='images/community_chest_icon.png' style='height: 50px; width: 53px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>Community Chest:</div><div style='text-align: justify;'>" + communityChestCards[communityChestIndex].text + "</div>", function() {
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

		popup("<img src='images/chance_icon.png' style='height: 50px; width: 26px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>Chance:</div><div style='text-align: justify;'>" + chanceCards[chanceIndex].text + "</div>", function() {
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
				game.next();
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
		game.next();
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
		game.next();
	}
}

function addamount(amount, cause) {
	var p = player[turn];

	p.money += amount;

	addAlert(p.name + " received $" + amount + " from " + cause + ".");
}

function subtractamount(amount, cause) {
	var p = player[turn];

	p.pay(amount, 0);

	addAlert(p.name + " lost $" + amount + " from " + cause + ".");
}

function gotojail() {
	var p = player[turn];
	addAlert(p.name + " was sent directly to jail.");
	document.getElementById("landed").innerHTML = "You are in jail.";

	p.jail = true;
	doublecount = 0;

	document.getElementById("roll-dices").value = "End turn";
	document.getElementById("roll-dices").title = "End turn and advance to the next player.";

	if (p.human) {
		document.getElementById("roll-dices").focus();
	}

	updatePosition();
	updateOwned();

	if (!p.human) {
		popup(p.AI.alertList, game.next);
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

	for (var i = 1; i <= pcount; i++) {
		if (i != turn) {
			player[i].money += amount;
			total += amount;
			creditor = p.money >= 0 ? i : creditor;

			p.pay(amount, creditor);
		}
	}

	addAlert(p.name + " lost $" + total + " from " + cause + ".");
}

function collectfromeachplayer(amount, cause) {
	var p = player[turn];
	var total = 0;

	for (var i = 1; i <= pcount; i++) {
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

	addAlert(p.name + " received $" + total + " from " + cause + ".");
}

function advance(destination, pass) {
	var p = player[turn];

	if (typeof pass === "number") {
		if (p.position < pass) {
			p.position = pass;
		} else {
			p.position = pass;
			p.money += 200;
			addAlert(p.name + " collected a $200 salary for passing GO.");
		}
	}
	if (p.position < destination) {
		p.position = destination;
	} else {
		p.position = destination;
		p.money += 200;
		addAlert(p.name + " collected a $200 salary for passing GO.");
	}

	land();
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
			addAlert(p.name + " lost $" + cost + " to Community Chest.");
		} else {
			addAlert(p.name + " lost $" + cost + " to Chance.");
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

	addAlert(p.name + " paid the $50 fine to get out of jail.");
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

	addAlert(p.name + " used a \"Get Out of Jail Free\" card.");
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
				addAlert(p.name + " placed a house on " + sq.name + ".");
			}

		} else {
			if (hotelSum >= 12) {
				return;

			} else {
				sq.house = 5;
				sq.hotel = 1;
				addAlert(p.name + " placed a hotel on " + sq.name + ".");
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
		addAlert(p.name + " sold the hotel on " + sq.name + ".");
	} else {
		sq.house--;
		addAlert(p.name + " sold a house on " + sq.name + ".");
	}

	p.money += sq.houseprice * 0.5;
	updateOwned();
	updateMoney();
}

function showStats() {
	var HTML, sq, p;
	var mortgagetext,
	housetext;
	var write;
	HTML = "<table align='center'><tr>";

	for (var x = 1; x <= pcount; x++) {
		write = false;
		p = player[x];
		if (x == 5) {
			HTML += "</tr><tr>";
		}
		HTML += "<td class='statscell' id='statscell" + x + "' style='border: 2px solid " + p.color + "' ><div class='statsplayername'>" + p.name + "</div>";

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

function buy() {
	var p = player[turn];
	var bill = square[p.position];
	var cost = bill.price().buy;

	if (p.money >= cost) {
		p.pay(cost, 0);

		bill.owner = turn;
		updateMoney();
		addAlert(p.name + " bought " + getString(bill.name) + " for " + cost + ".");

		updateOwned();

		$("#landed").hide();

	} else {
		popup("<p>" + p.name + ", you need $" + (cost - p.money) + " more to buy " + getString(bill.name) + ".</p>");
	}
	updateOptions();
}

function mortgage(index) {
	var sq = square[index];
	var p = player[sq.owner];

	if (sq.house > 0 || sq.hotel > 0 || sq.mortgage) {
		return false;
	}

	var mortgagePrice = Math.round(sq.price * 0.5);
	var unmortgagePrice = Math.round(sq.price * 0.6);

	sq.mortgage = true;
	p.money += mortgagePrice;

	document.getElementById("mortgagebutton").value = "Unmortgage for $" + unmortgagePrice;
	document.getElementById("mortgagebutton").title = "Unmortgage " + sq.name + " for $" + unmortgagePrice + ".";

	addAlert(p.name + " mortgaged " + sq.name + " for $" + mortgagePrice + ".");
	updateOwned();
	updateMoney();

	return true;
}

function unmortgage(index) {
	var sq = square[index];
	var p = player[sq.owner];
	var unmortgagePrice = Math.round(sq.price * 0.6);
	var mortgagePrice = Math.round(sq.price * 0.5);

	if (unmortgagePrice > p.money || !sq.mortgage) {
		return false;
	}

	p.pay(unmortgagePrice, 0);
	sq.mortgage = false;
	document.getElementById("mortgagebutton").value = "Mortgage for $" + mortgagePrice;
	document.getElementById("mortgagebutton").title = "Mortgage " + sq.name + " for $" + mortgagePrice + ".";

	addAlert(p.name + " unmortgaged " + sq.name + " for $" + unmortgagePrice + ".");
	updateOwned();
	return true;
}


function land() {
	
	var p = player[turn];
	var s = square[p.position];

	var die1 = game.getDie(1);
	var die2 = game.getDie(2);

	$("#landed").show();
	document.getElementById("landed").innerHTML = getString("you-landed").replace("#name", player[turn].name) + " " + getString(s.name) + ".";
	addAlert(p.name + " landed on " + s.name + ".");
	
	updatePosition();

	s.onVisit(s, p);

	updateMoney();
	updateOwned();
}

function roll() {
	var p = player[turn];

	$("#option").hide();
	$("#buy").show();
	$("#manage").hide();

	if (p.human) {
		document.getElementById("roll-dices").focus();
	}
	document.getElementById("roll-dices").innerHTML = getString("end-turn");
	document.getElementById("roll-dices").title = "End turn and advance to the next player.";

	game.rollDice();
	var die1 = game.getDie(1);
	var die2 = game.getDie(2);

	doublecount++;

	if (die1 == die2) {
		addAlert(p.name + " rolled " + (die1 + die2) + " - doubles.");
	} else {
		addAlert(p.name + " rolled " + (die1 + die2) + ".");
	}

	if (die1 == die2 && !p.jail) {
		updateDice(die1, die2);

		if (doublecount < 3) {
			document.getElementById("roll-dices").value = getString("roll-again");
			document.getElementById("roll-dices").title = "You threw doubles. Roll again.";

		// If player rolls doubles three times in a row, send him to jail
		} else if (doublecount === 3) {
			p.jail = true;
			doublecount = 0;
			addAlert(p.name + " rolled doubles three times in a row.");
			updateMoney();


			if (p.human) {
				popup("You rolled doubles three times in a row. Go to jail.", goToJail);
			} else {
				gotojail();
			}

			return;
		}
	} else {
		document.getElementById("roll-dices").innerHTML = getString("end-turn");
		document.getElementById("roll-dices").title = "End turn and advance to the next player.";
		doublecount = 0;
	}

	updatePosition();
	updateMoney();
	updateOwned();

	if (p.jail === true) {
		p.jailroll++;

		updateDice(die1, die2);
		if (die1 == die2) {
			document.getElementById("jail").style.border = "1px solid black";
			document.getElementById("cell11").style.border = "2px solid " + p.color;
			$("#landed").hide();

			p.jail = false;
			p.jailroll = 0;
			p.position = 10 + die1 + die2;
			doublecount = 0;

			addAlert(p.name + " rolled doubles to get out of jail.");

			land();
		} else {
			if (p.jailroll === 3) {

				if (p.human) {
					popup("<p>You must pay the $50 fine.</p>", function() {
						payFifty();
						payfifty();
						player[turn].position=10 + die1 + die2;
						land();
					});
				} else {
					payfifty();
					p.position = 10 + die1 + die2;
					land();
				}
			} else {
				$("#landed").show();
				document.getElementById("landed").innerHTML = "You are in jail.";

				if (!p.human) {
					popup(p.AI.alertList, game.next);
					p.AI.alertList = "";
				}
			}
		}


	} else {
		updateDice(die1, die2);

		// Move player
		p.position += die1 + die2;

		// Collect $200 salary as you pass GO
		if (p.position >= cellsCount) {
			p.position -= cellsCount;
			p.money += 200;
			addAlert(p.name + " collected a $200 salary for passing GO.");
		}

		land();
	}
}

function play() {
	if (game.auction()) {
		return;
	}

	turn++;
	if (turn > pcount) {
		turn -= pcount;
	}

	var p = player[turn];
	game.resetDice();

	document.getElementById("pname").innerHTML = p.name;

	addAlert("It is " + p.name + "'s turn.");

	// Check for bankruptcy.
	p.pay(0);

	$("#landed, #option, #manage").hide();
	$("#board, #control, #moneybar, #viewstats, #buy").show();

	doublecount = 0;
	if (p.human) {
		document.getElementById("roll-dices").focus();
	}
	document.getElementById("roll-dices").value = "Roll Dice";
	document.getElementById("roll-dices").title = "Roll the dice and move your token accordingly.";

	$("#die0").hide();
	$("#die1").hide();

	if (p.jail) {
		$("#landed").show();
		document.getElementById("landed").innerHTML = "You are in jail.<input type='button' title='Pay $50 fine to get out of jail immediately.' value='Pay $50 fine' onclick='payfifty();' />";

		if (p.communityChestJailCard || p.chanceJailCard) {
			document.getElementById("landed").innerHTML += "<input type='button' id='gojfbutton' title='Use &quot;Get Out of Jail Free&quot; card.' onclick='useJailCard();' value='Use Card' />";
		}

		document.getElementById("roll-dices").title = "Roll the dice. If you throw doubles, you will get out of jail.";

		if (p.jailroll === 0)
			addAlert("This is " + p.name + "'s first turn in jail.");
		else if (p.jailroll === 1)
			addAlert("This is " + p.name + "'s second turn in jail.");
		else if (p.jailroll === 2) {
			document.getElementById("landed").innerHTML += "<div>NOTE: If you do not throw doubles after this roll, you <i>must</i> pay the $50 fine.</div>";
			addAlert("This is " + p.name + "'s third turn in jail.");
		}

		if (!p.human && p.AI.postBail()) {
			if (p.communityChestJailCard || p.chanceJailCard) {
				useJailCard();
			} else {
				payfifty();
			}
		}
	}
	
	$(".moneybarcell").removeClass("selected");
	$("#moneybarrow" + turn + " .moneybarcell").addClass("selected");

	updateOptions();
	updateMoney();
	updatePosition();
	updateOwned();

	if (!p.human) {
		if (!p.AI.beforeTurn()) {
			game.next();
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
		   '</div>';
	}
	content +=
		'</div>';
	return content;
}

function setup() {
	game = new GameState();
	
	// Initialize players
	pcount = parseInt(document.getElementById("playernumber").value, 10);
	player = [ undefined ];

	for (var i = 1; i <= pcount; i++) {
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
				cell.className = "cell board-corner " + point.style;
				cell.id = point.style;
				break;
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
		var i1 = squareSize[0] + i, i2 = 2 * squareSize[0] + squareSize[1] - 2 + i;
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
		tr.innerHTML += '<td colspan="' + (squareSize[0] - 2) + '" class="board-center"></td>';
		tr.appendChild(cell2);
		point2.cell = cell2;
		if (i == 0) 
            tr.innerHTML += '<td rowspan="' + (squareSize[1] - 2) + '" class="board-side-field"></td>';
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
				cell.className = "cell board-corner " + point.style;
				cell.id = point.style;
				break;
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
				popup("<p>You need $" + (Math.round(s.price * 0.6) - player[s.owner].money) + " more to unmortgage " + s.name + ".</p>");

			} else {
				popup("<p>" + player[s.owner].name + ", are you sure you want to unmortgage " + s.name + " for $" + Math.round(s.price * 0.6) + "?</p>", function() {
					unmortgage(checkedProperty);
				}, "Yes/No");
			}
		} else {
			popup("<p>" + player[s.owner].name + ", are you sure you want to mortgage " + s.name + " for $" + Math.round(s.price * 0.5) + "?</p>", function() {
				mortgage(checkedProperty);
			}, "Yes/No");
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
				popup("<p>You need $" + (s.houseprice - player[s.owner].money) + " more to buy a hotel for " + s.name + ".</p>");
				return;
			} else {
				popup("<p>You need $" + (s.houseprice - player[s.owner].money) + " more to buy a house for " + s.name + ".</p>");
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
			popup("<p>All 32 houses are owned. You must wait until one becomes available.</p>");
			return;
		} else if (s.house === 4 && hotelSum >= 12) {
			popup("<p>All 12 hotels are owned. You must wait until one becomes available.</p>");
			return;
		}

		buyHouse(checkedProperty);

	});

	$("#sellhousebutton").click(function() { sellHouse(getCheckedProperty()); });

	$("#viewstats").on("click", showStats);
	$("#statsclose, #statsbackground").on("click", function() {
		$("#statswrap").hide();
		$("#statsbackground").fadeOut(400);
	});

	$("#buy-menu-item").click(function() {
		$("#buy").show();
		$("#manage").hide();

		// Scroll alerts to bottom.
		$("#alert").scrollTop($("#alert").prop("scrollHeight"));
	});

	$("#manage-menu-item").click(function() {
		$("#manage").show();
		$("#buy").hide();
	});


	$("#trade-menu-item").click(game.trade);

	/// Generate stats block
	for (var i = 1; i <= pcount; i++) {
		var element = 
			'<tr id="moneybarrow' + i + '" class="money-bar-row">' +
				'<td><div class="party-icon ' + player[i].style + '"></div></td>' +
				'<td class="moneybarcell">' +
					'<div class=""><span class="p-name" >' + player[i].name + '</span>:</div>' +
					'<div>' + moneySign[0] + '<span class="p-money"></span>' + moneySign[1] + '</div>' + 
				'</td>' +
			'</tr>';
		$("#moneybar table").append(element);
	}
	
	play();
	
}

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

// function togglecheck(elementid) {
	// element = document.getElementById(elementid);

	// if (window.event.srcElement.id == elementid)
		// return;

	// if (element.checked) {
		// element.checked = false;
	// } else {
		// element.checked = true;
	// }
// }

function getCheckedProperty() {
	for (var i = 0; i < 42; i++) {
		if (document.getElementById("propertycheckbox" + i) && document.getElementById("propertycheckbox" + i).checked) {
			return i;
		}
	}
	return -1; // No property is checked.
}

