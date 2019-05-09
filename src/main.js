function MonopolyLib(){
    
    var self = this;
    this.loaded = false;
    this.load_handler = undefined;
    
    function load_script(src, onload){
        var script = document.createElement('script');
        script.onload = function(){
            onload();
        };
        script.src = src;
        document.head.appendChild(script);
    }
    
    var scripts = [
        'ai',
        'gamestate',
        'player',
        'trade',
        'monopoly'
    ]
    
    
    function load(index) {
        if (index >= scripts.length){
            if (self.load_handler) 
                self.load_handler();
            self.loaded = true;
            return;
        }
    
        var src = 'src/' + scripts[index] + '.js';
        load_script(src, function(){
            load(index + 1);
        });
    }
    
    load(0);
    
    this.onload = function(handler){
        if (self.loaded) {
            handler();
        } else {
            self.load_handler = handler;
        }
    };
}

var MonopolyLib = new MonopolyLib();