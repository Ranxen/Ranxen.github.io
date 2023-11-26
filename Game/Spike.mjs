import * as drawLib from '../Helper/drawLib.mjs';
import * as physicsLib from '../Helper/physicsLib.mjs';


export class Spike {


    constructor(ctx, pos, size, rotation, color, restartLevel) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = size;
        if (rotation) {
            this.rotation = (rotation * Math.PI) / 180;
        }
        else {
            this.rotation = 0;
        }
        this.color = color;
        this.restartLevel = restartLevel;
    }



    draw() {
        this.ctx.save();
        this.ctx.translate(this.pos.x, this.pos.y);
        this.ctx.rotate(this.rotation);
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


    detectClick(x, y) {
        return physicsLib.pointInsideTriangle({ x: x, y: y }, this.getEdges());
    }


    getEdges() {
        let edges = [];
        edges.push({ x: this.size.width / 2, y: 0 });
        edges.push({ x: 0, y: this.size.height });
        edges.push({ x: this.size.width, y: this.size.height });

        for (let edge of edges) {
            let x = edge.x;
            let y = edge.y;
            edge.x = x * Math.cos(this.rotation) - y * Math.sin(this.rotation) + this.pos.x;
            edge.y = x * Math.sin(this.rotation) + y * Math.cos(this.rotation) + this.pos.y;
        }

        return edges;
    }


    rotate(degree) {
        this.rotation += (degree * Math.PI) / 180;
    }

}