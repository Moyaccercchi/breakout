// BREAKOUT
//
// written 3.10.2013 by Tom Schiller, tws1@hi.is
// 
// Press 'H' ingame for an overview of the available keys.
// Enjoy. =)

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// Here we throw in some canvas-fu to get everything scaled nicely
var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");
var g_real_width = window.innerWidth;
var g_real_height = window.innerHeight;
var g_canvas_left = 8;
var g_canvas_top = 8;
var g_canvas_right = 409;
var g_canvas_bottom = 409;
g_ctx.canvas.width = g_real_width;
g_ctx.canvas.height = g_real_height;
var g_gameover = false;


// =============
// RUNMODE STUFF
// =============

// This variable tells us, in which section of the game we are.
// It changes the behavior of the system quite radically!
// 0 .. PONG
// 1 .. Rotating PONG into BREAKOUT B/W
// 2 .. Fading out the PONG leftovers
// 3 .. Fading in the BREAKOUT B/W stuff
// 4 .. BREAKOUT B/W
// 5 .. Animation of breaking through the floor etc.
// 6 .. BREAKOUT :: Level 1
// 7 .. BREAKOUT :: Level 2
var g_runmode = 0;

// Coordinates the changes from one runmode to the next.
function set_runmode(newmode) {
    // In this case, we have been rotating into the breakout mode,
    // and now we need to quickly rotate back to normal, and change
    // the positions of all the thingies on the screen accordingly!
    if (newmode === 2) {
        g_field.rotation = 0;
        
        g_paddle1.turn();
        g_paddle2.turn();
        g_ball.turn();
        
        g_score.turn();
        
        window.document.title = "BREAKOUT";
        
        setTimeout(messageMoveAD,4000);
    } else if (newmode === 3) {
        g_paddle2.visible = false;
        
        g_walls.colalpha = 0;
        g_walls.color = g_walls.colwoalpha + g_walls.colalpha + ")";
        g_walls.visible = true;
        
        g_bricks.initBreakoutBW();
        
        if (g_ball.cy < g_walls.topinneredge) {
            g_ball.cy = g_walls.topinneredge;
        }
        
        if (g_ball.cx < g_walls.leftinneredge) {
            g_ball.cx = g_walls.leftinneredge;
        }
        
        if (g_ball.cx > g_walls.rightinneredge) {
            g_ball.cx = g_walls.rightinneredge;
        }
    } else if (newmode === 4) {
        g_walls.colalpha = 1;
        g_walls.color = g_walls.colwoalpha + g_walls.colalpha + ")";
        g_bricks.setAllAlphas(g_walls.colalpha);
        g_bricks.setAllDestructibles(true);
        g_score.color = g_walls.color;
    } else if (newmode === 5) {
        g_score.bl = 5;
        g_score.blvl = 1;
    } else if (newmode === 6) {
        g_paddle1.cy = g_real_height - (g_paddle1.halfHeight + 20);

        g_field.colalpha = 1;
        g_field.color = g_field.colwoalpha + "1)";

        g_score.gobyrealsize = true;
        g_walls.setToRealSize();
        g_bricks.conthorzmove = true;
        g_paddle1.style = 1;

        g_ball.color = g_field.oppwoalpha + "1)";

        g_score.color = g_ball.color;
        g_paddle1.color = g_ball.color;
        g_walls.color = g_ball.color;

        g_bricks.setBlackColwoalpha("rgba(255,255,255,");
    } else if (newmode === 7) {
        g_score.blvl = 2;

        if (g_walls.rightouteredge - g_walls.leftouteredge > 381) {
            var ourdu = (g_walls.rightouteredge - (g_walls.leftouteredge + 381)) / 2;
        
            g_walls.leftouteredge += ourdu;
            g_walls.leftinneredge += ourdu;
            g_walls.rightinneredge -= ourdu;
            g_walls.rightouteredge -= ourdu;
            
            // We move the paddle if it is in the way.
            g_paddle1.cx = min(max(g_paddle1.cx,
                           g_walls.leftinneredge + g_paddle1.halfWidth),
                           g_walls.rightinneredge - g_paddle1.halfWidth);
                           
            // We move the ball if it is in the way.
            g_ball.cx = min(max(g_ball.cx,
                         g_walls.leftinneredge + g_ball.radius),
                         g_walls.rightinneredge - g_ball.radius);
        }

        g_bricks.trashAll();
        g_bricks.conthorzmove = false;
        g_bricks.initLevelTwo();
    } else if (newmode > 7) {
        // Prevent overshooting with the cheat-key
        newmode = 7;
    }

    g_runmode = newmode;
}


// ============
// PADDLE STUFF
// ============

// PADDLE 1

var KEY_W = 'W'.charCodeAt(0);
var KEY_S = 'S'.charCodeAt(0);
var KEY_A = 'A'.charCodeAt(0);
var KEY_D = 'D'.charCodeAt(0);
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

var g_paddle1 = new Paddle({
    cx : 38,
    cy : 100,
    rotation : 0,
    
    GO_UP     : KEY_W,
    GO_DOWN   : KEY_S,
    GO_LEFT   : KEY_A,
    GO_RIGHT  : KEY_D,
    GO_UP2    : KEY_UP,
    GO_DOWN2  : KEY_DOWN,
    GO_LEFT2  : KEY_LEFT,
    GO_RIGHT2 : KEY_RIGHT
});


// PADDLE 2

var KEY_I = 'I'.charCodeAt(0);
var KEY_K = 'K'.charCodeAt(0);
var KEY_J = 'J'.charCodeAt(0);
var KEY_L = 'L'.charCodeAt(0);

var g_paddle2 = new Paddle({
    cx : 378,
    cy : 300,
    rotation : 0,
    
    GO_UP     : KEY_I,
    GO_DOWN   : KEY_K,
    GO_LEFT   : KEY_J,
    GO_RIGHT  : KEY_L,
    GO_UP2    : KEY_I,
    GO_DOWN2  : KEY_K,
    GO_LEFT2  : KEY_J,
    GO_RIGHT2 : KEY_L
});


// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`


// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {
    
    g_field.update(du);
    g_score.update(du);
    g_messages.update(du);

    // We want to update the bricks before the ball,
    // such that we can erase the cleared bricks
    // from last turn.
    g_bricks.update(du);
    g_walls.update(du);
    g_ball.update(du);
    
    g_paddle1.update(du);
    g_paddle2.update(du);
    
    g_sprites.update(du);
}


// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {
    
    // We render the bricks before we render the score,
    // as they overpaint the area where the score is
    // - at least in runmode 4.
    g_bricks.render(ctx);

    g_messages.render(ctx);
    g_score.render(ctx);
    g_sprites.render(ctx);
    
    g_paddle1.render(ctx);
    g_paddle2.render(ctx);
    
    g_walls.render(ctx);

    g_ball.render(ctx);
}

// Kick it off.
// This function btw. can be found in g_sprites.js =)
preload(0);