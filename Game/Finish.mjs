import * as drawLib from '../Helper/drawLib.mjs';
import { Entity } from './Entity.mjs';


export class Finish extends Entity {

    constructor(ctx, pos, size) {
        super(ctx, pos, size, 'brown');
        this.finished = false;
    }

    draw() {
        this.ctx.save();

        this.ctx.translate(this.pos.x, this.pos.y);
        drawLib.rect(this.ctx, 0, 0, this.size.width, this.size.height, 'brown');
        drawLib.rect(this.ctx, 10, this.size.height / 2, 10, 5, 'black');

        this.ctx.restore();
    }

    detectCollision(args) {
        let player = args.other;
        if (player.hasKey && !this.finished && super.detectCollision({ other: player}).length > 0) {
            this.onFinish();
            this.finished = true;
            return [this];
        }

        return [];
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