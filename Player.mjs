import * as drawLib from './drawLib.mjs';


export class Player {


    velocity = {x: 0, y: 0};
    gravitiy = .75;
    collisions = [];
    isGrounded = false;
    colors = [];
    hasKey = false;
    maxVelocity = 50;


    constructor(ctx, pos, size, color) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = size;
        this.color = color;
        this.colors.push(color);
    }


    update() {
        this.velocity.y += this.gravitiy;
        this.isGrounded = false;

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


        if (this.velocity.x > this.maxVelocity) {
            this.velocity.x = this.maxVelocity;
        }

        if (this.velocity.x < -this.maxVelocity) {
            this.velocity.x = -this.maxVelocity;
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
            if (this.pos.x + this.size + this.velocity.x >= obstacle.pos.x && this.pos.x + this.velocity.x <= obstacle.pos.x + obstacle.size.width
                && this.pos.y + this.size + this.velocity.y >= obstacle.pos.y && this.pos.y + this.velocity.y <= obstacle.pos.y + obstacle.size.height) {
                this.collisions.push(obstacle);
            }
        }
    }


    moveLeft() {
        this.velocity.x = -5;
    }


    moveRight() {
        this.velocity.x = 5;
    }


    jump() {
        if (this.isGrounded) {
            this.velocity.y = -20;
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


}