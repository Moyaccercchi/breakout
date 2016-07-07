// GENERIC RENDERING

var g_doClear = true;
var g_doBox = false;
var g_undoBox = false;
var g_doFlipFlop = false;
var g_doRender = true;

var g_frameCounter = 1;

var TOGGLE_CLEAR = 'C'.charCodeAt(0);
var TOGGLE_BOX = 'B'.charCodeAt(0);
var TOGGLE_UNDO_BOX = 'U'.charCodeAt(0);
var TOGGLE_FLIPFLOP = 'F'.charCodeAt(0);
var TOGGLE_RENDER = 'R'.charCodeAt(0);

function render(ctx) {

    ctx.save();

    if (!(g_field.rotation === 0)) {
        ctx.translate(((g_canvas_right - g_canvas_left) / 2) + g_canvas_left,
                      ((g_canvas_bottom - g_canvas_top) / 2) + g_canvas_top);
        ctx.rotate(g_field.rotation);
        ctx.translate(- ((g_canvas_right - g_canvas_left) / 2) - g_canvas_left,
                      - ((g_canvas_bottom - g_canvas_top) / 2) - g_canvas_top);
    }

    ctx.fillStyle = "#000000";
    
    // Process various option toggles
    //
    if (eatKey(TOGGLE_CLEAR)) g_doClear = !g_doClear;
    if (eatKey(TOGGLE_BOX)) g_doBox = !g_doBox;
    if (eatKey(TOGGLE_UNDO_BOX)) g_undoBox = !g_undoBox;
    if (eatKey(TOGGLE_FLIPFLOP)) g_doFlipFlop = !g_doFlipFlop;
    if (eatKey(TOGGLE_RENDER)) g_doRender = !g_doRender;
    
    // I've pulled the clear out of `renderSimulation()` and into
    // here, so that it becomes part of our "diagnostic" wrappers
    //
    // We cannot just call clearCanvas(ctx); here, as we instead
    // want to clear the field which is more complicated.
    // Otherwise, if we cleared the field later on, then we'd
    // overwrite the fillBox-thingy with the empty field.
    // So therefore we call the field-rendering stuff here already. =)
    // 
    if (g_doClear) g_field.render(ctx);
    
    // The main purpose of the box is to demonstrate that it is
    // always deleted by the subsequent "undo" before you get to
    // see it...
    //
    // i.e. double-buffering prevents flicker!
    //
    if (g_doBox) fillBox(ctx, 200, 200, 50, 50, "red");
    
    
    // The core rendering of the actual game / simulation
    //
    if (g_doRender) renderSimulation(ctx);
    
    
    // This flip-flip mechanism illustrates the pattern of alternation
    // between frames, which provides a crude illustration of whether
    // we are running "in sync" with the display refresh rate.
    //
    // e.g. in pathological cases, we might only see the "even" frames.
    //
    if (g_doFlipFlop) {
        var boxX = 250,
            boxY = g_isUpdateOdd ? 100 : 200;
        
        // Draw flip-flop box
        fillBox(ctx, boxX, boxY, 50, 50, "green");
        
        // Display the current frame-counter in the box...
        ctx.fillText(g_frameCounter % 1000, boxX + 10, boxY + 20);
        // ..and its odd/even status too
        var text = g_frameCounter % 2 ? "odd" : "even";
        ctx.fillText(text, boxX + 10, boxY + 40);
    }
    
    // Optional erasure of diagnostic "box",
    // to illustrate flicker-proof double-buffering
    //
    if (g_undoBox) ctx.clearRect(200, 200, 50, 50);
    
    if (g_runmode < 5) {
        // We draw white over everything that shouldn't be full of stuff just yet.
        // And yes, we draw a lot further than what can actually displayed,
        // because we'll also rotate, and you never know...
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(-g_real_width, -g_real_height,
                     g_real_width * 2, g_canvas_top + g_real_height);
        ctx.fillRect(-g_real_width, -g_real_height,
                     g_canvas_left + g_real_width, g_real_height * 2);
        ctx.fillRect(g_canvas_right, -g_real_height,
                     g_real_width, g_real_height * 2);
        ctx.fillRect(-g_real_width, g_canvas_bottom,
                     g_real_width * 2, g_real_height);
    }
    if (g_runmode < 6) {
        ctx.strokeWidth = 1;
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(g_canvas_left + 0.5, g_canvas_top + 0.5,
                       g_canvas_right - g_canvas_left,
                       g_canvas_bottom - g_canvas_top);
    }
    
    ctx.restore();
    
    ++g_frameCounter;
}