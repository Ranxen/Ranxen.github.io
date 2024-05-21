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

    if (json.entities) {
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
        level.entities.push(...json.entities.map(entity => {
            let ent = createEntityByConstructor(level, ctx, entity, actions);
            createChildren(level, ctx, entity, actions, ent);
            return ent;
        }));
        return level;
    }
    else {
        return oldJsonToLevel(json, ctx, actions);
    }
}


export function oldJsonToLevel(json, ctx, actions) {
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
    level.entities.push(...json.colorOrbs.map(colorOrb => new ColorOrb(ctx, colorOrb.pos, colorOrb.size, colorOrb.color)));
    if (json.timedColorOrbs) {
        level.entities.push(...json.timedColorOrbs.map(timedColorOrb => new TimedColorOrb(ctx, timedColorOrb.pos, timedColorOrb.size, timedColorOrb.color, timedColorOrb.timeout)));
    }
    level.entities.push(...json.obstacles.map(obstacle => {
        let obs = new Obstacle(ctx, obstacle.pos, obstacle.size, obstacle.color);
        createChildren(level, ctx, obstacle, actions, obs);
        return obs;
    }));
    if (json.movingObstacles) {
        level.entities.push(...json.movingObstacles.map(movingObstacle => {
            let obs = new MovingObstacle(ctx, movingObstacle.pos, movingObstacle.size, movingObstacle.color, movingObstacle.targetPos, movingObstacle.speed, movingObstacle.movePlayer, movingObstacle.children);
            createChildren(level, ctx, movingObstacle, actions, obs);
            return obs;
        }));
    }
    if (json.spikes) {
        level.entities.push(...json.spikes.map(spike => new Spike(ctx, spike.pos, spike.size, spike.rotation, spike.color, actions.restartLevel)));
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

function createEntityByConstructor(level, ctx, json, actions) {
    switch (json.constructor) {
        case 'Obstacle':
            return new Obstacle(ctx, json.pos, json.size, json.color, json.children);
        case 'MovingObstacle':
            return new MovingObstacle(ctx, json.pos, json.size, json.color, json.targetPos, json.speed, json.movePlayer);
        case 'TimedColorOrb':
            return new TimedColorOrb(ctx, json.pos, json.size, json.color, json.timeout);
        case 'ColorOrb':
            return new ColorOrb(ctx, json.pos, json.size, json.color);
        case 'Spike':
            return new Spike(ctx, json.pos, json.size, json.rotation, json.color, actions.restartLevel);
        case 'Finish':
            level.finish = new Finish(ctx, json.pos, json.size);
            return level.finish;
        case 'Key':
            level.key = new Key(ctx, json.pos);
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
        entities: level.entities.map(entity => entity.toJSON())
    };

    return JSON.stringify(json);
}