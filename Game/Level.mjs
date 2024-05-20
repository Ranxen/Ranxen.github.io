import { Key } from "./Key.mjs";
import { Finish } from "./Finish.mjs";
import { ColorOrb } from "./ColorOrb.mjs";
import { Obstacle } from "./Obstacle.mjs";
import { MovingObstacle } from "./MovingObstacle.mjs";
import { Spike } from "./Spike.mjs";


export class Level {

    constructor(ctx, level, actions) {
        if (level !== undefined) {
            level = JSON.parse(JSON.stringify(level));
            if (actions === undefined) {
                actions = {};
            }

            this.levelName = level.levelName;
            this.isCustom = level.isCustom;
            this.index = level.index;
            this.startPos = level.startPos;
            this.startColor = level.startColor;
            if (typeof level.keyPos === 'object') {
                this.key = new Key(ctx, level.keyPos);
            }
            if (typeof level.finish === 'object') {
                this.finish = new Finish(ctx, level.finish.pos, level.finish.size);
            }
            this.colorOrbs = level.colorOrbs.map(colorOrb => new ColorOrb(ctx, colorOrb.pos, colorOrb.size, colorOrb.color));
            this.obstacles = level.obstacles.map(obstacle => {
                let obs = new Obstacle(ctx, obstacle.pos, obstacle.size, obstacle.color);
                this.createChildren(ctx, obstacle, actions, obs);
                return obs;
            });
            if (level.movingObstacles) {
                this.movingObstacles = level.movingObstacles.map(movingObstacle => {
                    let obs = new MovingObstacle(ctx, movingObstacle.pos, movingObstacle.size, movingObstacle.color, movingObstacle.targetPos, movingObstacle.speed, movingObstacle.movePlayer, movingObstacle.children);
                    this.createChildren(ctx, movingObstacle, actions, obs);
                    return obs;
                });
            }
            else {
                this.movingObstacles = [];
            }
            if (level.spikes) {
                this.spikes = level.spikes.map(spike => new Spike(ctx, spike.pos, spike.size, spike.rotation, spike.color, actions.restartLevel));
            }
            else {
                this.spikes = [];
            }
        }
        else {
            this.colorOrbs = [];
            this.obstacles = [];
            this.movingObstacles = [];
            this.spikes = [];
        }
    }

    createChildren(ctx, json, actions, entity) {
        if (json.children) {
            json.children.map(child => {
                let childEntity = this.createChildByConstructor(ctx, child, actions);
                entity.addChild(childEntity);
                this.createChildren(ctx, child, actions, childEntity);
            });
        }
    }

    createChildByConstructor(ctx, child, actions) {
        switch (child.constructor) {
            case 'Obstacle':
                return new Obstacle(ctx, child.pos, child.size, child.color, child.children);
            case 'MovingObstacle':
                return new MovingObstacle(ctx, child.pos, child.size, child.color, child.targetPos, child.speed, child.movePlayer);
            case 'ColorOrb':
                return new ColorOrb(ctx, child.pos, child.size, child.color);
            case 'Spike':
                return new Spike(ctx, child.pos, child.size, child.rotation, child.color, actions.restartLevel);
            case 'Finish':
                this.finish = new Finish(ctx, child.pos, child.size);
                return this.finish;
            case 'Key':
                this.key = new Key(ctx, child.pos);
                return this.key;
        }
    }

    drawObstacles() {
        for (let obstacle of this.obstacles) {
            obstacle.draw();
        }

        if (this.movingObstacles) {
            for (let movingObstacle of this.movingObstacles) {
                movingObstacle.draw();
            }
        }
    }

    drawSpikes() {
        for (let spike of this.spikes) {
            spike.draw();
        }
    }

    drawColorOrbs() {
        for (let colorOrb of this.colorOrbs) {
            colorOrb.draw();
        }
    }

    drawFinish() {
        this.finish.draw();
    }

    drawKey(player) {
        this.key.draw(player);
    }

}