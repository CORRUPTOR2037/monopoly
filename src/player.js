function Player(name, party, isAI) {
	this.name = name;
	this.position = 0
	this.party = party;
	this.money = startPayment;
	this.jail = false;
	this.vacation = false;
	this.jailroll = 0;
	this.communityChestJailCard = false;
	this.chanceJailCard = false;
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
}