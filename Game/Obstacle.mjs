import * as drawLib from '../Helper/drawLib.mjs';
import * as physicsLib from '../Helper/physicsLib.mjs';


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


    detectClick(x, y) {
        return physicsLib.pointInsideRect({ x: x, y: y }, this);
    }


    rotate(degree) {
        let temp = this.size.width;
        this.size.width = this.size.height;
        this.size.height = temp;
    }


    getEditableAttributes() {
        return [{
            name: 'Color',
            type: 'color',
            value: this.color,
            callback: (value) => {
                this.color = value;
            }
        }, {
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
            value: { x: this.size.width, y: this.size.height},
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