import { Entity } from './Entity.mjs';


export class Obstacle extends Entity {

    constructor(ctx, pos, size, color) {
        super(ctx, pos, size, color);
    }

    rotate(degree) {
        let temp = this.size.width;
        this.size.width = this.size.height;
        this.size.height = temp;
    }

}