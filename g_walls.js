// ==========
// WALL STUFF
// ==========

var g_walls = {
    leftouteredge   : 0,
    leftinneredge   : 0,
    rightinneredge  : 0,
    rightouteredge  : 0,
    topouteredge    : 0,
    topinneredge    : 0,
    bottomouteredge : 0,
    width   : 15,
    color   : "#000000",
    colalpha   : 0,
    colwoalpha : "rgba(0,0,0,",
    visible : false
};

g_walls.update = function (du) {
    // You shall not update invisible walls!
    if (!this.visible) return;
    
    if (g_runmode === 3) {
        // We want to update the color of the score.
        this.colalpha += du / 300;
        if (this.colalpha > 1) {
            this.colalpha = 1;
            set_runmode(4);
        }
        this.color = this.colwoalpha + this.colalpha + ")";

        // We also want to fade in the bricks,
        // and instead of calculating this for each one
        // separately, we simply use the value that has
        // been calculated on all of them. =)
        g_bricks.setAllAlphas(this.colalpha);
        g_score.color = this.color;

        // If the paddle is in an invalid state,
        // then we slowly move it to a valid state.
        if (g_paddle1.cx + 5 < this.leftinneredge + g_paddle1.halfWidth) {
            g_paddle1.cx += max(1, du);
        }
        if (g_paddle1.cx > 5 + this.rightinneredge - g_paddle1.halfWidth) {
            g_paddle1.cx -= max(1, du);
        }
    }
    
    // Actually it is 380, but it looks nicer if we leave a few
    // extra pixels so that the bricks can move instead of oscillating
    // to and fro in each frame.
    if ((g_runmode === 6) &&
        (this.rightouteredge - this.leftouteredge > 385)) {
        var ourdu = du / 15;
        
        this.leftouteredge += ourdu;
        this.leftinneredge += ourdu;
        this.rightinneredge -= ourdu;
        this.rightouteredge -= ourdu;
        
        // We move the paddle if it is in the way.
        g_paddle1.cx = min(max(g_paddle1.cx,
                       this.leftinneredge + g_paddle1.halfWidth),
                       this.rightinneredge - g_paddle1.halfWidth);
    }
};

g_walls.render = function (ctx) {
    // You shall not render invisible walls.
    if (!this.visible) return;
    
    ctx.fillStyle = this.color;
    // left wall
    ctx.fillRect(this.leftouteredge, this.topinneredge,
                 this.width, this.bottomouteredge - this.topinneredge);
    // right wall
    ctx.fillRect(this.rightinneredge, this.topinneredge,
                 this.width, this.bottomouteredge - this.topinneredge);
    // top wall
    ctx.fillRect(this.leftouteredge, this.topouteredge,
                 this.rightouteredge - this.leftouteredge, this.width);
};

g_walls.init = function () {
    this.leftouteredge = g_canvas_left + 10;
    this.leftinneredge = this.leftouteredge + this.width;
    this.rightouteredge = g_canvas_right - 10;
    this.rightinneredge = this.rightouteredge - this.width;
    this.topouteredge = g_canvas_top + 38;
    this.topinneredge = this.topouteredge + this.width;
    this.bottomouteredge = g_canvas_bottom;
}

g_walls.setToRealSize = function () {
    this.rightouteredge = g_real_width - ((g_canvas_left * 2) + 10);
    this.rightinneredge = this.rightouteredge - this.width;
    this.bottomouteredge = g_real_height;
}