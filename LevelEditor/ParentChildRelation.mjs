import * as drawLib from '../Helper/drawLib.mjs';

export class ParentChildRelation {

    constructor(ctx, parent, child) {
        this.ctx = ctx;
        this.parent = parent;
        this.child = child;
    }

    draw() {
        this.ctx.save();
        drawLib.circle(this.ctx, this.parent.pos.x + this.parent.size.width / 2, this.parent.pos.y + this.parent.size.height / 2, 5, 'gold');
        this.ctx.strokeStyle = 'gold';
        this.ctx.beginPath();
        let childCenter = this.child.getCenter();

        this.ctx.moveTo(this.parent.pos.x + this.parent.size.width / 2, this.parent.pos.y + this.parent.size.height / 2);
        this.ctx.lineTo(childCenter.x, childCenter.y);
        this.ctx.stroke();
        drawLib.circle(this.ctx, childCenter.x, childCenter.y, 5, 'grey');
        this.ctx.restore();
    }

    setPosition(x, y) {
        
    }

    detectClick(x, y) {
        return null;
    }

    rotate(degree) {
        this.movingObstacle.rotate(degree);
    }

}