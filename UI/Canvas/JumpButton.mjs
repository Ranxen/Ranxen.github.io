import * as drawLib from '../../Helper/drawLib.mjs';
import { Button } from './Button.mjs';

export class JumpButton extends Button {


    constructor(ctx, pos, size, color, onClick) {
        super(ctx, pos, size, color, "", onClick);
    }


    draw() {
        this.ctx.translate(this.pos.x, this.pos.y);
        drawLib.circle(this.ctx, 0, 0, this.size, this.color);

        this.ctx.resetTransform();
    }


    isClicked(x, y) {
        if (Math.sqrt((x - this.pos.x) ** 2 + (y - this.pos.y) ** 2) < this.size) {
            this.onClick();

            return true;
        }

        return false;
    }


}