// ==========
// BALL STUFF
// ==========

// BALL STUFF

var g_ball = {
    cx: 50,
    cy: 200,
    radius: 10,
    color: "#000000",
    sticktopaddle: false, // true after resetting
    meteor: false, // upgrade to meteor mode

    xVel: 5,
    yVel: 4
};

KEY_SPACE = ' '.charCodeAt(0);

var g_launched = false;

g_ball.update = function (du) {
    if (eatKey(KEY_SPACE)) {
        if (g_gameover) return;
        if (this.sticktopaddle) {
            this.sticktopaddle = false;
            g_launched = true;
        }
    }
    
    if (this.sticktopaddle) {
        // We want to do this even if g_gameover is true.
        this._updateSticky();
    } else {
        this._updateNormal(du);
    }
}

g_ball._updateSticky = function () {
    this.cy = g_paddle1.cy - (g_paddle1.halfHeight + (this.radius * 0.8));
    this.cx = g_paddle1.cx;
}

g_ball._updateNormal = function (du) {
    // Remember my previous position
    var prevX = this.cx;
    var prevY = this.cy;
    
    // Compute my provisional new position (barring collisions)
    var nextX = prevX + this.xVel * du;
    var nextY = prevY + this.yVel * du;

    // Bounce off the paddles
    if (g_runmode < 2) {
        // Horizontal bounceing from vertical paddles
        if (g_paddle1.collidesHorz(prevX, prevY, nextX, nextY, this.radius) ||
            g_paddle2.collidesHorz(prevX, prevY, nextX, nextY, this.radius))
        {
            this.xVel *= -1;
        
            // We update nextX accordingly.
            nextX = prevX + this.xVel * du;
        }
    } else {
        // Vertical bounceing from horizontal paddles
        if (g_paddle1.collidesVert(prevX, prevY, nextX, nextY, this.radius) ||
            g_paddle2.collidesVert(prevX, prevY, nextX, nextY, this.radius))
        {
            if (g_paddle1.alwaysSticky) {
                this.yVel = - abs(this.yVel);

                this.sticktopaddle = true;
                this._updateSticky();
                return;
            }
            
            if (g_paddle1.style === 1) {
                origSpeed = Math.sqrt((this.xVel*this.xVel)
                                    + (this.yVel*this.yVel));
                this.xVel = min(5, max(-5, (this.cx - g_paddle1.cx) /
                            (abs(this.xVel) * g_paddle1.halfWidth)));
                this.yVel = - 1;
                newSpeed = Math.sqrt((this.xVel*this.xVel)
                                   + (this.yVel*this.yVel));
                this.xVel *= origSpeed / newSpeed;
                this.yVel *= origSpeed / newSpeed;

                // We update nextY accordingly.
                nextY = prevY + this.yVel * du;
                // We update nextX accordingly.
                nextX = prevX + this.xVel * du;
            } else {
                this.yVel = - abs(this.yVel);
        
                // We update nextY accordingly.
                nextY = prevY + this.yVel * du;
            }
        }
        
        if (g_runmode > 2) {
            // While the bricks are fading in, we want
            // to let the ball phase through them if it
            // goes downwards, and only collide with them
            // if it goes upwards.
            if ((g_runmode > 3) || (this.yVel < 0)) {
                // Vertical bounceing from horizontal sides of bricks
                if (g_bricks.collidesVert(prevX, prevY, nextX, nextY, this.radius)) {
                    if (this.meteor === false) {
                        this.yVel *= -1;
                    }
            
                    // We update nextY accordingly.
                    nextY = prevY + this.yVel * du;
                }
                
                // Horizontal bounceing from vertical sides of bricks
                if (g_bricks.collidesHorz(prevX, prevY, nextX, nextY, this.radius)) {
                    if (this.meteor === false) {
                        this.xVel *= -1;
                    }
            
                    // We update nextX accordingly.
                    nextX = prevX + this.xVel * du;
                }
            }
        }
    }
    
    // Bounce off top and bottom edges
    if (g_runmode < 3) {
        if (nextY < g_canvas_top ||
            nextY > g_canvas_bottom) {
            if (nextY < g_canvas_top) {
                this.yVel = abs(this.yVel);
            } else {
                this.yVel = - abs(this.yVel);
            }
                        
            if (g_runmode === 2) {
                // We give the players their points if we are in the pong-part =)
                if (nextY < g_canvas_top) {
                    g_score.p1 += 1;
                } else {
                    g_score.p2 += 1;
                }
            }
        }
    } else {
        var cur_bottom;
        
        if (g_runmode < 5) {
            cur_bottom = g_canvas_bottom;
        } else {
            cur_bottom = g_real_height;
        }
        
        if (nextY < g_walls.topinneredge ||
            nextY > cur_bottom) {
            if (nextY < g_walls.topinneredge) {
                this.yVel = abs(this.yVel);
            } else {
                this.yVel = - abs(this.yVel);
            }
            
            if (nextY > cur_bottom) {
                // We lose a life.
                g_score.bl -= 1;
                
                if (g_score.bl < 0 && g_runmode < 5) {
                    set_runmode(5);
                    this.yVel = abs(this.yVel);
                } else {
                    if (!g_launched) {
                        setTimeout(messageLaunch,2000);
                    }
                
                    this.reset();
                }
            }
        }
    }

    // Bounce off left and right edges
    if (g_runmode < 3) {
        if (nextX < g_canvas_left || 
            nextX > g_canvas_right) {
            if (nextX < g_canvas_left) {
                this.xVel = abs(this.xVel);
            } else {
                this.xVel = - abs(this.xVel);
            }
            
            if (g_runmode < 2) {
                // We give the players their points if we are in the pong-part =)
                if (nextX < g_canvas_left) {
                    g_score.p2 += 1;
                } else {
                    g_score.p1 += 1;
                }
            }
        }
    } else {
        if (nextX < g_walls.leftinneredge || 
            nextX > g_walls.rightinneredge) {
            if (nextX < g_walls.leftinneredge) {
                this.xVel = abs(this.xVel);
            } else {
                this.xVel = - abs(this.xVel);
            }
        }
    }

    // *Actually* update my position 
    // ...using whatever velocity I've ended up with
    //
    this.cx += this.xVel * du;
    this.cy += this.yVel * du;
};

g_ball.turn = function () {
    var i = this.cy;
    this.cy = 9 + g_canvas_right - this.cx;
    this.cx = i;

    var i = this.yVel;
    this.yVel = - this.xVel;
    this.xVel = i;
}

g_ball.reset = function () {
    this.sticktopaddle = true;
    this.xVel = -5;
    this.yVel = -4;
    // We want to update immediately to not
    // draw another frame before changing the
    // position on the screen.
    this.update(0);
};

g_ball.render = function (ctx) {
    if (this.meteor) {
        ctx.fillStyle = "#FF2020";
    } else {
        ctx.fillStyle = this.color;
    }
    fillCircle(ctx, this.cx, this.cy, this.radius);
};