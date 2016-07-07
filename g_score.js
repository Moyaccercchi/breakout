// ===========
// SCORE STUFF
// ===========

var g_score = {
    p1: 0, // score for player 1 in the beginning
    p2: 0, // score for player 2 in the beginning
    br: 0, // score for breakout
    bl: 5, // lifes for breakout
    blvl: 0, // level for breakout
    color        : "#000000",
    colalpha     : 1,
    colwoalpha   : "rgba(0,0,0,",
    drawturned   : false,
    visible      : true,
    // true once we switch to the real size of the canvas
    gobyrealsize : false
};

g_score.update = function (du) {
    // You shall not update an invisible score!
    if (!this.visible) return;
    
    if (g_runmode === 2) {
        // We want to update the color of the score.        
        this.colalpha -= du / 300;
        if (this.colalpha < 0) {
            set_runmode(3);
            this.colalpha = 0;
        }
        this.color = this.colwoalpha + this.colalpha + ")";

        // We also want the paddle to change its color,
        // and rather than calculating everything again,
        // we just do this now.
        g_paddle2.color = this.color;
    }
    
    if (this.bl < 0 && !g_gameover) {
        g_messages.display("GAME OVER");
        g_gameover = true;
    }
};

g_score.render = function (ctx) {
    // You shall not render an invisible score!
    if (!this.visible) return;

    // We draw the pong score
    if (g_runmode < 3) {
        ctx.save();
    
        if (this.drawturned) {
            ctx.translate(((g_canvas_right - g_canvas_left) / 2) + g_canvas_left,
                          ((g_canvas_bottom - g_canvas_top) / 2) + g_canvas_top);
            ctx.rotate(- Math.PI / 2);
            ctx.translate(- ((g_canvas_right - g_canvas_left) / 2) - g_canvas_left,
                          - ((g_canvas_bottom - g_canvas_top) / 2) - g_canvas_top);
        }
    
        ctx.font = "bold 40px Arial";
        var curscore = this.p1 + ":" + this.p2;
        var textwidthL = ctx.measureText("" + this.p1).width;
        var textwidthM = ctx.measureText(":").width;
        ctx.fillStyle = this.color;
        ctx.fillText(curscore, ((g_canvas_right - (g_canvas_left + textwidthM)) / 2)
                               + g_canvas_left - textwidthL, 47);
    
        ctx.restore();
    } else {
        ctx.font = "bold 40px Arial";
        var curscore = "Score: " + this.br;
        ctx.fillStyle = this.color;
        ctx.fillText(curscore, g_canvas_left + 3, 42);

        // We take the maximum as we don't want to display a negative
        // score, even not for the game-over-frame, as that would just
        // look stupid.
        var curscore = "Lives: " + max(0, this.bl);
        var textwidth = ctx.measureText(curscore).width;
        if (this.gobyrealsize) {
            ctx.fillText(curscore, g_real_width - ((g_canvas_left * 2)
                         + textwidth + 3), 42);

            curscore = "Level: " + this.blvl;
            var textwidth = ctx.measureText(curscore).width;
            ctx.fillText(curscore, (g_real_width - textwidth) / 2, 42);
        } else {
            ctx.fillText(curscore, g_canvas_right - (textwidth + 3), 42);
        }
    }
};

g_score.turn = function () {
    this.drawturned = true;
}

g_score.oneMoreBrick = function (posX, posY) {
    this.br += 1;
    
    if ((g_runmode < 5) && (this.br > 13) && (this.br % 8 === 0)) {
        var varc = "rgba(";
        var rownum = parseInt(this.br / 8) % 6;
        
        if (rownum === 5) {
            varc += "255,129,30";
        } else if (rownum === 4) {
            varc += "255,145,29";
        } else if (rownum === 3) {
            varc += "11,175,29";
        } else if (rownum === 2) {
            varc += "107,100,255";
        } else if (rownum === 1) {
            varc += "205,62,207";
        } else {
            varc += "250,82,85";
        }
        
        varc += ",";
        
        g_bricks.addRowFromTop(varc);
    }

  if ((g_runmode > 5) && (Math.random() < 0.5)) {
      g_sprites.addUpgrade(posX, posY);
  }
}
