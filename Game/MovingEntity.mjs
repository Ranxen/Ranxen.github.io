import { Entity } from './Entity.mjs';


export class MovingEntity extends Entity {

    constructor(ctx, pos, size, color) {
        super(ctx, pos, size, color);
        this.velocity = { x: 0, y: 0 };
        this.collisions = [];
    }

    clearCollisions() {
        this.collisions = [];
    }

}