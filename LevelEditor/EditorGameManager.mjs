import { GameManager } from "../Game/GameManager.mjs";
import { ColorOrb } from "../Game/ColorOrb.mjs";
import { Entity } from "../Game/Entity.mjs";
import { Finish } from "../Game/Finish.mjs";
import { Key } from "../Game/Key.mjs";
import { UpdatingEntity } from "../Game/UpdatingEntity.mjs";
import { MovingObstacle } from "../Game/MovingObstacle.mjs";
import { MovingObstaclePath } from "./MovingObstaclePath.mjs";
import { Obstacle } from "../Game/Obstacle.mjs";
import { Player } from "../Game/Player.mjs";
import { Spike } from "../Game/Spike.mjs";
import { ParentChildRelation } from "./ParentChildRelation.mjs";

export class EditorGameManager extends GameManager {

    renderPipeline = [Obstacle, MovingObstacle, MovingObstaclePath, ColorOrb, Spike, UpdatingEntity, Entity, Finish, Player, Key, ParentChildRelation];

    constructor() {
        super();
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
            this.addEntity(new MovingObstaclePath(movingObstacle.ctx, movingObstacle));
        }
        for (let colorOrb of level.colorOrbs) {
            this.addEntity(colorOrb);
        }
        for (let timedColorOrb of level.timedColorOrbs) {
            this.addEntity(timedColorOrb);
        }
        for (let spike of level.spikes) {
            this.addEntity(spike);
        }
        if (level.finish.parent === null) {
            this.addEntity(level.finish);
        }
        this.addEntity(player);
        if (level.key.parent === null) {
            this.addEntity(level.key);
        }

        this.sortEntities();
    }

    getTargetIndex(type) {
        let typeIndex = this.renderPipeline.indexOf(type);

        for (let i = 0; i < this.entities.length; i++) {
            let entityIndex = this.renderPipeline.indexOf(this.entities[i].constructor);
            if (entityIndex > typeIndex) {
                return i;
            }
        }

        return this.entities.length;
    }

    addEntity(entity) {
        this.entities.splice(this.getTargetIndex(entity.constructor), 0, entity);

        this.addParentChildRelation(entity);
    }

    addParentChildRelation(entity) {
        entity.children?.forEach(child => {
            this.addEntity(new ParentChildRelation(entity.ctx, entity, child));
            this.addParentChildRelation(child);
        });
    }

    removeEntity(entity) {
        if (entity instanceof MovingObstacle) {
            let path = this.entities.find(e => e instanceof MovingObstaclePath && e.movingObstacle === entity);
            if (path) {
                this.removeEntity(path);
            }
        }
        
        this.entities = this.entities.filter(e => e !== entity && !(e instanceof ParentChildRelation && (e.parent === entity || e.child === entity)));
    }

    detectClick(x, y) {
        for (let entity of [...this.entities].reverse()) {
            let clicked = entity.detectClick(x, y);
            if (clicked) {
                return clicked;
            }
        }

        return null;
    }

}