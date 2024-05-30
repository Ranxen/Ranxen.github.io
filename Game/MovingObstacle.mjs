import { MovingEntity } from './MovingEntity.mjs';


export class MovingObstacle extends MovingEntity {

    constructor(ctx, pos, size, color, startAt, targetPos, speed, movePlayer = true) {
        super(ctx, pos, size, color);
        this.startPos = { x: pos.x, y: pos.y };
        this.targetPos = targetPos;
        this.speed = speed;
        this.movePlayer = movePlayer;
        this.startAt = startAt;
        if (this.startAt) {
            this.calculateStartPos();
        }
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

        if (this.parent) {
            this.relativePos = { x: this.pos.x - this.parent.pos.x, y: this.pos.y - this.parent.pos.y };
            if (this.parent instanceof MovingEntity) {
                this.velocity.x += this.parent.velocity.x;
                this.velocity.y += this.parent.velocity.y;
            }
        }

        super.update();
    }

    updatePos(x, y) {
        let diff = { x: x - this.pos.x, y: y - this.pos.y };
        this.pos.x = x;
        this.pos.y = y;
        this.startPos.x += diff.x;
        this.startPos.y += diff.y;
        this.targetPos.x += diff.x;
        this.targetPos.y += diff.y;
    }

    rotate(degree) {
        let temp = this.size.width;
        this.size.width = this.size.height;
        this.size.height = temp;
    }

    setPosition(x, y) {
        this.pos.x = x;
        this.pos.y = y;
        this.startPos.x = x;
        this.startPos.y = y;
        this.startAt = 0;
        this.calculateStartPos();
    }

    calculateStartPos() {
        this.pos.x = this.startPos.x + (this.targetPos.x - this.startPos.x) * this.startAt;
        this.pos.y = this.startPos.y + (this.targetPos.y - this.startPos.y) * this.startAt;

        if (this.parent) {
            this.relativePos = { x: this.pos.x - this.parent.pos.x, y: this.pos.y - this.parent.pos.y };
        }

        this.updateChildPositions();
    }

    getEditableAttributes() {
        let attributes = super.getEditableAttributes();
        attributes = attributes.filter(attribute => attribute.name !== 'Position');
        attributes.push({
            name: 'Start Position',
            type: 'vector',
            value: this.startPos,
            callback: (attribute, value) => {
                if (attribute === 'x') {
                    this.pos.x = value;
                    this.startPos.x = value;
                }
                else if (attribute === 'y') {
                    this.pos.y = value;
                    this.startPos.y = value;
                }
                this.calculateStartPos();
            }
        });
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

                this.calculateStartPos();
            }
        });
        attributes.push({
            name: 'Start At',
            type: 'slider',
            value: this.startAt,
            min: 0,
            max: 1,
            callback: (value) => {
                this.startAt = value;
                this.calculateStartPos();
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

    toJSON() {
        return {
            constructor: "MovingObstacle",
            pos: this.startPos,
            size: this.size,
            color: this.color,
            startAt: this.startAt,
            targetPos: this.targetPos,
            speed: this.speed,
            movePlayer: this.movePlayer,
            children: this.children.map(child => child.toJSON())
        }
    }

}