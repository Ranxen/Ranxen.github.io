import * as drawLib from '../Helper/drawLib.mjs';
import { UpdatingEntity } from './UpdatingEntity.mjs';
import { MovingObstacle } from './MovingObstacle.mjs';
import { Obstacle } from './Obstacle.mjs';


export class Player extends UpdatingEntity {


    gravity = .75;
    maxVelocity = 50;
    maxVelHorizontal = 5;
    accelHorizontal = .5;
    dragGround = .9;
    dragAir = .95;
    jumpVelocity = -17.5;
    jumpMultiplier = .5;
    collisionMask = [Obstacle, MovingObstacle];


    constructor(ctx, pos, size, color) {
        super(ctx, pos, size, color);
        this.direction = 'none';
        this.velocity = { x: 0, y: 0 };
        this.collisions = [];
        this.isGrounded = false;
        this.hasKey = false;
        this.colors = [];

        this.ctx = ctx;
        this.pos = pos;
        this.color = color;
        this.colors.push(color);
    }

    drawEntity() {
        drawLib.rect(this.ctx, 0, 0, this.size.width, this.size.height, this.color);

        if (this.colorTimeout) {
            this.ctx.translate(this.size.width + 10, -30);
            drawLib.rect(this.ctx, 0, 0, 10, 20, 'black');
            let percentage = this.colorTimeout / this.colorTimeoutMax;
            drawLib.rect(this.ctx, 0, 20 * (1 - percentage), 10, 20 * percentage, this.color);
        }
    }

    update() {
        this.checkColorTimeout();
        this.velocity.y += this.gravity;
        this.isGrounded = false;

        if (this.direction === 'left') {
            this.velocity.x -= this.accelHorizontal;
        }
        else if (this.direction === 'right') {
            this.velocity.x += this.accelHorizontal;
        }
        else if (Math.abs(this.velocity.x) < .1) {
            this.velocity.x = 0;
        }

        this.collisions.sort((a, b) => {
            return b.pos.y - a.pos.y;
        });

        for (let obstacle of this.collisions) {
            if (this.velocity.y >= 0 && this.pos.y < obstacle.pos.y && this.pos.y + this.size.height < obstacle.pos.y + obstacle.size.height && this.pos.x + this.size.width > obstacle.pos.x && this.pos.x < obstacle.pos.x + obstacle.size.width) {
                this.pos.y = obstacle.pos.y - this.size.height;
                this.velocity.y = 0;
                this.isGrounded = true;

                if (obstacle instanceof MovingObstacle && obstacle.movePlayer) {
                    this.pos.x += obstacle.velocity.x;
                }

            } else if (this.velocity.y < 0 && this.pos.y > obstacle.pos.y && this.pos.y + this.size.height > obstacle.pos.y + obstacle.size.height && this.pos.x + this.size.width > obstacle.pos.x && this.pos.x < obstacle.pos.x + obstacle.size.width) {
                this.pos.y = obstacle.pos.y + obstacle.size.height;
                this.velocity.y = 0;
            } else if (this.pos.x <= obstacle.pos.x && this.pos.x + this.size.width >= obstacle.pos.x && this.pos.y + this.size.height > obstacle.pos.y && this.pos.y < obstacle.pos.y + obstacle.size.height) {
                this.pos.x = obstacle.pos.x - this.size.width;

                if (this.velocity.x > 0) {
                    this.velocity.x = 0;
                }
            } else if (this.pos.x <= obstacle.pos.x + obstacle.size.width && this.pos.x + this.size.width >= obstacle.pos.x + obstacle.size.width && this.pos.y + this.size.height > obstacle.pos.y && this.pos.y < obstacle.pos.y + obstacle.size.height) {
                this.pos.x = obstacle.pos.x + obstacle.size.width;

                if (this.velocity.x < 0) {
                    this.velocity.x = 0;
                }
            }
        }

        if (this.direction == 'none') {
            if (this.isGrounded) {
                this.velocity.x *= this.dragGround;
            }
            else {
                this.velocity.x *= this.dragAir;
            }
        }

        if (this.velocity.x > this.maxVelHorizontal) {
            this.velocity.x = this.maxVelHorizontal;
        }

        if (this.velocity.x < -this.maxVelHorizontal) {
            this.velocity.x = -this.maxVelHorizontal;
        }

        if (this.velocity.y > this.maxVelocity) {
            this.velocity.y = this.maxVelocity;
        }


        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
    }

    detectCollision(args) {
        let other = args.other;
        args.other = this;
        args.collisionMask = this.collisionMask;
        let possibleCollisions = other.detectCollision(args);

        for (let collision of possibleCollisions) {
            if (this.collisionMask.includes(collision.constructor) && this.color !== collision.color) {
                this.collisions.push(collision);
            }
        }
    }

    moveLeft() {
        this.direction = 'left';
    }

    moveRight() {
        this.direction = 'right';
    }

    jump() {
        if (this.isGrounded) {
            this.velocity.y = -Math.abs(this.velocity.x) * this.jumpMultiplier + this.jumpVelocity;
            this.isGrounded = false;
        }
    }

    addColor(color) {
        this.removeTemporaryColor();
        if (!this.colors.includes(color)) {
            this.colors.push(color);
        }
    }

    checkColorTimeout() {
        if (this.colorTimeout) {
            this.colorTimeout--;
            if (this.colorTimeout <= 0) {
                this.colorTimeout = null;
                let temp = this.color;
                this.previousColor();
                this.colors = this.colors.filter(color => color !== temp);
            }
        }
    }

    removeTemporaryColor() {
        if (this.colorTimeout) {
            this.colorTimeout = null;
            this.colors = this.colors.filter(color => color !== this.color);
        }
    }

    setColor(color) {
        this.removeTemporaryColor();

        this.color = color;
    }

    nextColor() {
        this.setColor(this.colors[(this.colors.indexOf(this.color) + 1) % this.colors.length]);
    }

    previousColor() {
        this.setColor(this.colors[(this.colors.indexOf(this.color) - 1 + this.colors.length) % this.colors.length]);
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
        }]
    }

}