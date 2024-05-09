import * as drawLib from '../Helper/drawLib.mjs';
import * as physicsLib from '../Helper/physicsLib.mjs';


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


    detectClick(x, y) {
        return physicsLib.pointInsideRect({ x: x, y: y }, this);
    }


    rotate(degree) {

    }


    getEditableAttributes() {
        return [{
            name: 'Position',
            type: 'vector',
            value: this.pos,
            callback: (attribute, value) => {
                if (attribute === 'x') {
                    this.pos.x = value;
                }
                else if (attribute === 'y') {
                    this.pos.y = value;
                }
            }
        }, {
            name: 'Size',
            type: 'vector',
            value: { x: this.size.width, y: this.size.height },
            callback: (attribute, value) => {
                if (attribute === 'x') {
                    this.size.width = value;
                }
                else if (attribute === 'y') {
                    this.size.height = value;
                }
            }
        }]
    }

}