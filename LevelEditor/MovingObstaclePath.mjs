import * as drawLib from '../Helper/drawLib.mjs';
import * as physicsLib from '../Helper/physicsLib.mjs';


export class MovingObstaclePath {

    constructor(ctx, movingObstacle) {
        this.ctx = ctx;
        this.movingObstacle = movingObstacle;
        this.pos = this.movingObstacle.targetPos;
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.movingObstacle.size.width / 2, this.movingObstacle.size.height / 2);
        drawLib.circle(this.ctx, this.movingObstacle.pos.x, this.movingObstacle.pos.y, 5, 'grey');
        this.ctx.strokeStyle = 'grey';
        this.ctx.beginPath();
        this.ctx.moveTo(this.movingObstacle.pos.x, this.movingObstacle.pos.y);
        this.ctx.lineTo(this.movingObstacle.targetPos.x, this.movingObstacle.targetPos.y);
        this.ctx.stroke();
        drawLib.circle(this.ctx, this.movingObstacle.targetPos.x, this.movingObstacle.targetPos.y, 5, 'grey');
        this.ctx.restore();
    }

    setPosition(x, y) {
        this.movingObstacle.targetPos = { x: x, y: y };
    }

    detectClick(x, y) {
        if (physicsLib.pointInsideCircle({ x: x, y: y }, { pos: { x: this.movingObstacle.targetPos.x + this.movingObstacle.size.width / 2, y: this.movingObstacle.targetPos.y + this.movingObstacle.size.height / 2 }, size: 5 })) {
            return this;
        }
    }

    rotate(degree) {
        this.movingObstacle.rotate(degree);
    }


}