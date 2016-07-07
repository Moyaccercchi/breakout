// =============
// MESSAGE STUFF
// =============

var g_messages = {
    text       : [],
    color      : [],
    colalpha   : [],
    colwoalpha : [],
    alphadir   : [], // true if alpha is increasing, otherwise false
    font       : [],
    fontsize   : [],
    visible    : true
};

g_messages.update = function (du) {
    // You shall not update an invisible message!
    if (!this.visible) return;

    if (this.text.length > 0) {
        var emptystrs = 0;
        
        for (var i=0; i < this.text.length; i++) {
    
            if (this.alphadir[i] && this.colalpha[i] < 1) {
                // We want to update the color of the score.        
                this.colalpha[i] += du / 300;
                
                if (this.colalpha[i] > 1) {
                    this.colalpha[i] = 1;
                }
        
                this.color[i] = this.colwoalpha[i] + this.colalpha[i] + ")";
            } else if ((!this.alphadir[i]) && this.colalpha[i] > 0) {
                // We want to update the color of the score.        
                this.colalpha[i] -= du / 300;
                
                if (this.colalpha[i] <= 0) {
                    this.colalpha[i] = 0;
                    this.text[i] = "";
                }
        
                this.color[i] = this.colwoalpha[i] + this.colalpha[i] + ")";
            } else if ((!this.alphadir[i]) && this.colalpha[i] === 0) {
                emptystrs++;
            }

        }
        
        // Once all the strings are empty, we can completely
        // clear the message queue.
        if (emptystrs === this.text.length) {
            this.text.length = 0;
            this.color.length = 0;
            this.colalpha.length = 0;
            this.colwoalpha.length = 0;
            this.alphadir.length = 0;
            this.font.length = 0;
            this.fontsize.length = 0;
        }
    }
};

g_messages.render = function (ctx) {
    // You shall not render an invisible score!
    if (!this.visible) return;

    if (this.text.length > 0) {
        var sofarsize = 0;
        
        for (var i=0; i < this.text.length; i++) {
            ctx.font = this.font[i];
            ctx.fillStyle = this.color[i];
            var textwidth = ctx.measureText(this.text[i]).width;
            if (g_runmode < 5) {
                ctx.fillText(this.text[i], (g_canvas_right + g_canvas_left
                             - textwidth) / 2, g_canvas_bottom - (70 + sofarsize));
            } else {
                ctx.fillText(this.text[i], (g_real_width - textwidth) / 2,
                             g_real_height - (70 + sofarsize));
            }
                         
            sofarsize += this.fontsize[i] + 4;
        }
    }
};

g_messages.display = function (disptext) {
    len = this.text.length;
    
    this.text[len] = disptext;
    this.colalpha[len] = 0;
    if (g_runmode < 5) {
        this.colwoalpha[len] = "rgba(0,0,0,";
    } else {
        this.colwoalpha[len] = "rgba(255,255,255,";
    }
    this.color[len] = this.colwoalpha[len] + this.colalpha[len] + ")";
    this.alphadir[len] = true;
    this.font[len] = this.calculateFont(len);

    this.texts += 1;
}

g_messages.calculateFont = function (lengthofarray) {
    len = this.text.length - 1;
    
    if (this.text.length > -1) {
        var comp = true;
        var ourwidth;
        
        if (g_runmode < 5) {
            ourwidth = (g_canvas_right - g_canvas_left) * 0.9;
        } else {
            ourwidth = g_real_width * 0.9;
        }
        
        for (var textsize = 50; comp; textsize -= 5) {
            g_ctx.font = "bold " + textsize + "px Arial";
            if (g_ctx.measureText(this.text[len]).width < ourwidth) {
                comp = false;
            };
        }
        
        g_messages.fontsize[lengthofarray] = textsize;
        return g_ctx.font;
    }
}

// Unshows the oldest still visible message from the queue.
function messageUnShow () {
    for (var i=0; i < g_messages.alphadir.length; i++) {
        if (g_messages.alphadir[i]) {
            g_messages.alphadir[i] = false;
            return;
        }
    }
}

function messageLaunch () {
    if (!g_launched) {
        g_messages.display("PRESS [SPACE] TO LAUNCH");
        setTimeout(messageUnShow,5000);
    }
}

var g_ADpressed = false;

function messageMoveAD () {
    if (!g_ADpressed) {
        g_messages.display("PRESS [A] OR [D] TO MOVE");
        setTimeout(messageUnShow,5000);
    }
}
