var game;

var player;

var turn = 0;

var debugLog = false;

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

Math.range = function(min, max){
	return Math.floor(Math.random() * (max - min)) + min;
}

function sort_deck(array) {
	array.index = 0;
	array.deck = [];
	for (var i = 0; i < array.length; i++) array.deck[i] = i;
	array.deck.sort(function() {return Math.random() - 0.5;});
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
	this.addPeopleRating = function(value, playerInfo){
		if (value > 0) {
            this.add(getString("increased-people-rating").replace("%player", playerInfo.name).replace("%amount", value), playerInfo, 1);
        } else if (value < 0) {
            this.add(getString("decreased-people-rating").replace("%player", playerInfo.name).replace("%amount", value), playerInfo, -1);
        }
	}
	this.addAssemblyRating = function(value, playerInfo){
		if (value > 0) {
            this.add(getString("increased-assembly-rating").replace("%player", playerInfo.name).replace("%amount", value), playerInfo, 1);
        } else if (value < 0) {
            this.add(getString("decreased-assembly-rating").replace("%player", playerInfo.name).replace("%amount", value), playerInfo, -1);
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
	this.opened = false;
	this.stack = [];

	let self = this;
	this.showAccept = function(HTML, action) {
		if (self.opened) {
			self.stack.push(() => self.showAccept(HTML, action));
            return;
        }
		this.text.html(HTML);
		this.text.append("<div><button id='popupclose'>" + getString("OK") + "</button></div>");
		
		$("#popupclose").on("click", this.fadeOut).on('click', action).focus();
		this.fadeIn();
	}
	this.showConfirm = function(HTML, action) {
		if (self.opened) {
			self.stack.push(() => self.showConfirm(HTML, action));
            return;
        }
		this.text.html(HTML);
		this.text.append("<div><button id='popupyes'>" + getString("yes") + "</button><button id='popupno'>" + getString("no") + "</button></div>");
	
		$("#popup-yes, #popup-no").off("click").on("click", this.fadeOut);
	
		$("#popup-yes").on("click", action);
		this.fadeIn();
	}
	this.showInput = function(HTML, action) {
		if (self.opened) {
			self.stack.push(() => self.showInput(HTML, action));
            return;
        }
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
	this.showRoll = function(HTML, action) {
		if (self.opened) {
			self.stack.push(() => self.showRoll(HTML, action));
            return;
        }
		var dice = game.rollDice();
		this.text.html(
			'<span style="display: block">' + getString("you-rolled").replace("%value", dice) + "</span>" + 
			'<img id="dieAlert" title="Die" class="die die-no-img"></div>' + HTML +
			"<div><button id='popupclose'>" + getString("OK") + "</button></div>"
		);
		updateDice($('#dieAlert'), dice);
		
		$("#popupclose").on("click", this.fadeOut).on('click', () => action(dice)).focus();
		this.fadeIn();
	}
	this.showChoose = function(HTML, buttons, actions) {
		if (self.opened) {
			self.stack.push(() => self.showChoose(HTML, buttons, actions));
            return;
        }
		this.text.html(HTML);
		
		HTML = "";
		for (var i = 0; i < buttons.length; i++){
			HTML += "<button id='popup-" + i + "'>" + buttons[i] + "</button>";
		}
		this.text.append("<div>" + HTML + "</div>");
	
		for (var i = 0; i < buttons.length; i++){
			let j = i;
			$("#popup-" + i).off("click").on("click", this.fadeOut).on('click', function() {
				if (Array.isArray(actions)) actions[j]();
                else actions(j);
			});
		}
	
		this.fadeIn();
	}
	this.fadeIn = function(){
		self.opened = true;
		$("#popupbackground").fadeIn(400, function() {
			$("#popupwrap").show();
		});
	}
	this.fadeOut = function(){
		self.opened = false;
		if (self.stack.length > 0) {
            (self.stack.shift())();
        } else {
			$("#popupwrap").hide();
			$("#popupbackground").fadeOut(400);
			
		}
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
	
	this.lastButtonsConfig = [];
	this.update = function(items) {
		this.lastButtonsConfig = items;
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
	this.savedButtons = [];
	this.saveButtons = function(){
		this.savedButtons = this.lastButtonsConfig;
	}
	this.loadButtons = function(){
		this.update(this.savedButtons);
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

function VacationWindow() {
    this.vacationButtons = [];
	for (var i = 0; i < vacationTypes.length; i++) {
		var type = vacationTypes[i];
        this.vacationButtons.push(getString(type.name) + "<br/>" + wrapMoney(type.cost));
    };
	this.vacationButtons.push(getString('cancel-selection-menu-item'));
	
	this.show = function(){
		alert.showChoose(getString("vacation-header"), this.vacationButtons, function(index){
			if (index == 5) {
                return;
            }
			var currentPlayer = player[turn];
			if (vacationTypes[index].cost < currentPlayer.money) {
				var text;
				switch (index) {
					case 0: case 1:
						text = getString("visited-vacation-expensive"); break;
					case 2:
						text = getString("visited-vacation-middle"); break;
					case 3: case 4:
						text = getString("visited-vacation-cheap"); break;
                }
				alert.showAccept(text + "<br><br>" + getString("vacation-miss-moves").replace("%count", vacationDuration));
                sendToVacation(player[turn], vacationTypes[index]);
            } else {
				alert.showAccept(getString("you-need-money").replace("%money", vacationTypes[index].cost - currentPlayer.money), vacationWindow.show);
			}
		});
	}
}
var vacationWindow = new VacationWindow();



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
			HTML += "<span class='statscellheader icon money-icon left'></span><span class='statscellheader'>" + getString('money-header') + ": " + wrapMoney(p.money) + "</span>";
			
			// Rating info
			HTML += "<span class='statscellheader icon people-icon left'></span><span class='statscellheader'>" +
				getString('people-rating-header') + ": " + p.peopleRating + "/" + p.maxPeopleRating() + "</span>";
			HTML += "<span class='statscellheader icon assembly-icon left'></span><span class='statscellheader'>" +
				getString('assembly-rating-header') + ": " + p.assemblyRating + "/" + p.maxAssemblyRating() + "</span>";
			
			// Lobby info
			HTML += "<span class='statscellheader'>" + getString('lobby-header') + "</span><ul class='stats-lobby-rating'>";
			Object.keys(p.lobby).forEach(function(key) {
				HTML += "<li>" + getString('lobby-type-' + key) + ": " + p.lobby[key] + " " + getString("points") + "</li>";
			});
			HTML += "</ul>";
			
			Object.keys(p.stats).forEach(function(key) {
				HTML += "<span class='statscellheader'>" + getString('stats-' + key) + ": " + p.stats[key] + "</span>";
			});
	
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
	$("#statsclose").on("click", function() {
		$("#statswrap").hide();
		$("#statsbackground").fadeOut(400);
	});
}
var stats = new Stats();



function LobbyScreen() {
    this.object = $("#lobbyscreen");
	
	this.usedOnThisTurn = [];
	this.show = function(){
		var currentPlayer = player[turn];
		var rows = $("#lobbyscreen tr");
		for (var j = 1; j < rows.length-1; j++) {
			var cells = rows[j].getElementsByTagName("td");
			for(var i = 0; i < cells.length; i++){
				cells[i].classList.remove('selected');
				cells[i].removeAttribute('onclick');
				var key = lobbyTypes[j-1].name;
				if (currentPlayer.lobby[key] == i) {
                    cells[i].classList.add('selected');
					if (!this.usedOnThisTurn.includes(key)) {
						cells[i].onclick = function(){
							var target = event.target.getAttribute('name');
							alert.showRoll(getString("lobby-you-need-roll").replace("%value", currentPlayer.party.lobbyRollBarrier), function(value){
								lobbyScreen.usedOnThisTurn.push(target);
								currentPlayer.setLobbyRating(target, currentPlayer.lobby[target] + currentPlayer.party.lobbyAddition(value));
								lobbyScreen.show();
							});
						};
					} else {
						cells[i].classList.add('used');
					}
                }
			}
		}
		$("#popupbackground").fadeIn(400, function() {
			$("#lobbyscreen").show();
		});
	};
	this.hide = function(){
		$("#lobbyscreen").hide();
		$("#popupbackground").fadeOut(400);
	};
	
	var HTML = "<tr>";
	for (var j = 0; j < lobbyProgressLength; j++) {
		HTML += '<th><span>' + j + '</span></th>';
	}
	HTML += "</tr>";
	for (var i = 0; i < lobbyTypes.length; i++) {
        HTML += "<tr>";
		for (var j = 0; j < lobbyProgressLength; j++) {
			var cl = lobbyTypes[i].name;
			if (j % lobbyLevelLength == lobbyLevelLength - 1) {
				cl += " last";
			}
            HTML += '<td name="' + lobbyTypes[i].name + '"><div class="' + cl + '"></div></td>';
		}
		HTML += '<td><span class="lobby-title">' + getString("lobby-type-" + lobbyTypes[i].name) + '</span></td>'
		HTML += "</tr>";
    }
	HTML += "<tr>";
	for (var j = 0, i = 0; j < lobbyProgressLength; j += lobbyLevelLength, i++) {
		HTML += '<td colspan=' + lobbyLevelLength + '>';
		HTML += '<span class="level-description positive">' + getString('lobby-level-descriptionPos-' + i) + '</span>';
		HTML += '<span class="level-description negative">' + getString('lobby-level-descriptionNeg-' + i) + '</span>';
		HTML += '</td>';
	}
	HTML += "</tr>";
	this.object.find("table").html(HTML);
	
	let self = this;
	$("#lobbyclose").on("click", function() {
		self.hide();
	});
}
var lobbyScreen = new LobbyScreen();
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

	$("#qs-money").html(wrapMoney(currentPlayer.money));
	$("#qs-assembly-rating").html(currentPlayer.assemblyRating);
	$("#qs-people-rating").html(currentPlayer.peopleRating);

	if (currentPlayer.money < 0) {
		buttons.rollDices.hide();
	}
	updateTickets();
}

function updateTickets() {
	var currentPlayer = player[turn];
	var html = "";
	Object.keys(currentPlayer.tickets).forEach(function(key){
		if (currentPlayer.tickets[key] > 0) {
			html += "<a class='card " + key + "' title='" + getString(key + "-title") + "' onclick='useTicket(\"" + key + "\")'></a>";
			html += "<span class='cardcount'>" + currentPlayer.tickets[key] + "</span>";
		} else {
			html += "<span class='card " + key + "' title='" + getString(key + "-title") + "'></span>";
		}
		html += "<br/>"
	});
    $("#player-tickets").html(html);
}

function updateDices() {
	updateDice($("#die0"), game.getDie(1));
	updateDice($("#die1"), game.getDie(2));
}

function updateDice(node, value) {
	node.show();

	node.removeClass("die-no-img");
	node.prop('title', getString("dice-title").replace("%value", value));

	node.prop('src', "images/Die_" + value + ".png");
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
		
		var array = $("#" + squareItem.cell.id + " .cell-card .cell-info-line");
		for (var j = 0; j < 3; j++) {
			array[j].classList.remove("bill-state-green", "bill-state-yellow");
			//if (i != currentPlayer.position || buttons.rollDices.is(":visible")) continue;
			if (j < squareItem.state) {
				array[j].classList.add("bill-state-green");
			} else if (j == squareItem.state && i == player[turn].position) {
				array[j].classList.add("bill-state-yellow");
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
		amandments.html("<span class='cell-rating'>" + direction + "</span><br/><span class='cell-paper'>" + (squareItem.gtdVote > 0 ? "+" : "") + squareItem.gtdVote + "</span>");
	}

	setEnlarge(square[p.position].cell, "control-enlarge");
	var accepted = currentPlayer.stats["state1"] + currentPlayer.stats["state2"] + currentPlayer.stats["state3"];
	document.getElementById("owned").innerHTML =
		getString("review-bills-count") + count + " / " + getString("accepted-bills-count") + accepted + " / " + getString("rejected-bills-count") + currentPlayer.stats["rejected"];
}

var selectCellCallback = undefined;
function selectCell(p, criterion, action) {
	var properBills = [];
	for (var i = 0; i < square.length; i++){
		if (criterion(square[i])) {
            properBills.push(square[i]);
        }
	}
	if (p.isAI) {
        sort_deck(properBills);
		action(properBills[properBills.deck[0]]);
    } else {
		for (var i = 0; i < square.length; i++){
			square[i].cell.classList.add('non-selectable');
		}
		for (var i = 0; i < properBills.length; i++){
			properBills[i].cell.classList.remove('non-selectable');
			properBills[i].cell.classList.add('selectable');
		}
		selectCellCallback = action;
		buttons.saveButtons();
		buttons.update(["confirm-selection", "cancel-selection"]);
	}
}
function confirmSelection() {
    for (var i = 0; i < square.length; i++){
		if (square[i].cell.classList.contains('selected')) {
			var call = selectCellCallback;
			cancelSelection();
            call(square[i]);
			return;
        }
	}
	alert.showAccept(getString("nothing-selected"), null);
}
function cancelSelection() {
    buttons.loadButtons();
	selectCellCallback = undefined;
	for (var i = 0; i < square.length; i++){
		square[i].cell.classList.remove('non-selectable');
		square[i].cell.classList.remove('selectable');
		square[i].cell.classList.remove('hovered');
		square[i].cell.classList.remove('selected');
	}
}

function getCard() {
	var p = player[turn];
	var s = square[p.position];
	
	var chest;

	// Community Chest
	if (s.type == "com-chest") {
		chest = communityChestCards;
	} else if (s.type == "chance") {
        chest = chanceCards;
    }
	var card = chest[chest.deck[chest.index]];
	chest.index++;

	if (chest.index >= chest.deck.length) {
		chest.index = 0;
	}

	return card;
}

function voteForBillNextRound(bills, billIndex, playerIndex, results, endCallback) {
	if (playerIndex >= player.length) {
        playerIndex = 1;
		billIndex++;
		if (billIndex >= bills.length) {
            endCallback(results);
			return;
        }
    }
	if (results[billIndex] == undefined) {
        results[billIndex] = {};
    }
	var bill = bills[billIndex];
    if (bills[billIndex].owner == playerIndex) {
		voteForBillNextRound(bills, billIndex, playerIndex+1, results, endCallback);
	} else if (player[playerIndex].isAI) {
        var partyReaction = player[playerIndex].party.groupsReaction[bill.group.name];
		if ((bill.direction > 0 && partyReaction > 0) ||
			(bill.direction < 0 && partyReaction < 0)) {
			results[billIndex][playerIndex] = 1;
		} else if (partyReaction == 0) {
			var result = 0;
			if (Math.random() > 0.7) result = 1;
            if (Math.random() > 0.7) result = -1;
            results[billIndex][playerIndex] = result;
        } else {
			results[billIndex][playerIndex] = -1;
		}
		voteForBillNextRound(bills, billIndex, playerIndex+1, results, endCallback);
    } else {
		alert.showChoose(
			getString("vote-for-bill")
				.replace("%player", player[playerIndex].name)
				.replace("%owner", player[bill.owner].name)
				.replace("%bill", bill.uiName)
				.replace("%action", bill.directionName()),
			[getString("vote-approve"), getString("vote-ignore"), getString("vote-reject")],
			function(index){
				results[billIndex][playerIndex] = 1 - index;
				voteForBillNextRound(bills, billIndex, playerIndex+1, results, endCallback);
			}
		);
	}
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

function buyChooseSide(playerIndex, bill, cost) {
	if (!playerIndex) {
        p = player[turn];
		playerIndex = turn;
		bill = square[p.position], 
		cost = bill.buyPrice();
    }
	if (!player[playerIndex].AI) {
        alert.showChoose(getString("buy-choose-side-text").replace("%player", p.name).replace("%bill", bill.uiName), bill.sides, function(index){
			buy(playerIndex, bill, cost, 1 - index);
		});
    } else {
		buy(playerIndex, bill, cost, player[playerIndex].party.groupsReaction[bill.style]);
	}
}

function buy(playerIndex, bill, cost, direction) {
	var p = player[playerIndex];

	if (p.money >= cost) {
		if (!p.isAI) {
            game.showTutorial("bought-bill");
        }
		p.pay(cost);
		bill.owner = playerIndex;
		bill.direction += direction * createBillRating;
		bill.gtdVote = 1;
		bill.moveState();
		var reaction;
		if (direction > 0) reaction = "positive";
		else if (direction == 0) reaction = "no";
		else reaction = "negative";
		var message = getString("buy-message")
				.replace("%player", p.name)
				.replace("%bill", bill.uiName)
				.replace("%price", cost)
				.replace("%action", getString(bill.directionName()));
		var alertMessage =
			"<p>" + message + "</p>" +
			"<p>" + getString("buy-cost").replace("%amount", wrapMoney(cost)) + "</p>" +
			"<p>" + getString("bill-reaction-" + reaction) + "</p>" +
			"<p>" + getString("buy-bill-rating").replace("%amount", (bill.direction > 0 ? "+" : "") + bill.direction) + "</p>";
		alert.showAccept(alertMessage);
		gameLog.add(
			message + " " +
			getString("bill-reaction-" + reaction),
			p, -1
		);
	} else {
		if (!p.AI)
            alert.showAccept(getString("you-need-money").replace("%money", (cost - p.money)));
	}
	updateOwned();
	nextTurn();
}

function moveBill() {
    var p = player[turn];
	var bill = square[p.position];

	var cost = bill.buyPrice();
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
        makeAuction(bill);
    }
	buttons.performEndTurn();
}

function amend() {
	var p = player[turn];
	var bill = square[p.position];
    var cost = bill.visitPrice();
	if (p.money >= cost) {
		p.pay(cost);
		bill.gtdVote += 0.3;
		
		if (p.AI) {
			bill.direction += p.party.groupsReaction[bill.style] * amendMultiplier;
			gameLog.add(
				getString("amended-to")
					.replace("%player", p.name)
					.replace("%place", bill.uiName)
					.replace("%price", cost)
					.replace("%action", getString(p.party.groupsReaction[bill.style])),
					p, -1
			);
			updateOwned();
		} else {
			alert.showChoose(getString("amend-choose-side-text"), bill.sides, function(index){
				bill.direction += amendMultiplier * (1 - index);
				updateOwned();
				gameLog.add(
					getString("amended-to")
						.replace("%player", p.name)
						.replace("%place", bill.uiName)
						.replace("%price", cost)
						.replace("%action", getString(bill.sides[1 - index])),
						p, -1
				);	
			});
		}
	} else {
		if (!p.AI)
            alert.showAccept(getString("you-need-money").replace("%money", (cost - p.money)));
	}
	if (p.isAI) {
        nextTurn();
    } else {
		buttons.update(["amend", "end-turn"]);
	}
}

function askSay() {
	var bill = square[player[turn].position]; 
	if (bill.state == 0) {
		sayChooseSide(turn, bill);
	}
}

function sayChooseSide(playerIndex, bill) {
	if (!playerIndex) {
		playerIndex = turn;
		bill = square[player[playerIndex]]; 
    }
	var p = player[playerIndex];
	if (!player[playerIndex].AI) {
        alert.showChoose(getString("say-choose-side-text").replace("%player", p.name).replace("%bill", bill.uiName), bill.sides, function(index){
			say(playerIndex, bill, 1 - index);
		});
    } else {
		say(playerIndex, bill, player[playerIndex].party.groupsReaction[bill.style]);
	}
}

function say(playerIndex, bill, direction) {
	var p = player[playerIndex];
	gameLog.add(getString("say-message").replace("%player", p.name).replace("%bill", bill.uiName).replace("%action", getString(bill.sides[1 - direction])), p);
	var ratingAmount = direction * 2;
	p.setPeopleRating(p.peopleRating + ratingAmount);
	gameLog.addPeopleRating(ratingAmount, p);
	
	updateMoney();	
	nextTurn();
}


function soldSoul() {
    //code
}

/*
 *
 *  ON VISIT EVENTS
 *
 */

function landOnBill(bill, playerIndex) {
	var p = player[playerIndex];
		// Allow player to buy the property on which he landed.
		if (bill.state == 0) {
			if (p.AI) {
				if (p.AI.buyProperty(p.position)) {
					buyChooseSide(playerIndex, bill, bill.buyPrice());
				} else {
					say()
				}
				updateOwned();
			} else {
				game.showTutorial("land-on-bill");
				buttons.update(["buy", "say"]);
			}
			return;
		}
	
		// Collect rent
		if (bill.state > 0){
			if (bill.owner != turn) {
				if (p.AI){
					amend();
				} else {
					game.showTutorial("amend-bill");
					buttons.update(["amend"]);
				}
			} else {
				if (p.AI){
					game.showTutorial("move-bill");
					moveBill(bill);
				} else {
					buttons.update(['move']);
				}
			}
			return;
		}
}

function takeCard(s, playerIndex) {
	var p = player[playerIndex];
	var prizeCard = getCard();
	prizeCard.randomize(p);
    if (p.human) {
		alert.showAccept(prizeCard.text(),  () => prizeCard.action(p));
		buttons.performEndTurn();
	} else {
		prizeCard.action(p);
		nextTurn();
	}
}

function lobby(square, playerIndex) {
	game.showTutorial("lobby");
	var p = player[playerIndex];
	if (p.isAI) {
        p.AI.rollLobby();
		nextTurn();
    } else {
		buttons.update(["lobby", "end-turn"]);
	}
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
function scandal(square, player) {
	nextTurn();
}

function useTicket(type) {
	var p = player[turn];
	if (p.tickets[type] <= 0) {
		alert.showAccept(getString("player-dont-have-card"));
        return;
    }
	if (!canPerformAction(p, type)) {
        alert.showAccept(getString(type + "-card-cant-be-used"));
        return;
    }
	updateTickets();
	performAction(p, type);
}

function canPerformAction(p, type) {
    switch (type) {
        case "jailCard": {
			return p.jail;
		} break;
		case "moveBillCard": {
			for (var i = 0; i < square.length; i++) {
                if (player[square[i].owner] == p && square[i].state > 0) return true;
            }
			return false;
		} break;
		case "createBillCard": {
			for (var i = 0; i < square.length; i++) {
                if (square[i].state == 0) return true;
            }
			return false;
		} break;
		case "rejectBillCard": {
			for (var i = 0; i < square.length; i++) {
                if (square[i].state > 0) return true;
            }
		} break;
		case "gotoCard": {
			return !p.jail;
		} break;
    }
}
function performAction(p, type) {
    switch (type) {
        case "jailCard": {
			getOutOfJail();
			afterPerformAction(p, type);
		} break;
		case "moveBillCard": {
			selectCell(p, function(cell){
				return player[cell.owner] == p && cell.state > 0;
			}, function(cell){
				cell.gtdVote += 2;
				afterPerformAction(p, type);
			});
		} break;
		case "createBillCard": {
			selectCell(p, function(cell){
				return cell.state == 0;
			}, function(cell){
				buyChooseSide(p.index, cell, 0);
				afterPerformAction(p, type);
			});
		} break;
		case "rejectBillCard": {
			selectCell(p, function(cell){
				return cell.state > 0;
			}, function(cell){
				cell.gtdVote -= 2;
				afterPerformAction(p, type);
			});
		} break;
		case "gotoCard": {
			selectCell(p, function(cell){
				return true;
			}, function(cell){
				for (var i = 0; i < square.length; i++) {
                    if (cell == square[i]) {
                        p.position = i;
						land();
						afterPerformAction(p, type);
						return;
                    }
                }
			});
		} break;
    }
}
function afterPerformAction(p, type) {
	gameLog.add(getString("player-used").replace("%player", p.name).replace("%thing", getString(type + "-title")), p);
	p.removeTicket(type);
	updateTickets();
	updateOwned();
}

function getOutOfJail() {
    var currentPlayer = player[turn];
	currentPlayer.jail = false;
	if (currentPlayer.isAI) {
        roll();
    } else {
		buttons.rollDices.show();
	}
}


function openLobby() {
	buttons.performEndTurn();
	lobbyScreen.show();
}

function vacation(square, player) {
	if (p.isAI) {
        p.AI.rollVacation();
		nextTurn();
    } else {
		buttons.update(["vacation", "end-turn"]);
	}
}

function openVacation() {
	buttons.performEndTurn();
	vacationWindow.show();
}

function sendToVacation(p, type) {
    p.missMove += vacationDuration;
	p.pay(type.cost);
	if (type.assemblyRatingLoss > 0) {
		p.setAssemblyRating(p.assemblyRating - type.assemblyRatingLoss);
		gameLog.addAssemblyRating(-type.assemblyRatingLoss, p);
    }
	if (type.peopleRatingLoss > 0) {
		p.setPeopleRating(p.peopleRating - type.peopleRatingLoss);
		gameLog.addPeopleRating(-type.peopleRatingLoss, p);
	}
	updateMoney();
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
	if (debugLog) {
		gameLog.add(getString("landed-on").replace("%player", currentPlayer.name).replace("%place", squareName), currentPlayer);
	}
	
	updatePosition();

	if (currentPlayer.AI)
		currentPlayer.AI.onLand();
	s.onVisit(s, turn);

	updateMoney();
	updateOwned();
}

function roll() {
	var currentPlayer = player[turn];

	buttons.buy.show();
	buttons.manage.hide();

	if (currentPlayer.human) {
		buttons.rollDices.focus();
	}

	game.rollDices();
	var die1 = game.getDie(1);
	var die2 = game.getDie(2);
	
	if (debugLog) {
		gameLog.add(
			getString("rolled").replace("%player", currentPlayer.name).replace("%number", (die1 + die2)) +
			(die1 == die2 ? " - " + getString("doubles") + "." : "."), p
		);
	}

	if (die1 == die2 && !currentPlayer.jail) {
		updateDices();

		if (game.doublecount < 3) {
			buttons.rollDices.attr('value', getString("roll-again"));
			buttons.rollDices.attr('title', getString("threw-doubles-title"));

		// If player rolls doubles three times in a row, send him to jail
		} else if (game.doublecount === 3) {
			currentPlayer.jail = true;
			game.doublecount = 0;
			gameLog.add(getString("rolled-doubles-three-times").replace("%player", p.name));
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
	lobbyScreen.usedOnThisTurn = [];

	if (currentPlayer.jail === true) {
		currentPlayer.jailroll++;

		updateDices();
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
		updateDices();

		// Move player
		currentPlayer.position += die1 + die2;

		// Collect $200 salary as you pass GO
		if (currentPlayer.position >= cellsCount) {
			currentPlayer.position -= cellsCount;
			endSession(currentPlayer);
		} else {
			land();
		}
	}
}

function endSession(currentPlayer) {
	currentPlayer.givePartyTickets();
	
	var payment = currentPlayer.sessionStartPayment();
	var report = "";
	var payAmount = 0;
	Object.keys(payment).forEach(function(key){
		var amount = payment[key];
		if (amount == 0) return;
		payAmount += amount;
		if (amount > 0) {
            report += "<p class='pay-info payUp'>"
        } else {
			report += "<p class='pay-info payDown'>"
		}
		report += '<span class="payment-key">' + getString("payment-" + key) + ':</span><span class="payment-amount">' + wrapMoney(amount) + '</span></p>';
	});
	report += "<br>";
			
	var billsForVote = [];
	for (var i = 0; i < square.length; i++){
		if (square[i].owner == currentPlayer.index) billsForVote.push(square[i]);
	}
	voteForBillNextRound(billsForVote, 0, 1, [], function(result){
		console.log(result);
			for (var i = 0; i < result.length; i++){
					var bill = billsForVote[i];
					var billVote = [0,0,0];
					Object.keys(result[i]).forEach((key) => {
						if (result[i][key] > 0) billVote[0]++;
						else if (result[i][key] == 0) billVote[1]++;
                        else billVote[2]++;
					});
					if (bill.gtdVote > 0) billVote[0] += bill.gtdVote;
                    else if (bill.gtdVote < 0) billVote[2] += bill.gtdVote;
					report += '<br><span class="vote billName">' + bill.uiName + '</span><br>';
					report += '<span class="vote voteUp">' + getString("vote-approve") + ": " + billVote[0] + '</span>';
					report += '<span class="vote noVote">' + getString("vote-ignore") + ": " + billVote[1] + '</span>';
					report += '<span class="vote voteDown">' + getString("vote-reject") + ": " + billVote[2] + '</span>';
					report += '<span class="vote voteAppend">(' + getString('bonus-votes') + ": " + bill.gtdVote + ')</span><br>';
					if (billVote[0] - billVote[2] + bill.gtdVote <= 0) {
						bill.revertState();
						if (bill.state == 0) {
							currentPlayer.stats["rejected"]++;
						}
						report += '<span class="vote voteDown">' + getString("vote-declined") + '</span>';
					} else {
						report += '<span class="vote voteUp">' + getString("vote-approved-state" + bill.state) + '</span>';
						currentPlayer.setPeopleRating(currentPlayer.peopleRating + bill.direction);
						currentPlayer.setAssemblyRating(currentPlayer.assemblyRating + 2);
						gameLog.addPeopleRating(bill.direction, currentPlayer);
						gameLog.addAssemblyRating(2, currentPlayer);
					}
					report += "<br>";
			}
			alert.showAccept(report, land);
			currentPlayer.money += payAmount;
			updateOwned();
			updateMoney();
			gameLog.add(getString("new-session-pay").replace("%player", currentPlayer.name).replace("%amount", payAmount), p, payAmount > 0 ? 1 : -1);
	});
}

function nextTurn() {
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
	if (currentPlayer.missMove > 0) {
        currentPlayer.missMove--;
		if (!currentPlayer.isAI) {
            alert.showAccept(getString("miss-move"), play);
        } else {
			play();
		}
		return;
    }
	game.resetDice();

	if (debugLog) {
        gameLog.add(getString("it-is-turn").replace("%player", currentPlayer.name), currentPlayer);
    }

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
		       '<p class="cell-info-line"><span class="cell-goal">' + getString('first-goal') + '</span><span class="cell-money">' + point.prices[0].buy + '/' + point.prices[0].visit + '</span></p>' +
		       '<p class="cell-info-line"><span class="cell-goal">' + getString('second-goal') + '</span><span class="cell-money">' + point.prices[1].buy + '/' + point.prices[1].visit + '</span></p>' +
		       '<p class="cell-info-line"><span class="cell-goal">' + getString('third-goal') + '</span><span class="cell-money">' + point.prices[2].buy + '/' + point.prices[2].visit + '</span></p>' +
			   '<div class="fa fa-5x ' + point.icon + '"></div>' + 
			   '<div class="cell-spec"></div>' +
		   '</div>';
	}
	content +=
		'</div>';
	return content;
}

function setup() {
	game = new GameState();
	game.showTutorial("start-game");
	
	// Initialize players
	var pc = parseInt(document.getElementById("playernumber").value, 10);
	player = [ undefined ];

	for (var i = 1; i <= pc; i++) {
		var name  = document.getElementById("player" + i + "name").value,
		    party = players[document.getElementById("player" + i + "color").value],
			type  = document.getElementById("player" + i + "ai").value == 1;
		
		player.push(new Player(name, party, type));
		player[i].index = i;
		player[i].givePartyTickets();
	}

	// Switch panels
	$("#board, #moneybar").show();
	$("#setup").hide();

	
	// Shuffle decks
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
		switch (point.type) {
			case 'bill': point.onVisit = landOnBill; break;
            case 'com-chest': point.onVisit = takeCard; break;
			case 'lobby': point.onVisit = lobby; break;
			case 'chance': point.onVisit = takeCard; break;
			case 'jail': point.onVisit = corruptionVisit; break;
			case 'scandal': point.onVisit = corruptionTake; break;
			case 'meeting': point.onVisit = meeting; break;
			case 'vacation': point.onVisit = vacation; break;
			case 'new-session': point.onVisit = nextTurn; break;
			default: console.log("error: unknown cell at " + i + ", " + point.type); break;
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

	$(".cell").on("mouseover", function(e){
		if (selectCellCallback == undefined) {
            setEnlarge(this, "enlarge");
        } else {
			if (this.classList.contains("selectable")) {
				this.classList.add("hovered");
            }
		}
		
	}).on("mouseout", function(e) {
		$("#enlarge").hide();
		if (selectCellCallback != undefined) {
			if (this.classList.contains("hovered")) {
				this.classList.remove("hovered");
            }
		}
	}).on("mousemove", function(e) {
		var element = document.getElementById("enlarge");

		if (e.clientY + 20 > window.innerHeight - 204) {
			element.style.top = (window.innerHeight - 204) + "px";
		} else {
			element.style.top = (e.clientY + 20) + "px";
		}

		element.style.left = (e.clientX + 10) + "px";
	}).on("click", function(e){
		if (selectCellCallback != undefined) {
			if (this.classList.contains("selectable")) {
				for (var i = 0; i < square.length; i++) {
                    square[i].cell.classList.remove("selected");
                }
				this.classList.add("selected");
            }
		}
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
	$('.window').on('mousedown', function(e) {
		dragObj = this;
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
	});

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

