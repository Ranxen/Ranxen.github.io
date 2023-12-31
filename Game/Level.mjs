import { Key } from "./Key.mjs";
import { Finish } from "./Finish.mjs";
import { ColorOrb } from "./ColorOrb.mjs";
import { Obstacle } from "./Obstacle.mjs";
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
            this.key = new Key(ctx, level.keyPos);
            this.finish = new Finish(ctx, level.finish.pos, level.finish.size);
            this.colorOrbs = level.colorOrbs.map(colorOrb => new ColorOrb(ctx, colorOrb.pos, colorOrb.size, colorOrb.color));
            this.obstacles = level.obstacles.map(obstacle => new Obstacle(ctx, obstacle.pos, obstacle.size, obstacle.color));
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
            this.spikes = [];
        }
    }


    drawObstacles() {
        for (let obstacle of this.obstacles) {
            obstacle.draw();
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


    detectColorOrbCollisions(player, colorWheel) {
        for (let colorOrb of this.colorOrbs) {
            colorOrb.detectCollision(player, colorWheel);
        }
    }


    detectSpikeCollisions(player) {
        for (let spike of this.spikes) {
            spike.detectCollision(player);
        }
    }


    detectObstacleCollisions(player) {
        for (let obstacle of this.obstacles) {
            player.detectCollision(obstacle);
        }
    }


}