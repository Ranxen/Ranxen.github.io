import { GameManager } from "../Game/GameManager.mjs";
import { ColorOrb } from "../Game/ColorOrb.mjs";
import { Entity } from "../Game/Entity.mjs";
import { Finish } from "../Game/Finish.mjs";
import { Key } from "../Game/Key.mjs";
import { MovingEntity } from "../Game/MovingEntity.mjs";
import { MovingObstacle } from "../Game/MovingObstacle.mjs";
import { MovingObstaclePath } from "./MovingObstaclePath.mjs";
import { Obstacle } from "../Game/Obstacle.mjs";
import { Player } from "../Game/Player.mjs";
import { Spike } from "../Game/Spike.mjs";

export class EditorGameManager extends GameManager {

    renderPipeline = [Obstacle, MovingObstacle, MovingObstaclePath, ColorOrb, Spike, MovingEntity, Entity, Finish, Player, Key];

    constructor() {
        super();
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
    }

    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }

}