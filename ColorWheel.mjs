import * as drawLib from './drawLib.mjs';


export class ColorWheel {


    constructor(ctx, pos, size, player) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = size;
        this.player = player;
        this.selectorPos = -90;
        this.isDragging = false;
        this.touchIdentifier = null;
    }


    draw() {
        this.ctx.translate(this.pos.x, this.pos.y);
        drawLib.circle(this.ctx, 0, 0, this.size, 'grey');

        let degrees = 180;
        for (let color of this.player.colors) {
            drawLib.arc(this.ctx, 0, 0, this.size, degrees * Math.PI / 180, (degrees + 180 / this.player.colors.length) * Math.PI / 180, color);
            degrees += 180 / this.player.colors.length;
        }

        this.drawSelector();

        this.ctx.resetTransform();
    }


    drawSelector() {
        let selectorSize = 90 / this.player.colors.length;

        drawLib.arc(this.ctx, 0, 0, this.size, (this.selectorPos + selectorSize) * Math.PI / 180, (this.selectorPos - selectorSize) * Math.PI / 180, 'rgba(0, 0, 0, 0.5)');
        drawLib.arc(this.ctx, 0, 0, this.size, (this.selectorPos - selectorSize) * Math.PI / 180, (this.selectorPos + selectorSize) * Math.PI / 180, 'transparent', 'black', 8);
        drawLib.circle(this.ctx, Math.cos(this.selectorPos * Math.PI / 180) * (this.size - 25), Math.sin(this.selectorPos * Math.PI / 180) * (this.size - 25), 8, this.isDragging ? 'white' : 'black');
        
    }


    isMoved(x, y, touchIdentifier) {
        if ((this.isDragging && touchIdentifier == null) || (this.isDragging && touchIdentifier != null && this.touchIdentifier == touchIdentifier) || Math.sqrt((x - this.pos.x) ** 2 + (y - this.pos.y) ** 2) < this.size) {
            this.isDragging = true;
            if (touchIdentifier != null) {
                this.touchIdentifier = touchIdentifier;
            }
            this.selectorPos = Math.atan2(y - this.pos.y, x - this.pos.x) * 180 / Math.PI;

            if (this.selectorPos > 90) {
                this.selectorPos = -180;
            } else if (this.selectorPos > 0) {
                this.selectorPos = -0.1;
            }

            this.player.color = this.player.colors[Math.floor((this.selectorPos + 180) / (180 / this.player.colors.length))];
        }
    }


    setColor(color) {
        let degrees = 180;
        for (const element of this.player.colors) {
            if (element === color) {
                this.selectorPos = degrees + 90 / this.player.colors.length;
                break;
            }
            degrees += 180 / this.player.colors.length;
        }
    }


    nextColor() {
        this.player.color = this.player.colors[(this.player.colors.indexOf(this.player.color) + 1) % this.player.colors.length];

        this.setColor(this.player.color);
    }


    previousColor() {
        this.player.color = this.player.colors[(this.player.colors.indexOf(this.player.color) - 1 + this.player.colors.length) % this.player.colors.length];

        this.setColor(this.player.color);
    }


}