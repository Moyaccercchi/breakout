// ===========
// BRICK STUFF
// ===========

var g_bricks = {
    brick : [],
    visible : false,
    brickwidth : 20,
    brickheight : 10,
    // the amount of pixels all bricks
    // are still moving until they stop again
    allVelY : 0,
    // if true, all blocks are moving horizontally continuously
    conthorzmove : false,
    // true for right, false for left
    conthorzdir : true
};

g_bricks.trashAll = function () {
    this.brick = [];
}

g_bricks.update = function (du) {
    // You shall not update invisible bricks!
    if (!this.visible) return;

    var len = this.brick.length;

    // fade out before going away
    for (var i = 0; i < len; i++) {
        if (!this.brick[i].cl) {
            this.brick[i].ca -= 0.05;
            this.brick[i].co = this.brick[i].cw + this.brick[i].ca + ")";
            
            if (this.brick[i].ca < 0) {
                this.brick.splice(i, 1);
            
                len = this.brick.length;
            }
        }
    }
    
    // moving vertically
    if (this.allVelY > 0) {
        // We divide by 3 to get a nicer, slower slide-in effect.
        var ourdu = min(du / 3, this.allVelY);
        this.allVelY -= ourdu;
        
        var our_bottom = g_real_height - 80;
        
        if (g_runmode < 5) {
             our_bottom = g_canvas_bottom - 60;
        }
        
        for (var i = 0; i < len; i++) {
            this.brick[i].ty += ourdu;
            this.brick[i].by += ourdu;
            
            if (this.brick[i].by > our_bottom) {
                this.brick[i].cl = false;
            }
        }
        
        // In level 2, we want more and more and more and more slide-ins!
        if ((g_runmode === 7) && (this.allVelY === 0)) {
            this.initLevelTwo();
        }
    }

    // moving horizontally
    if (this.conthorzmove) {
        // We divide by 3 to get a nicer, slower slide-in effect.
        var ourdu = du / 3;
        
        if (this.conthorzdir) {
            var compwith = g_walls.rightinneredge - 5;
            
            for (var i = 0; i < len; i++) {
                this.brick[i].lx += ourdu;
                this.brick[i].rx += ourdu;
                
                if (this.brick[i].rx > compwith) {
                    this.conthorzdir = false;
                }
            }
        } else {
            var compwith = g_walls.leftinneredge + 5;

            for (var i = 0; i < len; i++) {
                this.brick[i].lx -= ourdu;
                this.brick[i].rx -= ourdu;
                
                if (this.brick[i].lx < compwith) {
                    this.conthorzdir = true;
                }
            }
        }
    }
    
    if ((len === 0) && (!g_gameover)) {
        if (g_runmode < 7) {
            set_runmode(g_runmode + 1);
        } else {
            g_messages.display("YOU WON THE GAME! =)");
            g_gameover = true;
        }
    }
};

g_bricks.render = function (ctx) {
    // You shall not render invisible bricks!
    if (!this.visible) return;

    var len = this.brick.length;

    for (var i = 0; i < len; i++) {
        ctx.fillStyle = this.brick[i].co;
        
        ctx.fillRect(this.brick[i].lx, this.brick[i].ty,
                     this.brick[i].wx, this.brick[i].hy);
    }
    
    // We draw white above the walls just in
    // case we are throwing in rows, so that
    // they are not visible early on
    if (g_runmode === 4) {
        ctx.fillStyle = g_field.color;
        ctx.fillRect(g_canvas_left, g_canvas_top,
                     g_canvas_right - g_canvas_left,
                     g_walls.topouteredge - g_canvas_top);
    }

    if (g_runmode > 6) {
        ctx.fillStyle = g_field.color;
        ctx.fillRect(0, 0, g_real_width, g_walls.topouteredge);
    }
};

g_bricks.initBreakoutBW = function () {
    this.visible = true;
    
    brickwidth = (g_walls.rightinneredge - (g_walls.leftinneredge + 2)) / 10;
    brickheight = 20;
    var topedge = g_walls.topinneredge + brickheight + 2;
    
    for (var i = 0; i < 50; i++) {
        this.brick[i] = {
            lx : 2 + g_walls.leftinneredge + ((i % 10) * brickwidth),              // left x
            ty : topedge + (parseInt(i / 10) * brickheight),                       // top y
            rx : g_walls.leftinneredge + ((i % 10) * brickwidth) + brickwidth - 1, // right x
            by : topedge + (parseInt(i / 10) * brickheight) + brickheight - 2,     // bottom y
            wx : brickwidth - 2,  // width
            hy : brickheight - 2, // height
            ro : 0,               // rotation
            co : "#000000",       // color
            ca : 1,               // colalpha
            cw : "rgba(0,0,0,",   // colwoalpha
            cl : true,            // not true if this brick is supposed to be erased soon
            de : false,           // is this brick destructible? true or false
            mo : 0                // mode, 0: black, 1: colourful
        };
    }
}

g_bricks.initLevelTwo = function () {
    g_bricks.addRowFromTop("rgba(255,255,0,");
    g_bricks.addRowFromTop("rgba(255,192,0,");
    g_bricks.addRowFromTop("rgba(255,128,0,");
    g_bricks.addRowFromTop("rgba(255,64,64,");
    g_bricks.addRowFromTop("rgba(192,0,128,");
    g_bricks.addRowFromTop("rgba(128,0,192,");
    g_bricks.addRowFromTop("rgba(64,64,255,");
    g_bricks.addRowFromTop("rgba(0,128,255,");
    g_bricks.addRowFromTop("rgba(0,192,255,");
    g_bricks.addRowFromTop("rgba(0,255,255,");
    g_bricks.addRowFromTop("rgba(64,255,192,");
    g_bricks.addRowFromTop("rgba(128,255,128,");
    g_bricks.addRowFromTop("rgba(192,255,64,");
}

g_bricks.addRowFromTop = function (colwoalpha) {
    // We are subtracting this.allVelY because there might still be previous
    // rows sliding in, in which case this row needs to start higher to not
    // come in on top of the other one.
    var topedge = g_walls.topinneredge + brickheight + 2 - ((2 * brickheight) + this.allVelY);
    
    var len = this.brick.length;
    var color = colwoalpha + "1)";

    for (var i = 0; i < 10; i++) {
        this.brick[i + len] = {
            lx : 2 + g_walls.leftinneredge + ((i % 10) * brickwidth),              // left x
            ty : topedge + (parseInt(i / 10) * brickheight),                       // top y
            rx : g_walls.leftinneredge + ((i % 10) * brickwidth) + brickwidth - 1, // right x
            by : topedge + (parseInt(i / 10) * brickheight) + brickheight - 2,     // bottom y
            wx : brickwidth - 2,  // width
            hy : brickheight - 2, // height
            ro : 0,               // rotation
            co : color,           // color
            ca : 1,               // colalpha
            cw : colwoalpha,      // colwoalpha
            cl : true,            // not true if this brick is supposed to be erased soon
            de : true,            // is this brick destructible? true or false
            mo : 1                // mode, 0: black, 1: colourful
        };
    }
    
    this.allVelY += brickheight;
}

// We set the alphas of all bricks to the given value.
g_bricks.setAllAlphas = function (alpha) {
    var len = this.brick.length;

    for (var i = 0; i < len; i++) {
        this.brick[i].ca = alpha;
        this.brick[i].co = this.brick[i].cw + alpha + ")";
    }
}

g_bricks.setBlackColwoalpha = function (colwoalpha) {
    var len = this.brick.length;

    for (var i = 0; i < len; i++) {
        if (this.brick[i].mo === 0) {
            this.brick[i].cw = colwoalpha;
            this.brick[i].co = colwoalpha + this.brick[i].ca + ")";
        }
    }
}

// We set the destructible-values of all bricks to the given value.
g_bricks.setAllDestructibles = function (destructible) {
    var len = this.brick.length;

    for (var i = 0; i < len; i++) {
        this.brick[i].de = destructible;
    }
}

g_bricks.collidesHorz = function (prevX, prevY, 
                                  nextX, nextY, r) {
    // You cannot collide with invisible bricks.
    if (!this.visible) return false;

    var len = this.brick.length;

    for (var i = 0; i < len; i++) {
        var brickEdge = (this.brick[i].lx + this.brick[i].rx) / 2;
        // Check X coords
        if ((nextX - r < brickEdge && prevX - r >= brickEdge) ||
            (nextX + r > brickEdge && prevX + r <= brickEdge)) {
            // Check Y coords
            if (nextY + r >= this.brick[i].ty &&
                nextY - r <= this.brick[i].by) {
                // It's a hit!
                if (this.brick[i].cl && this.brick[i].de) {
                    this.brick[i].cl = false;
                    g_score.oneMoreBrick((prevX + nextX) / 2, (prevY + nextY) / 2);
                }
                
                return true;
            }
        }
    }
    
    // It's a miss!
    return false;
};

g_bricks.collidesVert = function (prevX, prevY, 
                                  nextX, nextY, r) {
    // You cannot collide with invisible bricks.
    if (!this.visible) return false;

    var len = this.brick.length;

    for (var i = 0; i < len; i++) {
        var brickEdge = (this.brick[i].ty + this.brick[i].by) / 2;
        // Check Y coords
        if ((nextY - r < brickEdge && prevY - r >= brickEdge) ||
            (nextY + r > brickEdge && prevY + r <= brickEdge)) {
            // Check X coords
            if (nextX + r >= this.brick[i].lx &&
                nextX - r <= this.brick[i].rx) {
                // It's a hit!
                if (this.brick[i].cl && this.brick[i].de) {
                    this.brick[i].cl = false;
                    g_score.oneMoreBrick((prevX + nextX) / 2, (prevY + nextY) / 2);
                }
                
                return true;
            }
        }
    }
    
    // It's a miss!
    return false;
};
