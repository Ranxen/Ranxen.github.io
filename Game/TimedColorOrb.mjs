import { ColorOrb } from './ColorOrb.mjs';

export class TimedColorOrb extends ColorOrb {

    constructor(ctx, pos, size, color, timeout) {
        super(ctx, pos, size, color);
        this.timeout = timeout;
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
            value: this.timeout,
            callback: (value) => {
                this.timeout = value;
            }
        });

        return attributes;
    }

}