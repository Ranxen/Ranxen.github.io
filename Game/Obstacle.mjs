import * as drawLib from '../Helper/drawLib.mjs';


export class Obstacle {


    constructor(ctx, pos, size, color) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = size;
        this.color = color;
    }



    draw() {
        this.ctx.save();
        this.ctx.translate(this.pos.x, this.pos.y);
        drawLib.rect(this.ctx, 0, 0, this.size.width, this.size.height, this.color);

        this.ctx.restore();
    }

}