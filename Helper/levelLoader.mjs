import { ColorOrb } from "../Game/ColorOrb.mjs";
import { Finish } from "../Game/Finish.mjs";
import { Key } from "../Game/Key.mjs";
import { Level } from "../Game/Level.mjs";
import { MovingObstacle } from "../Game/MovingObstacle.mjs";
import { Obstacle } from "../Game/Obstacle.mjs";
import { Spike } from "../Game/Spike.mjs";


export function loadLevel(ctx, encodedLevel, actions) {
    let json = JSON.parse(atob(encodedLevel));
    let level = new Level(ctx, json, actions);

    return level;
}


export function loadLevelFromJSON(ctx, json, actions) {
    let level = new Level(ctx, json, actions);
    return level;
}


export function loadLevelFromFile(ctx, file, actions, setLevel) {
    let reader = new FileReader();

    reader.onload = () => {
        let level = new Level(ctx, JSON.parse(reader.result), actions);
        setLevel(level);
    };

    reader.readAsText(file);
}


export function levelToJSON(level, player) {
    if (level.levelName === undefined) {
        level.levelName = "Custom Level";
    }

    let json = {
        index: -1,
        levelName: level.levelName,
        isCustom: true,
        startPos: player.pos,
        startColor: player.color,
        keyPos: level.key.parent != null ? 'child' : level.key.pos,
        finish: level.finish.parent != null ? 'child' : {
            pos: level.finish.pos,
            size: level.finish.size
        },
        colorOrbs: level.colorOrbs.map(colorOrb => mapByType(colorOrb)),
        obstacles: level.obstacles.map(obstacle => mapByType(obstacle)),
        movingObstacles: level.movingObstacles.map(movingObstacle => mapByType(movingObstacle)),
        spikes: level.spikes.map(spike => mapByType(spike))
    };

    return JSON.stringify(json);
}


function mapByType(entity) {
    switch (entity.constructor) {
        case Spike:
            return {
                constructor: "Spike",
                pos: entity.pos,
                size: entity.size,
                rotation: entity.rotation * 180 / Math.PI,
                color: entity.color
            }
        case MovingObstacle:
            return {
                constructor: "MovingObstacle",
                pos: entity.pos,
                size: entity.size,
                color: entity.color,
                targetPos: entity.targetPos,
                speed: entity.speed,
                movePlayer: entity.movePlayer,
                children: mapChildren(entity)
            }
        case Obstacle:
            return {
                constructor: "Obstacle",
                pos: entity.pos,
                size: entity.size,
                color: entity.color,
                children: mapChildren(entity)
            }
        case ColorOrb:
            return {
                constructor: "ColorOrb",
                pos: entity.pos,
                size: entity.size.width,
                color: entity.color
            }
        case Finish:
            return {
                constructor: "Finish",
                pos: entity.pos,
                size: entity.size
            }
        case Key:
            return {
                constructor: "Key",
                pos: entity.pos
            }
    }
}


function mapChildren(entity) {
    return entity.children.map(child => {
        return mapByType(child);
    });
}