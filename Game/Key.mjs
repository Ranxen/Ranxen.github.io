import * as drawLib from '../Helper/drawLib.mjs';
import * as physicsLib from '../Helper/physicsLib.mjs';


export class Key {


    constructor(ctx, pos) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = { width: 20, height: 30}
        this.color = 'gold';
    }


    draw(player) {
        this.ctx.save();

        if (!player.hasKey) {
            this.ctx.translate(this.pos.x, this.pos.y);
        }
        else {
            this.ctx.translate(player.pos.x - 10, player.pos.y - 40);
        }

        drawLib.rect(this.ctx, this.size.width / 3, 0, this.size.width / 4, this.size.height, this.color, "transparent", 0);
        drawLib.rect(this.ctx, this.size.width / 6, this.size.height / 2, this.size.width / 4, this.size.height / 5, this.color, "transparent", 0);
        drawLib.rect(this.ctx, this.size.width / 6, this.size.height / 1.25, this.size.width / 4, this.size.height / 5, this.color, "transparent", 0);
        drawLib.circle(this.ctx, this.size.width / 2, 0, this.size.width / 2, this.color, "transparent", 0);


        this.ctx.restore();
    }


    detectCollision(player) {
        if (physicsLib.AABBCollision(player, this)) {
            player.hasKey = true;
        }
    }


    detectClick(x, y) {
        return physicsLib.pointInsideRect({ x: x, y: y}, this);
    }


    rotate(degree) {

    }


}