import * as drawLib from '../Helper/drawLib.mjs';
import * as physicsLib from '../Helper/physicsLib.mjs';
import { Entity } from './Entity.mjs';


export class ColorOrb extends Entity {

    constructor(ctx, pos, size, color) {
        super(ctx, pos, { width: size, height: size}, color);
        this.edges = this.getEdges();
    }

    draw() {
        this.ctx.save();

        this.ctx.translate(this.pos.x, this.pos.y);

        drawLib.circle(this.ctx, 0, 0, this.size.width, this.color);

        this.ctx.restore();
    }

    detectCollision(args) {
        let player = args.other;
        let colorWheel = args.colorWheel;
        let edgesOfPlayer = player.getEdges();

        for (let edge of edgesOfPlayer) {
            if (physicsLib.pointInsideCircle(edge, this)) {
                this.hitDetected(player, colorWheel);
                break;
            }
        }

        for (let edge of this.getEdges()) {
            if (physicsLib.pointInsideRect(edge, player)) {
                this.hitDetected(player, colorWheel);
                break;
            }
        }
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
        if (this.edges) {
            return this.edges;
        }

        return [{ x: this.pos.x, y: this.pos.y - this.size.height }, { x: this.pos.x + this.size.width, y: this.pos.y }, { x: this.pos.x, y: this.pos.y + this.size.height }, { x: this.pos.x - this.size.width, y: this.pos.y }];
    }

}