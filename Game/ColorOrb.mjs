import * as drawLib from '../Helper/drawLib.mjs';
import * as physicsLib from '../Helper/physicsLib.mjs';
import { Entity } from './Entity.mjs';
import { Player } from './Player.mjs';


export class ColorOrb extends Entity {

    constructor(ctx, pos, size, color) {
        if (typeof size === 'number') {
            size = { width: size, height: size };
        }
        super(ctx, pos, size, color);
        this.edges = this.getEdges();
    }

    drawEntity() {
        drawLib.circle(this.ctx, 0, 0, this.size.width, this.color);
    }

    detectCollision(args) {
        if (args.other instanceof Player) {
            let player = args.other;
            let colorWheel = args.colorWheel;
            let edgesOfPlayer = player.getEdges();
    
            for (let edge of edgesOfPlayer) {
                if (physicsLib.pointInsideCircle(edge, this)) {
                    this.hitDetected(player, colorWheel);
                    return [this];
                }
            }
    
            for (let edge of this.getEdges()) {
                if (physicsLib.pointInsideRect(edge, player)) {
                    this.hitDetected(player, colorWheel);
                    return [this];
                }
            }
        }

        return [];
    }

    detectClick(x, y) {
        if (physicsLib.pointInsideCircle({ x: x, y: y}, this)) {
            return this;
        }
    }

    hitDetected(player, colorWheel) {
        player.addColor(this.color);
        player.color = this.color;
        colorWheel.setColor(player.color);
        this.delete = true;
    }

    getEdges() {
        return [{ x: this.pos.x, y: this.pos.y - this.size.height }, { x: this.pos.x + this.size.width, y: this.pos.y }, { x: this.pos.x, y: this.pos.y + this.size.height }, { x: this.pos.x - this.size.width, y: this.pos.y }];
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

                this.children.forEach(child => {
                    child.pos = { x: this.pos.x + child.relativePos.x, y: this.pos.y + child.relativePos.y };
                });
            }
        }, {
            name: 'Size',
            type: 'number',
            value: this.size.width,
            callback: (value) => {
                this.size = { width: value, height: value };
            }
        }]
    }

    toJSON() {
        return {
            constructor: "ColorOrb",
            pos: this.pos,
            size: this.size,
            color: this.color
        }
    }

}