// A generic constructor which accepts an arbitrary descriptor object
function Paddle(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }
}

// Add these properties to the prototype, where they will server as
// shared defaults, in the absence of an instance-specific overrides.

Paddle.prototype.halfWidth = 10;
Paddle.prototype.halfHeight = 50;
Paddle.prototype.color = "#000000";
Paddle.prototype.visible = true;
Paddle.prototype.shootLasers = false;
Paddle.prototype.alwaysSticky = false;
Paddle.prototype.velX = 7;
// 0 .. box
// 1 .. box with rounded corners
Paddle.prototype.style = 0;

Paddle.prototype.update = function (du) {
    // You cannot update an invisible paddle.
    if (!this.visible || g_gameover) return;

    var PAD_UP = g_keys[this.GO_UP] || g_keys[this.GO_UP2];
    var PAD_DOWN = g_keys[this.GO_DOWN] || g_keys[this.GO_DOWN2];
    var PAD_LEFT = g_keys[this.GO_LEFT] || g_keys[this.GO_LEFT2];
    var PAD_RIGHT = g_keys[this.GO_RIGHT] || g_keys[this.GO_RIGHT2];
    
    if (PAD_LEFT || PAD_RIGHT) {
        g_ADpressed = true;
    }

    if (g_runmode === 0) {
        if (PAD_UP) {
            this.cy = max(this.cy - 5 * du, g_canvas_top + this.halfHeight);
        }
        if (PAD_DOWN) {
            this.cy = min(this.cy + 5 * du, g_canvas_bottom - this.halfHeight);
        }
    } else if (g_runmode === 1) {
        // During the rotation, we want to already allow for left and right
        // keys to be used.
        if (PAD_UP || PAD_LEFT) {
            this.cy = max(this.cy - 5 * du, g_canvas_top + this.halfHeight);
        }
        if (PAD_DOWN || PAD_RIGHT) {
            this.cy = min(this.cy + 5 * du, g_canvas_bottom - this.halfHeight);
        }
    } else if (g_runmode === 2) {
        // We want to give the player at least a short interval
        // in which both UP and LEFT lead to left movement, and
        // both DOWN and RIGHT lead to right movement.
        if (PAD_LEFT || PAD_UP) {
            this.cx = max(this.cx - 5 * du, g_canvas_left + this.halfWidth);
        }
        if (PAD_RIGHT || PAD_DOWN) {
            this.cx = min(this.cx + 5 * du, g_canvas_right - this.halfWidth);
        }
    } else if ((g_runmode > 2) && (g_runmode < 5)) {
        if (PAD_LEFT) {
            this.cx = max(this.cx - 5 * du, g_walls.leftinneredge + this.halfWidth);
        }
        if (PAD_RIGHT) {
            this.cx = min(this.cx + 5 * du, g_walls.rightinneredge - this.halfWidth);
        }
    } else if (g_runmode > 4) {
        if (PAD_LEFT) {
            this.cx = max(this.cx - this.velX * du, g_walls.leftinneredge + this.halfWidth);
        }
        if (PAD_RIGHT) {
            this.cx = min(this.cx + this.velX * du, g_walls.rightinneredge - this.halfWidth);
        }
    }
    
    if (g_runmode === 5) {
        this.cy = min(this.cy + 5 * du, g_real_height - (this.halfHeight + 20));
    }
};

Paddle.prototype.turn = function () {
    var i = this.cy;
    this.cy = 9 + g_canvas_right - this.cx;
    this.cx = i;

    i = this.halfWidth;
    this.halfWidth = this.halfHeight;
    this.halfHeight = i;
}

Paddle.prototype.render = function (ctx) {
    // You cannot render an invisible paddle.
    if (!this.visible) return;

    ctx.fillStyle = this.color;
    
    // (cx, cy) is the centre; must offset it for drawing
    ctx.fillRect(this.cx - this.halfWidth,
                 this.cy - this.halfHeight,
                 this.halfWidth * 2,
                 this.halfHeight * 2);

    if (this.style === 1) {
        ctx.beginPath();
        ctx.arc(this.cx - this.halfWidth, this.cy,
                this.halfHeight, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.cx + this.halfWidth, this.cy,
                this.halfHeight, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
    }
};

Paddle.prototype.collidesHorz = function (prevX, prevY, 
                                       nextX, nextY, r) {
    // You cannot collide with an invisible paddle.
    if (!this.visible) return false;

    var paddleEdge = this.cx;
    // Check X coords
    if ((nextX - r < paddleEdge && prevX - r >= paddleEdge) ||
        (nextX + r > paddleEdge && prevX + r <= paddleEdge)) {
        // Check Y coords
        if (nextY + r >= this.cy - this.halfHeight &&
            nextY - r <= this.cy + this.halfHeight) {
            // It's a hit!
            return true;
        }
    }
    // It's a miss!
    return false;
};

Paddle.prototype.collidesVert = function (prevX, prevY, 
                                       nextX, nextY, r) {
    // You cannot collide with an invisible paddle.
    if (!this.visible) return false;

    var paddleEdge = this.cy;
    // Check Y coords
    if ((nextY - r < paddleEdge && prevY - r >= paddleEdge) ||
        (nextY + r > paddleEdge && prevY + r <= paddleEdge)) {
        // Check Y coords
        if (nextX + r >= this.cx - this.halfWidth &&
            nextX - r <= this.cx + this.halfWidth) {
            // It's a hit!
            return true;
        }
    }
    // It's a miss!
    return false;
};

// Upgrade-thingies also collide with paddles
Paddle.prototype.upCollidesVert = function (prevX, prevY, 
                                       nextX, nextY, w, h) {
    // You cannot collide with an invisible paddle.
    if (!this.visible) return false;

    var paddleEdge = this.cy;
    // Check Y coords
    if ((nextY - h < paddleEdge && prevY - h >= paddleEdge) ||
        (nextY + h > paddleEdge && prevY + h <= paddleEdge)) {
        // Check Y coords
        if (nextX + w >= this.cx - this.halfWidth &&
            nextX - w <= this.cx + this.halfWidth) {
            // It's a hit!
            return true;
        }
    }
    // It's a miss!
    return false;
};