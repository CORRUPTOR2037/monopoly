function GameState() {
	
	// Dices state
	
	var die1, die2;
	var areDiceRolled = false;
	var doublecount = 0;

	this.rollDice = function() {
		return Math.floor(Math.random() * 6) + 1;
	}
	
	this.rollDices = function() {
		die1 = this.rollDice();
		die2 = this.rollDice();
		areDiceRolled = true;
		if (die1 == die2) {
            doublecount++;
        } else {
			doublecount = 0;
		}
	};

	this.resetDice = function() {
		areDiceRolled = false;
		doublecount = 0;
	};

	this.shouldEndTurn = function(){
		return (areDiceRolled && doublecount === 0);
	};

	this.getDie = function(die) {
		if (die === 1) {
			return die1;
		} else {
			return die2;
		}
	};

	
	this.tutorial = {}
	this.showTutorial = function(key){
		if (this.tutorial[key] == undefined) {
            this.tutorial[key] = true;
			alert.showAccept("<h2>" + getString("tutorial") + "</h2><br><p>" + getString(key + "-tutorial") + "</p>");
        }
	}

	// Bankrupcy functions:




	this.eliminatePlayer = function() {
		var p = player[turn];

		for (var i = p.index; i < pcount; i++) {
			player[i] = player[i + 1];
			player[i].index = i;

		}

		for (var i = 0; i < 40; i++) {
			if (square[i].owner >= p.index) {
				square[i].owner--;
			}
		}

		pcount--;
		turn--;

		if (pcount === 2) {
			document.getElementById("stats").style.width = "454px";
		} else if (pcount === 3) {
			document.getElementById("stats").style.width = "686px";
		}

		if (pcount === 1) {
			updateMoney();
			$("#control").hide();
			$("#board").hide();
			$("#refresh").show();

			// // Display land counts for survey purposes.
			// var text;
			// for (var i = 0; i < 40; i++) {
				// if (i === 0)
					// text = square[i].landcount;
				// else
					// text += " " + square[i].landcount;
			// }
			// document.getElementById("refresh").innerHTML += "<br><br><div><textarea type='text' style='width: 980px;' onclick='javascript:select();' />" + text + "</textarea></div>";

			popup("<p>Congratulations, " + player[1].name + ", you have won the game.</p><div>");

		} else {
			play();
		}
	};

	this.bankruptcyUnmortgage = function() {
		var p = player[turn];

		if (p.creditor === 0) {
			game.eliminatePlayer();
			return;
		}

		var HTML = "<p>" + player[p.creditor].name + ", you may unmortgage any of the following properties, interest free, by clicking on them. Click OK when finished.</p><table>";
		var price;

		for (var i = 0; i < 40; i++) {
			sq = square[i];
			if (sq.owner == p.index && sq.mortgage) {
				price = Math.round(sq.price * 0.5);

				HTML += "<tr><td class='propertycellcolor' style='background: " + sq.color + ";";

				if (sq.groupNumber == 1 || sq.groupNumber == 2) {
					HTML += " border: 1px solid grey;";
				} else {
					HTML += " border: 1px solid " + sq.color + ";";
				}

				// Player already paid interest, so they can unmortgage for the mortgage price.
				HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='propertycellname'><a href='javascript:void(0);' title='Unmortgage " + sq.name + " for $" + price + ".' onclick='if (" + price + " <= player[" + p.creditor + "].money) {player[" + p.creditor + "].pay(" + price + ", 0); square[" + i + "].mortgage = false; addAlert(\"" + player[p.creditor].name + " unmortgaged " + sq.name + " for $" + price + ".\");} this.parentElement.parentElement.style.display = \"none\";'>Unmortgage " + sq.name + " ($" + price + ")</a></td></tr>";

				sq.owner = p.creditor;

			}
		}

		HTML += "</table>";

		popup(HTML, game.eliminatePlayer);
	};

	this.resign = function() {
		popup("<p>Are you sure you want to resign?</p>", game.bankruptcy, "Yes/No");
	};

	this.bankruptcy = function() {
		var p = player[turn];
		var pcredit = player[p.creditor];
		var bankruptcyUnmortgageFee = 0;


		if (p.money >= 0) {
			return;
		}

		addAlert(p.name + " is bankrupt.");

		if (p.creditor !== 0) {
			pcredit.money += p.money;
		}

		for (var i = 0; i < 40; i++) {
			sq = square[i];
			if (sq.owner == p.index) {
				// Mortgaged properties will be tranfered by bankruptcyUnmortgage();
				if (!sq.mortgage) {
					sq.owner = p.creditor;
				} else {
					bankruptcyUnmortgageFee += Math.round(sq.price * 0.1);
				}

				if (sq.house > 0) {
					if (p.creditor !== 0) {
						pcredit.money += sq.houseprice * 0.5 * sq.house;
					}
					sq.hotel = 0;
					sq.house = 0;
				}

				if (p.creditor === 0) {
					sq.mortgage = false;
					game.addPropertyToAuctionQueue(i);
					sq.owner = 0;
				}
			}
		}

		updateMoney();

		if (p.chanceJailCard) {
			p.chanceJailCard = false;
			pcredit.chanceJailCard = true;
		}

		if (p.communityChestJailCard) {
			p.communityChestJailCard = false;
			pcredit.communityChestJailCard = true;
		}

		if (pcount === 2 || bankruptcyUnmortgageFee === 0 || p.creditor === 0) {
			game.eliminatePlayer();
		} else {
			addAlert(pcredit.name + " paid $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties received from " + p.name + ".");
			popup("<p>" + pcredit.name + ", you must pay $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties you received from " + p.name + ".</p>", function() {player[pcredit.index].pay(bankruptcyUnmortgageFee, 0); game.bankruptcyUnmortgage();});
		}
	};

}
