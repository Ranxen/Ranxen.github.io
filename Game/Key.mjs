import * as drawLib from '../Helper/drawLib.mjs';
import { Entity } from './Entity.mjs';


export class Key extends Entity {

    constructor(ctx, pos) {
        super(ctx, pos, { width: 20, height: 30 }, 'gold');
        this.player = null;
    }

    draw() {
        this.ctx.save();

        if (!this.player.hasKey) {
            this.ctx.translate(this.pos.x, this.pos.y);
        }
        else {
            this.ctx.translate(this.player.pos.x - 10, this.player.pos.y - 40);
        }

        drawLib.rect(this.ctx, this.size.width / 3, 0, this.size.width / 4, this.size.height, this.color, "transparent", 0);
        drawLib.rect(this.ctx, this.size.width / 6, this.size.height / 2, this.size.width / 4, this.size.height / 5, this.color, "transparent", 0);
        drawLib.rect(this.ctx, this.size.width / 6, this.size.height / 1.25, this.size.width / 4, this.size.height / 5, this.color, "transparent", 0);
        drawLib.circle(this.ctx, this.size.width / 2, 0, this.size.width / 2, this.color, "transparent", 0);


        this.ctx.restore();
    }

    detectCollision(args) {
        let player = args.other;
        if (super.detectCollision({ other: player })) {
            player.hasKey = true;
        }
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
        }]
    }

}