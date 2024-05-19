import { ColorOrb } from "../Game/ColorOrb.mjs";
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
        keyPos: level.key.pos,
        finish: {
            pos: level.finish.pos,
            size: level.finish.size
        },
        colorOrbs: level.colorOrbs.map(colorOrb => {
            return {
                pos: colorOrb.pos,
                size: colorOrb.size,
                color: colorOrb.color
            }
        }),
        obstacles: level.obstacles.map(obstacle => {
            return {
                pos: obstacle.pos,
                size: obstacle.size,
                color: obstacle.color,
                children: mapChildren(obstacle)
            }
        }),
        movingObstacles: level.movingObstacles.map(movingObstacle => {
            return {
                pos: movingObstacle.pos,
                size: movingObstacle.size,
                color: movingObstacle.color,
                targetPos: movingObstacle.targetPos,
                speed: movingObstacle.speed,
                movePlayer: movingObstacle.movePlayer,
                children: mapChildren(movingObstacle)
            }
        }),
        spikes: level.spikes.map(spike => {
            return {
                pos: spike.pos,
                size: spike.size,
                rotation: spike.rotation * 180 / Math.PI,
                color: spike.color
            }
        })
    };

    return JSON.stringify(json);
}


function mapByType(child) {
    switch (child.constructor) {
        case Spike:
            return {
                constructor: "Spike",
                pos: child.pos,
                size: child.size,
                rotation: child.rotation * 180 / Math.PI,
                color: child.color
            }
        case MovingObstacle:
            return {
                constructor: "MovingObstacle",
                pos: child.pos,
                size: child.size,
                color: child.color,
                targetPos: child.targetPos,
                speed: child.speed,
                movePlayer: child.movePlayer,
                children: mapChildren(child)
            }
        case Obstacle:
            return {
                constructor: "Obstacle",
                pos: child.pos,
                size: child.size,
                color: child.color,
                children: mapChildren(child)
            }
        case ColorOrb:
            return {
                constructor: "ColorOrb",
                pos: child.pos,
                size: child.size,
                color: child.color
            }
    }
}


function mapChildren(entity) {
    return entity.children.map(child => {
        return mapByType(child);
    });
}