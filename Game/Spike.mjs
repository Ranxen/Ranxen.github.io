import * as drawLib from '../Helper/drawLib.mjs';
import * as physicsLib from '../Helper/physicsLib.mjs';
import { Entity } from './Entity.mjs';
import { Player } from './Player.mjs';


export class Spike extends Entity {

    constructor(ctx, pos, size, rotation, color, restartLevel) {
        super(ctx, pos, size, color);
        if (rotation) {
            this.rotation = (rotation * Math.PI) / 180;
        }
        else {
            this.rotation = 0;
        }
        this.restartLevel = restartLevel;
        this.edges = this.getEdges();
    }


    draw() {
        this.ctx.save();
        this.ctx.translate(this.pos.x, this.pos.y);
        this.ctx.rotate(this.rotation);
        drawLib.triangle(this.ctx, 0, 0, this.size.width, this.size.height, this.color);

        this.ctx.restore();
    }

    detectCollision(args) {
        if (args.other instanceof Player) {
            let player = args.other;
            if (player.color !== this.color) {
                if (physicsLib.trianglePlayerCollision(this, player)) {
                    this.restartLevel();
                }
            }
        }
    }

    detectClick(x, y) {
        if (physicsLib.pointInsideTriangle({ x: x, y: y }, this.getEdges())) {
            return this;
        }
    }

    getEdges() {
        let edges = [];
        edges.push({ x: this.size.width / 2, y: 0 });
        edges.push({ x: 0, y: this.size.height });
        edges.push({ x: this.size.width, y: this.size.height });

        for (let edge of edges) {
            let x = edge.x;
            let y = edge.y;
            edge.x = x * Math.cos(this.rotation) - y * Math.sin(this.rotation) + this.pos.x;
            edge.y = x * Math.sin(this.rotation) + y * Math.cos(this.rotation) + this.pos.y;
        }

        return edges;
    }

    rotate(degree) {
        this.rotation += (degree * Math.PI) / 180;
        this.rotation = this.rotation % (2 * Math.PI);
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
        }, {
            name: 'Rotation',
            type: 'number',
            value: this.rotation * 180 / Math.PI,
            callback: (value) => {
                this.rotation = (value * Math.PI) / 180;
            }
        }]
    }

}