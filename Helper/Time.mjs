let lastTime = 0;
let delta = 0

export class Time {
    static get deltaTime() {
        return delta;
    };

    static updateDelta(time) {
        delta = (time - lastTime) / 1000;
        delta = Math.min(delta, 0.1); //avoids issues with long lags
        lastTime = time;
    }
}