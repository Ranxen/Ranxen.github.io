import * as drawLib from '../Helper/drawLib.mjs';
import * as physicsLib from '../Helper/physicsLib.mjs';


export class ColorOrb {


    constructor(ctx, pos, size, color) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = size;
        this.color = color;
    }


    draw() {
        this.ctx.save();

        this.ctx.translate(this.pos.x, this.pos.y);

        drawLib.circle(this.ctx, 0, 0, this.size, this.color);

        this.ctx.restore();
    }


    detectCollision(player, colorWheel) {
        if (player.pos.x < this.pos.x && player.pos.x + player.size > this.pos.x && player.pos.y < this.pos.y && player.pos.y + player.size > this.pos.y) {
            this.hitDetected(player, colorWheel);
            return;
        }

        let edgesOfPlayer = player.getEdges();

        for (let edge of edgesOfPlayer) {
            let distance = Math.sqrt(Math.pow(edge.x - this.pos.x, 2) + Math.pow(edge.y - this.pos.y, 2));
            if (distance < this.size) {
                this.hitDetected(player, colorWheel);
                break;
            }
        }
    }


    detectClick(x, y) {
        return physicsLib.pointInsideCircle({ x: x, y: y}, this);
    }

    
    hitDetected(player, colorWheel) {
        player.addColor(this.color);
        player.color = this.color;
        colorWheel.setColor(player.color);
        this.delete = true;
    }


    rotate(degree) {
        
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
            type: 'number',
            value: this.size,
            callback: (value) => {
                this.size = value;
            }
        }]
    }


}