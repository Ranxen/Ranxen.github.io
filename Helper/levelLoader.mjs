import { Level } from "../Game/Level.mjs";


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
                color: obstacle.color
            }
        }),
        movingObstacles: level.movingObstacles.map(movingObstacle => {
            return {
                pos: movingObstacle.pos,
                size: movingObstacle.size,
                color: movingObstacle.color,
                targetPos: movingObstacle.targetPos,
                speed: movingObstacle.speed,
                movePlayer: movingObstacle.movePlayer
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