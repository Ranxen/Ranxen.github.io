import * as drawLib from '../Helper/drawLib.mjs';
import * as physicsLib from '../Helper/physicsLib.mjs';


export class Entity {

    constructor(ctx, pos, size, color) {
        this.ctx = ctx;
        this.relativePos = { x: 0, y: 0 };
        this.pos = pos;
        this.size = size;
        this.color = color;
        this.edges = this.getEdges();
        this.children = [];
        this.parent = null;
    }

    draw() {
        this.ctx.save();

        this.ctx.translate(this.pos.x, this.pos.y);
        this.drawEntity();
        
        this.ctx.restore();
        this.drawChildren();
    }

    drawEntity() {
        drawLib.rect(this.ctx, 0, 0, this.size.width, this.size.height, this.color);
    }

    update() {
        this.children.forEach(child => {
            child.pos = { x: this.pos.x + child.relativePos.x, y: this.pos.y + child.relativePos.y };
            child.update();
        });
    }

    drawChildren() {
        this.children.forEach(child => {
            child.draw()
        });
    }

    addChild(child) {
        child.relativePos = { x: child.pos.x - this.pos.x, y: child.pos.y - this.pos.y };
        child.parent = this;
        this.children.push(child);
    }

    removeChild(child) {
        this.children = this.children.filter(c => c !== child);
    }

    detectClick(x, y) {
        if (physicsLib.pointInsideRect({ x: x, y: y }, this)) {
            return this;
        }

        for (let child of this.children) {
            let clicked = child.detectClick(x, y);
            if (clicked) {
                return clicked;
            }
        }

        return null;
    }

    detectCollision(args) {
        let collisions = [];
        this.children.forEach(child => {
            collisions.push(...child.detectCollision(args));
        });

        if (args.collisionMask?.includes(this.constructor) && physicsLib.AABBCollisionPredicted(args.other, this)) {
            collisions.push(this);
        }
        else if (args.collisionMask === undefined && physicsLib.AABBCollision(this, args.other)) {
            collisions.push(this);
        }

        return collisions;
    }

    getEdges() {
        return [{ x: this.pos.x, y: this.pos.y }, { x: this.pos.x + this.size.width, y: this.pos.y }, { x: this.pos.x, y: this.pos.y + this.size.height }, { x: this.pos.x + this.size.width, y: this.pos.y + this.size.height }];
    }

    rotate(degree) {

    }

    setPosition(x, y) {
        this.pos = { x: x, y: y };

        if (this.parent) {
            this.relativePos = { x: this.pos.x - this.parent.pos.x, y: this.pos.y - this.parent.pos.y };
        }

        this.updateChildPositions();
    }

    updateChildPositions() {
        this.children.forEach(child => {
            child.pos = { x: this.pos.x + child.relativePos.x, y: this.pos.y + child.relativePos.y };
            child.updateChildPositions();
        });
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

                this.updateChildPositions();
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
        }]
    }

}