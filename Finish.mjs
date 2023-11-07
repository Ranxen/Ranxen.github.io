import * as drawLib from './drawLib.mjs';


export class Finish {


    constructor(ctx, pos, size) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = size;
        this.finished = false;
    }


    draw() {
        this.ctx.save();

        this.ctx.translate(this.pos.x, this.pos.y);
        drawLib.rect(this.ctx, 0, 0, this.size.width, this.size.height, 'brown');
        drawLib.rect(this.ctx, 10, this.size.height / 2, 10, 5, 'black');

        this.ctx.restore();
    }


    detectCollision(player) {
        if (player.hasKey && !this.finished && player.pos.x + player.size > this.pos.x && player.pos.x < this.pos.x + this.size.width && player.pos.y + player.size > this.pos.y && player.pos.y < this.pos.y + this.size.height) {
            this.onFinish();
            this.finished = true;
        }
    }

}