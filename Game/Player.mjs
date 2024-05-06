import * as drawLib from '../Helper/drawLib.mjs';
import * as physicsLib from '../Helper/physicsLib.mjs';


export class Player {


    velocity = {x: 0, y: 0};
    gravity = .75;
    collisions = [];
    isGrounded = false;
    colors = [];
    hasKey = false;
    direction = 'right';
    maxVelocity = 50;
    maxVelHorizontal = 5;
    accelHorizontal = .5;
    dragGround = .9;
    dragAir = .95;
    jumpVelocity = -17.5;
    jumpMultiplier = .5;


    constructor(ctx, pos, size, color) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = size;
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

        for (let obstacle of this.collisions) {
            if (this.velocity.y > 0 && this.pos.y < obstacle.pos.y && this.pos.y + this.size < obstacle.pos.y + obstacle.size.height && this.pos.x + this.size > obstacle.pos.x && this.pos.x < obstacle.pos.x + obstacle.size.width) {
                this.pos.y = obstacle.pos.y - this.size;
                this.velocity.y = 0;
                this.isGrounded = true;
            } else if (this.velocity.y < 0 && this.pos.y > obstacle.pos.y && this.pos.y + this.size > obstacle.pos.y + obstacle.size.height && this.pos.x + this.size > obstacle.pos.x && this.pos.x < obstacle.pos.x + obstacle.size.width) {
                this.pos.y = obstacle.pos.y + obstacle.size.height;
                this.velocity.y = 0;
            } else if (this.velocity.x > 0 && this.pos.x < obstacle.pos.x && this.pos.x + this.size < obstacle.pos.x + obstacle.size.width && this.pos.y + this.size > obstacle.pos.y && this.pos.y < obstacle.pos.y + obstacle.size.height) {
                this.pos.x = obstacle.pos.x - this.size;
                this.velocity.x = 0;
            } else if (this.velocity.x < 0 && this.pos.x > obstacle.pos.x && this.pos.x + this.size > obstacle.pos.x + obstacle.size.width && this.pos.y + this.size > obstacle.pos.y && this.pos.y < obstacle.pos.y + obstacle.size.height) {
                this.pos.x = obstacle.pos.x + obstacle.size.width;
                this.velocity.x = 0;
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


    clearCollisions() {
        this.collisions = [];
    }


    detectCollision(obstacle) {
        if (this.color !== obstacle.color) {
            if (physicsLib.AABBCollisionPredicted(this, obstacle)) {
                this.collisions.push(obstacle);
            }
        }
    }


    detectClick(x, y) {
        return physicsLib.pointInsideRect({ x: x, y: y }, { pos: this.pos, size: { width: this.size, height: this.size } });
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


    draw() {
        this.ctx.save();

        this.ctx.translate(this.pos.x, this.pos.y);
        drawLib.rect(this.ctx, 0, 0, this.size, this.size, this.color);

        this.ctx.restore();
    }


    getEdges() {
        return [{ x: this.pos.x, y: this.pos.y }, { x: this.pos.x + this.size, y: this.pos.y }, { x: this.pos.x, y: this.pos.y + this.size }, { x: this.pos.x + this.size, y: this.pos.y + this.size }];
    }


    rotate(degree) {

    }


}