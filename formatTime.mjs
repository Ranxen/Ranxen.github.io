export function formatTime(time) {
    let minutes = Math.floor(time / 60000);
    let seconds = Math.floor((time - minutes * 60000) / 1000);
    let milliseconds = Math.floor((time - minutes * 60000 - seconds * 1000) / 10);

    return `${minutes}:${seconds}:${milliseconds}`;
}