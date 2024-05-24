import * as drawLib from '../Helper/drawLib.mjs';
import { ColorOrb } from './ColorOrb.mjs';

export class TimedColorOrb extends ColorOrb {

    constructor(ctx, pos, size, color, timeout) {
        super(ctx, pos, size, color);
        this.timeout = timeout;
    }

    drawEntity() {
        super.drawEntity();
        drawLib.circle(this.ctx, 0, 0, this.size.width * 0.8, 'transparent', '#000', 2);
    }

    hitDetected(player, colorWheel) {
        player.addColor(this.color);
        player.color = this.color;
        player.colorTimeout = this.timeout;
        player.colorTimeoutMax = this.timeout;
        colorWheel.setColor(player.color);
        this.delete = true;
    }

    getEditableAttributes() {
        let attributes = super.getEditableAttributes();

        attributes.push({
            name: 'Timeout',
            type: 'number',
            value: this.timeout / 60,
            callback: (value) => {
                this.timeout = value * 60;
            }
        });

        return attributes;
    }

    toJSON() {
        return {
            constructor: "TimedColorOrb",
            pos: this.pos,
            size: this.size,
            color: this.color,
            timeout: this.timeout
        }
    }

}