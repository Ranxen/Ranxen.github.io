import * as drawLib from './drawLib.mjs';
import * as physicsLib from './physicsLib.mjs';


export class Spike {


    constructor(ctx, pos, size, color, restartLevel) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = size;
        this.color = color;
        this.restartLevel = restartLevel;
    }



    draw() {
        this.ctx.save();
        this.ctx.translate(this.pos.x, this.pos.y);
        drawLib.triangle(this.ctx, 0, 0, this.size.width, this.size.height, this.color);

        this.ctx.restore();
    }


    detectCollision(player) {
        if (player.color !== this.color) {
            if (physicsLib.trianglePlayerCollision(this, player)) {
                this.restartLevel();
            }
        }
    }


    getEdges() {
        let edges = [];
        edges.push({ x: this.pos.x + this.size.width / 2, y: this.pos.y });
        edges.push({ x: this.pos.x, y: this.pos.y + this.size.height });
        edges.push({ x: this.pos.x + this.size.width, y: this.pos.y + this.size.height });

        return edges;
    }

}