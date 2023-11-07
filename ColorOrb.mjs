import * as drawLib from './drawLib.mjs';


export class ColorOrb {


    constructor(ctx, pos, size, color) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = size;
        this.color = color;
    }


    draw() {
        this.ctx.save();

        this.ctx.translate(this.pos.x, this.pos.y);

        drawLib.circle(this.ctx, 0, 0, this.size, this.color);

        this.ctx.restore();
    }


    detectCollision(player, colorWheel) {

        if (player.pos.x < this.pos.x && player.pos.x + player.size > this.pos.x && player.pos.y < this.pos.y && player.pos.y + player.size > this.pos.y) {
            this.hitDetected(player, colorWheel);
            return;
        }

        let edgesOfPlayer = player.getEdges();

        for (let edge of edgesOfPlayer) {
            let distance = Math.sqrt(Math.pow(edge.x - this.pos.x, 2) + Math.pow(edge.y - this.pos.y, 2));
            if (distance < this.size) {
                this.hitDetected(player, colorWheel);
                break;
            }
        }
    }

    
    hitDetected(player, colorWheel) {
        player.addColor(this.color);
        player.color = this.color;
        colorWheel.setColor(player.color);
        this.delete = true;
    }


}