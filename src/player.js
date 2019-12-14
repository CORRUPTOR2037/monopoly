function Player(name, party, isAI) {
	this.name = name;
	this.position = 0
	this.party = party;
	this.money = startPayment;
	this.jail = false;
	this.vacation = false;
	this.missMove = 0;
	this.jailroll = 0;
	this.assemblyRating = party.startAssemblyRating;
	this.peopleRating = party.startPeopleRating;
	this.tickets = {
		"jailCard": 3,
		"ownCard": 3,
		"moveBillCard": 3,
		"createBillCard": 3,
		"gotoCard": 3
	}
	this.stats = {
		"state1": 0,
		"state2": 0,
		"state3": 0,
		"amandments": 0,
		"rejected": 0
	}
	this.human = !isAI;
	this.lobby = {};
	if (isAI) this.AI = new AITest(this);
	this.isAI = isAI;
	
	this.pay = function(amount){
		this.money -= amount;
		if (this.money < -startPayment) {
            bankrupt(this);
        }
		updateMoney();
	}
	
	this.style = this.party.style;
	
	this.chip = document.createElement('div');
	this.chip.className = 'player-chip ' + this.style;
	
	let lobby = this.lobby;
	lobbyTypes.forEach(function(t){
		lobby[t.name] = 0;
	});
	this.lobbyMoneyMultiplier = 1;
	
	this.setLobbyRating = function(name, value){
		value = Math.max(value, 0);
		value = Math.min(value, lobbyProgressLength - 1);
		this.lobby[name] = value;
		this.setPeopleRating(this.peopleRating);
	}
	this.setAssemblyRating = function(value){
		this.assemblyRating = Math.min(this.maxAssemblyRating(), value);
	}
	this.setPeopleRating = function(value){
		this.peopleRating = Math.min(this.maxPeopleRating(), value);
	}
	
	this.sessionStartPayment = function(){
		var result = {
			"default": startPayment,
			"partyFee": -party.fee
		};
		lobbyTypes.forEach(function(t){
			result[t.name] = lobby[t.name] * lobbyMoneyMultiplier;
		});
		return result;
	}
	
	this.addTicket = function(name){
		this.tickets[name]++;
	}
	this.removeTicket = function(name){
		this.tickets[name]--;
	}
	
	this.ratingsData = {
		"maxPeople": party.maxPeopleRating, "maxAssembly": party.maxAssemblyRating, "sessionPeopleBonus": party.sessionPeopleBonus
	}
	this.maxPeopleRating = function(){
		var result = this.ratingsData["maxPeople"];
		lobbyTypes.forEach(function(t){
			result -= lobby[t.name];
		});
		return result;
	}
	
	this.maxAssemblyRating = function(){
		return party.maxAssemblyRating;
	}
	
	this.sessionPeopleBonus = this.ratingsData["sessionPeopleBonus"];
}