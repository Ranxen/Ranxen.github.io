import * as drawLib from '../../Helper/drawLib.mjs';


export class Button {


    constructor(ctx, pos, size, color, text, onClick) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = size;
        this.color = color;
        this.text = text;
        this.onClick = onClick;
    }


    draw() {
        this.ctx.translate(this.pos.x, this.pos.y);
        drawLib.rect(this.ctx, 0, 0, this.size.width, this.size.height, this.color);
        if (this.text.length > 0) {
            drawLib.text(this.ctx, this.size.width / 2, this.size.height / 2, this.text, 'black');
        }

        this.ctx.resetTransform();
    }


    isClicked(x, y) {
        if (x > this.pos.x && x < this.pos.x + this.size.width && y > this.pos.y && y < this.pos.y + this.size.height) {
            this.onClick();

            return true;
        }

        return false;
    }


}