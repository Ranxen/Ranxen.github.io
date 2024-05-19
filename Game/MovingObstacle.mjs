import { MovingEntity } from './MovingEntity.mjs';


export class MovingObstacle extends MovingEntity {

    constructor(ctx, pos, size, color, targetPos, speed, movePlayer = true) {
        super(ctx, pos, size, color);
        this.startPos = { x: pos.x, y: pos.y };
        this.targetPos = targetPos;
        this.speed = speed;
        this.movePlayer = movePlayer;
    }

    update() {
        let distance = Math.sqrt(Math.pow(this.targetPos.x - this.pos.x, 2) + Math.pow(this.targetPos.y - this.pos.y, 2));
        if (distance < this.speed) {
            this.pos = this.targetPos;
            this.targetPos = this.startPos;
            this.startPos = { x: this.pos.x, y: this.pos.y };
            this.velocity = { x: 0, y: 0 };
        }
        else {
            let angle = Math.atan2(this.targetPos.y - this.pos.y, this.targetPos.x - this.pos.x);
            this.velocity = { x: Math.cos(angle) * this.speed, y: Math.sin(angle) * this.speed };
            this.pos.x += this.velocity.x;
            this.pos.y += this.velocity.y;
        }

        this.updateChildren();
    }

    rotate(degree) {
        let temp = this.size.width;
        this.size.width = this.size.height;
        this.size.height = temp;
    }

    getEditableAttributes() {
        let attributes = super.getEditableAttributes();
        attributes.push({
            name: 'Target Position',
            type: 'vector',
            value: this.targetPos,
            callback: (attribute, value) => {
                if (attribute === 'x') {
                    this.targetPos.x = value;
                }
                else if (attribute === 'y') {
                    this.targetPos.y = value;
                }
            }
        });
        attributes.push({
            name: 'Speed',
            type: 'number',
            value: this.speed,
            callback: (value) => {
                this.speed = value;
            }
        });
        attributes.push({
            name: 'Move Player',
            type: 'checkbox',
            value: this.movePlayer,
            callback: (value) => {
                this.movePlayer = value;
            }
        });
        return attributes;
    }

}