// =============
// OUR PLAYFIELD
// =============

var g_field = {
    rotation   : 0,
    colalpha   : 0,
    oppwoalpha : "rgba(255,255,255,",
    colwoalpha : "rgba(0,0,0,",
    color      : "rgba(0,0,0,0)",
    // Will be true once twilight has passed, that is the moment
    // at which alpha = 50%, during runmode 5.
    twilight   : false
};

g_field.render = function (ctx) {
    if (g_runmode < 5) {
        clearCanvas(ctx);
    } else {
        if (this.colalpha < 1) {
            clearCanvas(ctx);
        }
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, g_real_width, g_real_height);
    }
}

g_field.update = function (du) {
    if (g_runmode === 1) {
        this.rotation -= (du / 300);
        
        if (this.rotation < - Math.PI / 2) {
            set_runmode(2);
        }
    }
    
    if (g_runmode === 5) {
        this.colalpha += du / 300;
        if (this.colalpha > 1) {
            this.colalpha = 1;
            set_runmode(6);
        }
        this.color = this.colwoalpha + this.colalpha + ")";
        
        if (this.colalpha < 0.5) {
            g_ball.color = this.colwoalpha + (1 - (2 * this.colalpha)) + ")";
        } else {
            if (!this.twilight) {
                this.twilight = true;
                
                g_score.gobyrealsize = true;
                g_walls.setToRealSize();
                g_bricks.conthorzmove = true;
                g_paddle1.style = 1;
            }
            
            g_ball.color = this.oppwoalpha + ((this.colalpha * 2) - 1) + ")";
        }

        g_score.color = g_ball.color;
        g_paddle1.color = g_ball.color;
        g_walls.color = g_ball.color;
        
        var bcwa = parseInt(this.colalpha * 255);
        g_bricks.setBlackColwoalpha("rgba(" + bcwa + "," + bcwa + "," + bcwa + ",");
    }
}
