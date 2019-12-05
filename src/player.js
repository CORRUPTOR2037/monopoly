function Player(name, party, isAI) {
	this.name = name;
	this.position = 0
	this.party = party;
	this.money = startPayment;
	this.jail = false;
	this.vacation = false;
	this.jailroll = 0;
	this.assemblyRating = 0;
	this.peopleRating = 0;
	this.tickets = {
		"jailCard": 0,
		"amendCard": 0,
		"moveBillCard": 0,
		"createBillCard": 0,
		"gotoCard": 0
	}
	this.stats = {
		"state1": 0,
		"state2": 0,
		"state3": 0,
		"amandments": 0
	}
	this.bidding = true;
	this.human = !isAI;
	this.lobby = {};
	if (isAI) this.AI = new AITest(this);
	
	this.pay = function(amount){
		this.money -= amount;
		if (this.money < -startPayment) {
            bankrupt(this);
        }
		updateMoney();
	}
	
	this.style = this.party.style;
	
	this.acceptedBills = 0
	this.rejectedBills = 0
	
	this.chip = document.createElement('div');
	this.chip.className = 'player-chip ' + this.style;
	
	let lobby = this.lobby;
	lobbyTypes.forEach(function(t){
		lobby[t] = 0;
	});
	
	this.addTicket = function(name){
		this.tickets[name]++;
	}
}