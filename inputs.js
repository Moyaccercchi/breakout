// =============
// GATHER INPUTS
// =============

var HELP_KEY = 'H'.charCodeAt(0);
var CHEAT_KEY = 'X'.charCodeAt(0);

function gatherInputs() {
    // We only need to consider one special key: H for help.
    // All the others are handled somewhere else.
    if (eatKey(HELP_KEY)) {
        var paddle1text = "";
        var paddle2text = "";
        var spacetext = "";
        
        if (g_runmode === 0) {
            paddle1text = "[ W ] [ UP ] paddle 1 up, [ S ] [ DOWN ] paddle 1 down\n";
            paddle2text = "[ I ] paddle 2 up, [ K ] paddle 2 down\n";
        } else if (g_runmode === 1) {
            paddle1text = "[ W ] [ A ] [ UP ] [ LEFT ] paddle 1 up, " +
                          "[ S ] [ D ] [ RIGHT ] [ DOWN ] paddle 1 down\n";
            paddle2text = "[ I ] [ J ] paddle 2 up, [ K ] [ L ] paddle 2 down\n";
        } else if (g_runmode === 2) {
            paddle1text = "[ A ] [ W ] [ LEFT ] [ UP ] paddle 1 left, " +
                          "[ D ] [ S ] [ RIGHT ] [ DOWN ] paddle 1 right\n";
            paddle2text = "[ J ] [ I ] paddle 2 left, [ L ] [ K ] paddle 2 right\n";
        } else {
            paddle1text = "[ A ] [ LEFT ] paddle left, [ D ] [ RIGHT ] paddle right\n";
        }
        
        if (g_runmode > 2) {
            spacetext = "[ SPACE ] launch the ball from the paddle\n";
        }
    
        alert("Right now, you can use the following keys:\n\n" +
              paddle1text +
              paddle2text +
              spacetext +
              "[ H ] display help\n\n" + 
              "Debug stuff:\n" +
              "[ P ] toggle pause, [ O ] step ahead one step, [ C ] toggle clear\n" + 
              "[ B ] box, [ U ] undo box, [ F ] flipflop\n" + 
              "[ R ] toggle render, [ X ] jump to next event");
    }
    
    if (eatKey(CHEAT_KEY)) {
        set_runmode(g_runmode + 1);
    }
}
