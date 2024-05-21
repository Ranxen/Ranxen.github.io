import { ColorOrb } from "../Game/ColorOrb.mjs";
import { Finish } from "../Game/Finish.mjs";
import { Key } from "../Game/Key.mjs";
import { Level } from "../Game/Level.mjs";
import { MovingObstacle } from "../Game/MovingObstacle.mjs";
import { Obstacle } from "../Game/Obstacle.mjs";
import { Spike } from "../Game/Spike.mjs";
import { TimedColorOrb } from "../Game/TimedColorOrb.mjs";


export function loadLevel(ctx, encodedLevel, actions) {
    let json = JSON.parse(atob(encodedLevel));
    return jsonToLevel(json, ctx, actions);
}


export function loadLevelFromFile(ctx, file, actions, setLevel) {
    let reader = new FileReader();

    reader.onload = () => {
        let level = jsonToLevel(JSON.parse(reader.result), ctx, actions);
        setLevel(level);
    };

    reader.readAsText(file);
}


export function jsonToLevel(json, ctx, actions) {
    // Deep copy the json object to avoid modifying the original object
    json = JSON.parse(JSON.stringify(json));

    let level = new Level();

    level.levelName = json.levelName;
    level.isCustom = json.isCustom;
    level.index = json.index;
    level.startPos = json.startPos;
    level.startColor = json.startColor;
    if (typeof json.keyPos === 'object') {
        level.key = new Key(ctx, json.keyPos);
    }
    if (typeof json.finish === 'object') {
        level.finish = new Finish(ctx, json.finish.pos, json.finish.size);
    }
    level.colorOrbs = json.colorOrbs.map(colorOrb => new ColorOrb(ctx, colorOrb.pos, colorOrb.size, colorOrb.color));
    if (json.timedColorOrbs) {
        level.timedColorOrbs = json.timedColorOrbs.map(timedColorOrb => new TimedColorOrb(ctx, timedColorOrb.pos, timedColorOrb.size, timedColorOrb.color, timedColorOrb.timeout));
    }
    else {
        level.timedColorOrbs = [];
    }
    level.obstacles = json.obstacles.map(obstacle => {
        let obs = new Obstacle(ctx, obstacle.pos, obstacle.size, obstacle.color);
        createChildren(level, ctx, obstacle, actions, obs);
        return obs;
    });
    if (json.movingObstacles) {
        level.movingObstacles = json.movingObstacles.map(movingObstacle => {
            let obs = new MovingObstacle(ctx, movingObstacle.pos, movingObstacle.size, movingObstacle.color, movingObstacle.targetPos, movingObstacle.speed, movingObstacle.movePlayer, movingObstacle.children);
            createChildren(level, ctx, movingObstacle, actions, obs);
            return obs;
        });
    }
    else {
        level.movingObstacles = [];
    }
    if (json.spikes) {
        level.spikes = json.spikes.map(spike => new Spike(ctx, spike.pos, spike.size, spike.rotation, spike.color, actions.restartLevel));
    }
    else {
        level.spikes = [];
    }

    return level;
}


function createChildren(level, ctx, json, actions, entity) {
    if (json.children) {
        json.children.map(child => {
            let childEntity = createEntityByConstructor(level, ctx, child, actions);
            entity.addChild(childEntity);
            createChildren(level, ctx, child, actions, childEntity);
        });
    }
}

function createEntityByConstructor(level, ctx, child, actions) {
    switch (child.constructor) {
        case 'Obstacle':
            return new Obstacle(ctx, child.pos, child.size, child.color, child.children);
        case 'MovingObstacle':
            return new MovingObstacle(ctx, child.pos, child.size, child.color, child.targetPos, child.speed, child.movePlayer);
        case 'TimedColorOrb':
            return new TimedColorOrb(ctx, child.pos, child.size, child.color, child.timeout);
        case 'ColorOrb':
            return new ColorOrb(ctx, child.pos, child.size, child.color);
        case 'Spike':
            return new Spike(ctx, child.pos, child.size, child.rotation, child.color, actions.restartLevel);
        case 'Finish':
            level.finish = new Finish(ctx, child.pos, child.size);
            return level.finish;
        case 'Key':
            level.key = new Key(ctx, child.pos);
            return level.key;
    }
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
        timedColorOrbs: level.timedColorOrbs.map(timedColorOrb => mapByType(timedColorOrb)),
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
        case TimedColorOrb:
            return {
                constructor: "TimedColorOrb",
                pos: entity.pos,
                size: entity.size.width,
                color: entity.color,
                timeout: entity.timeout
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