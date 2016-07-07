// ===========
// SPRITE STUFF
// ===========

var g_sprites = {
    // The following two arrays contain the names of the
    // upgrades that we want to store.
    upx: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    upy: [0, 0, 1, 1, 2, 2, 3, 3, 5, 5],
    // This two-dimensional array contains all the
    // upgrade-pictures.
    upi: [],
    // These integers contain the half-width and half-height
    // of every upgrade-thingy.
    upw: 0,
    uph: 0,
    // This array contains all the currently visible
    // upgrade-objects.
    ups: []
};

g_sprites.update = function (du) {
    for (var i = 0; i < this.ups.length; i++) {
        var prevX = this.ups[i].cx;
        var prevY = this.ups[i].cy;
    
        // Compute my provisional new position (barring collisions)
        var nextX = prevX + this.ups[i].xVel * du;
        var nextY = prevY + this.ups[i].yVel * du;

        // Bounce off the paddle
        if (g_paddle1.upCollidesVert(prevX, prevY, nextX, nextY, this.upw, this.uph)) {
            this.applyUpgrade(this.ups[i].nx, this.ups[i].ny);
            this.ups.splice(i, 1);
        } else {
            this.ups[i].cy = nextY;
            this.ups[i].cx = nextX;
            
            // We take the upgrades out that fall out of the visible
            // screen.
            if (this.ups[i].cy + this.uph > g_real_height) {
                this.ups.splice(i, 1);
            }
        }
    }
};

g_sprites.render = function (ctx) {
    for (var i = 0; i < this.ups.length; i++) {
        var u = this.ups[i];
    
        // We actually draw the image to the canvas.
        ctx.drawImage(this.upi[u.nx][u.ny], u.cx - this.upw, u.cy - this.uph);
    }
};

// determine whether or not upgrade num would be stupid right now
g_sprites.upStupid = function (num) {
    if (num < 0) {
        return true;
    }

    var ny = this.upy[num];
    
    if (this.upx[num] === 0) {
        if ((ny === 0) && ((g_ball.xVel*g_ball.xVel) + (g_ball.yVel*g_ball.yVel) < 20)) {
            return true;
        } else if ((ny === 1) && (g_paddle1.halfWidth > 100)) {
            return true;
        } else if ((ny === 2) && g_paddle1.alwaysSticky) {
            return true;
        } else if ((ny === 3) && g_ball.meteor) {
            return true;
        } else if ((ny === 4) && g_paddle1.shootLasers) {
            return true;
        } else if ((ny === 5) && (g_ball.radius > 30)) {
            return true;
        }
    } else {
        if ((ny === 1) && (g_paddle1.halfWidth < 20)) {
            return true;
        } else if ((ny === 2) && ((g_paddle1.alwaysSticky === false) ||
                                  (g_paddle1.shootLasers === false))) {
            return true;
        } else if ((ny === 3) && (g_ball.meteor === false)) {
            return true;
        } else if ((ny === 5) && (g_ball.radius < 5)) {
            return true;
        }
    }
    
    return false;
};

g_sprites.addUpgrade = function (posx, posy) {
    for (var num = -1; this.upStupid(num);
        num = Math.floor(Math.random()*this.upx.length)) {
    }

    this.ups[this.ups.length] = {
        cx: posx,
        cy: posy,
        xVel: 0,
        yVel: 5,
        nx: this.upx[num],
        ny: this.upy[num]
    };
};

// Apply the upgrade number (nx,ny).
g_sprites.applyUpgrade = function (nx, ny) {
    if (nx === 0) {
        // Here are all the "good" upgrades.
        
        if (ny === 0) {
            g_ball.xVel *= 0.5;
            g_ball.yVel *= 0.5;
        } else if (ny === 1) {
            g_paddle1.halfWidth *= 1.5;
            
            // We move the paddle if it is in the way.
            g_paddle1.cx = min(max(g_paddle1.cx,
                           g_walls.leftinneredge + g_paddle1.halfWidth),
                           g_walls.rightinneredge - g_paddle1.halfWidth);
        } else if (ny === 2) {
            g_paddle1.alwaysSticky = true;
        } else if (ny === 3) {
            g_ball.meteor = true;
        } else if (ny === 4) {
            g_paddle1.shootLasers = true;
        } else if (ny === 5) {
            g_ball.radius *= 2;
        }
    } else {
        // Here are all the "bad" downgrades.
  
        if (ny === 0) {
            g_ball.xVel *= 2;
            g_ball.yVel *= 2;
        } else if (ny === 1) {
            g_paddle1.halfWidth *= (2/3);
        } else if (ny === 2) {
            g_paddle1.alwaysSticky = false;
            g_paddle1.shootLasers = false;
        } else if (ny === 3) {
            g_ball.meteor = false;
        } else if (ny === 5) {
            g_ball.radius *= 0.5;
        }
    }
};

g_sprites.addImage = function (x, y, picture) {
    this.upi[x][y] = picture;
};

g_sprites.init = function () {
    this.upi[0] = [];
    this.upi[1] = [];
};

// This function preloads our sprites.
function preload(num) {
    if (num === 0) {
        g_sprites.init();
    }
    
    var preImage = new Image();
    
    preImage.onload = function () {
        g_sprites.addImage(g_sprites.upx[num], g_sprites.upy[num], this);
    
        if (num + 1 < g_sprites.upx.length) {
            preload(num + 1);
        } else {
            g_sprites.upw = this.width / 2;
            g_sprites.uph = this.height / 2;
        
            // Start the game.
            g_walls.init();
            g_main.init();
        }
    };
    
    preImage.src = "up" + g_sprites.upx[num] + g_sprites.upy[num] + ".png";
}