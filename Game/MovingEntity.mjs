import { Entity } from './Entity.mjs';


export class MovingEntity extends Entity {

    constructor(ctx, pos, size, color) {
        super(ctx, pos, size, color);
        this.velocity = { x: 0, y: 0 };
        this.collisions = [];
    }

    update() {
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
        this.updateChildren();
    }

    updateChildren() {
        this.children.forEach(child => {
            child.pos = { x: this.pos.x + child.relativePos.x, y: this.pos.y + child.relativePos.y };
            if (child instanceof MovingEntity) {
                child.update()
            }
        });
    }

    clearCollisions() {
        this.collisions = [];
    }

}