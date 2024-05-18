import * as physicsLib from '../Helper/physicsLib.mjs';
import { MovingEntity } from './MovingEntity.mjs';
import { MovingObstacle } from './MovingObstacle.mjs';
import { Obstacle } from './Obstacle.mjs';


export class Player extends MovingEntity {


    gravity = .75;
    maxVelocity = 50;
    maxVelHorizontal = 5;
    accelHorizontal = .5;
    dragGround = .9;
    dragAir = .95;
    jumpVelocity = -17.5;
    jumpMultiplier = .5;
    collidesWith = [Obstacle, MovingObstacle];


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

    update() {
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
        if (this.collidesWith.includes(other.constructor)) {
            let obstacle = other;
            if (this.color !== obstacle.color) {
                if (physicsLib.AABBCollisionPredicted(this, obstacle)) {
                    this.collisions.push(obstacle);
                }
            }
        }
        else {
            args.other = this;
            other.detectCollision(args);
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
        if (!this.colors.includes(color)) {
            this.colors.push(color);
        }
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