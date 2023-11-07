import { Player } from "./Player.mjs";
import { Obstacle } from "./Obstacle.mjs";
import { Button } from "./Button.mjs";
import { JumpButton } from "./JumpButton.mjs";
import { ColorOrb } from "./ColorOrb.mjs";
import { ColorWheel } from "./ColorWheel.mjs";
import { Finish } from "./Finish.mjs";
import { Key } from "./Key.mjs";
import { Level } from "./Level.mjs";
import * as drawLib from "./drawLib.mjs";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


var level = null;
var player = null;

var buttons = [];
var colorWheel;

var touches = [];
var activeKeys = [];

var cameraPos = { x: 0, y: 0 };


async function loadLevel(index) {
    let currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    let path = "/levels/" + index + ".json";

    await fetch(currentPath + path)
        .then(response => response.json())
        .then(json => {
            setLevel(new Level(json.index, json.startPos, json.startColor, new Key(ctx, json.keyPos), new Finish(ctx, json.finish.pos, json.finish.size), json.colorOrbs.map(colorOrb => new ColorOrb(ctx, colorOrb.pos, colorOrb.size, colorOrb.color)), json.obstacles.map(obstacle => new Obstacle(ctx, obstacle.pos, obstacle.size, obstacle.color))));
        });
}


function setLevel(newLevel) {
    level = newLevel;
    level.finish.onFinish = () => {
        loadLevel(level.index + 1);
    };
    player = new Player(ctx, level.startPos, 50, level.startColor);
    colorWheel = new ColorWheel(ctx, { x: window.innerWidth - 150, y: window.innerHeight }, 150, player);
}


function setup() {
    loadLevel(0).then(() => {
        let leftButton = new Button(ctx, { x: 50, y: window.innerHeight - 100 }, { width: 100, height: 50 }, "rgba(255, 255, 255, 0.2)", "<", () => {
            player.moveLeft();
        });

        let rightButton = new Button(ctx, { x: 175, y: window.innerHeight - 100 }, { width: 100, height: 50 }, "rgba(255, 255, 255, 0.2)", ">", () => {
            player.moveRight();
        });

        let jumpButton = new JumpButton(ctx, { x: window.innerWidth - 150, y: window.innerHeight }, 100, "#111", "jump", () => {
            player.jump();
        });

        let retryButton = new Button(ctx, { x: window.innerWidth - 125, y: 25 }, { width: 100, height: 50 }, "rgba(255, 255, 255, 0.2)", "retry", () => {
            loadLevel(level.index);
        });

        buttons.push(leftButton);
        buttons.push(rightButton);
        buttons.push(jumpButton);
        buttons.push(retryButton);

        draw();
    });
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLib.rect(ctx, 0, 0, canvas.width, canvas.height, "#123")

    cameraPos.x = player.pos.x - window.innerWidth / 2;
    cameraPos.y = player.pos.y - window.innerHeight / 2;

    ctx.translate(-cameraPos.x, -cameraPos.y);

    player.velocity.x = 0;

    for (let key of activeKeys) {
        switch (key) {
            case 'a':
                player.moveLeft();
                break;
            case 'd':
                player.moveRight();
                break;
            case 'q':
                colorWheel.previousColor();
                activeKeys = activeKeys.filter(key => key !== 'q');
                break;
            case 'e':
                colorWheel.nextColor();
                activeKeys = activeKeys.filter(key => key !== 'e');
                break;
            case ' ':
                player.jump();
                break;
        }
    }

    colorWheel.isDragging = false;

    for (let touch of touches) {
        let touchUsed = false;
        for (let button of buttons) {
            if (button.isClicked(touch.clientX, touch.clientY)) {
                touchUsed = true;
                break;
            }
        }

        if (!touchUsed) {
            colorWheel.isMoved(touch.clientX, touch.clientY);
        }
    }

    player.clearCollisions();

    for (let obstacle of level.obstacles) {
        player.detectCollision(obstacle);
        obstacle.draw();
    }

    for (let colorOrb of level.colorOrbs) {
        colorOrb.detectCollision(player, colorWheel);
        colorOrb.draw();
    }

    level.colorOrbs = level.colorOrbs.filter(colorOrb => !colorOrb.delete);

    level.finish.draw();

    player.update();
    player.draw();
    level.key.draw(player);

    level.key.detectCollision(player);
    level.finish.detectCollision(player);

    ctx.resetTransform();

    colorWheel.draw();

    for (let button of buttons) {
        button.draw();
    }

    // window.requestAnimationFrame(draw);
    setTimeout(draw, 1000 / 60);
}


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

window.onload = setup;

window.addEventListener('touchstart', (touchEvent) => {
    touchEvent.preventDefault();

    for (let touch of touchEvent.changedTouches) {
        touches.push(touch);
    }
}, { passive: false });

window.addEventListener('touchmove', (touchEvent) => {
    touchEvent.preventDefault();

    for (let touch of touchEvent.changedTouches) {
        touches.push(touch);
    }
}, { passive: false });

window.addEventListener('touchend', (touchEvent) => {
    touchEvent.preventDefault();

    for (let touch of touchEvent.changedTouches) {
        touches = touches.filter(t => t.identifier !== touch.identifier);
    }
}, { passive: false });

window.addEventListener('keydown', (keyEvent) => {
    activeKeys.push(keyEvent.key);
});

window.addEventListener('keyup', (keyEvent) => {
    keyEvent.preventDefault();

    activeKeys = activeKeys.filter(key => key !== keyEvent.key);
});

window.addEventListener('mousedown', (mouseEvent) => {
    mouseEvent.preventDefault();

    for (let button of buttons) {
        button.isClicked(mouseEvent.clientX, mouseEvent.clientY);
    }

    colorWheel.isMoved(mouseEvent.clientX, mouseEvent.clientY);
});