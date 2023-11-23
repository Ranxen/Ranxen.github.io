import { Level } from "../Game/Level.mjs";


export function loadLevel(ctx, encodedLevel, actions) {
    let json = JSON.parse(atob(encodedLevel));
    let level = new Level(ctx, json, actions);

    return level;
}


export function levelToJSON(level, player) {
    let json = {
        index: -1,
        levelName: "Custom Level",
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