import { ColorOrb } from "./ColorOrb.mjs";
import { Entity } from "./Entity.mjs";
import { Finish } from "./Finish.mjs";
import { Key } from "./Key.mjs";
import { MovingEntity } from "./MovingEntity.mjs";
import { MovingObstacle } from "./MovingObstacle.mjs";
import { Obstacle } from "./Obstacle.mjs";
import { Player } from "./Player.mjs";
import { Spike } from "./Spike.mjs";

export class GameManager {

    renderPipeline = [Obstacle, MovingObstacle, ColorOrb, Spike, MovingEntity, Entity, Finish, Player, Key];

    constructor(level, player) {
        this.entities = [];
        this.updateEntities = [];
        this.player = null;
        if (level !== undefined && player !== undefined) {
            this.buildEntities(level, player);
        }
    }

    buildEntities(level, player) {
        this.entities = [];
        this.updateEntities = [];
        this.player = player;

        for (let obstacle of level.obstacles) {
            this.addEntity(obstacle);
        }
        for (let movingObstacle of level.movingObstacles) {
            this.addEntity(movingObstacle);
        }
        for (let colorOrb of level.colorOrbs) {
            this.addEntity(colorOrb);
        }
        for (let spike of level.spikes) {
            this.addEntity(spike);
        }
        this.addEntity(level.finish);
        this.addEntity(player);
        this.addEntity(level.key);

        this.sortEntities();
    }

    sortEntities() {
        this.entities.sort((a, b) => {
            return this.renderPipeline.indexOf(a.constructor) - this.renderPipeline.indexOf(b.constructor);
        });
        this.updateEntities.sort((a, b) => {
            return this.renderPipeline.indexOf(a.constructor) - this.renderPipeline.indexOf(b.constructor);
        });
    }

    filterColorOrbs() {
        this.entities = this.entities.filter(entity => {
            if (entity instanceof ColorOrb) {
                return !entity.delete;
            }

            this.filterColorOrbsOfChildren(entity);

            return true;
        });
    }

    filterColorOrbsOfChildren(entity) {
        entity.children = entity.children.filter(child => {
            if (child instanceof ColorOrb) {
                return !child.delete;
            }
            return true;
        });
    }

    addEntity(entity) {
        this.entities.push(entity);
        if (entity instanceof MovingEntity) {
            this.updateEntities.push(entity);
        }
    }

    detectCollisions(colorWheel) {
        for (let entity of this.updateEntities) {
            entity.clearCollisions();
            for (let otherEntity of this.entities) {
                if (entity !== otherEntity) {
                    entity.detectCollision({ other: otherEntity, colorWheel: colorWheel });
                }
            }
        }
    }

    update(colorWheel) {
        this.detectCollisions(colorWheel);
        for (let entity of this.updateEntities) {
            entity.update();
        }
        this.filterColorOrbs();
    }

    draw() {
        for (let entity of this.entities) {
            entity.draw();
        }
    }

}