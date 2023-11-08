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

var mouseDown = false;
var mouseX = 0;
var mouseY = 0;

var touches = [];
var activeKeys = [];

var cameraPos = { x: 0, y: 0 };
var loadingLevel = false;
var isMobile = true;

var buttonColor = '#414e5c';


async function loadLevel(index) {
    if (loadingLevel) {
        return;
    }

    loadingLevel = true;
    let currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    let path = "/levels/" + index + ".json";

    await fetch(currentPath + path)
        .then(response => response.json())
        .catch(error => {
            loadingLevel = false;
        })
        .then(json => {
            setLevel(new Level(json.index, json.startPos, json.startColor, new Key(ctx, json.keyPos), new Finish(ctx, json.finish.pos, json.finish.size), json.colorOrbs.map(colorOrb => new ColorOrb(ctx, colorOrb.pos, colorOrb.size, colorOrb.color)), json.obstacles.map(obstacle => new Obstacle(ctx, obstacle.pos, obstacle.size, obstacle.color))));
        }).catch(error => { 
            loadingLevel = false;
        });
}


function setLevel(newLevel) {
    level = newLevel;
    level.finish.onFinish = () => {
        loadLevel(level.index + 1);
    };
    player = new Player(ctx, level.startPos, 50, level.startColor);
    colorWheel = new ColorWheel(ctx, { x: window.innerWidth - 150, y: window.innerHeight }, 150, player);
    loadingLevel = false;
}


function setup() {
    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        addTouchEventListener();
    } else {
        addKeyEventListener();
    }

    loadLevel(0).then(() => {
        if (isMobile) {
            let leftButton = new Button(ctx, { x: 50, y: window.innerHeight - 100 }, { width: 100, height: 50 }, buttonColor, "<", () => {
                player.moveLeft();
            });

            let rightButton = new Button(ctx, { x: 175, y: window.innerHeight - 100 }, { width: 100, height: 50 }, buttonColor, ">", () => {
                player.moveRight();
            });

            buttons.push(leftButton);
            buttons.push(rightButton);
        }

        let restartButton = new Button(ctx, { x: window.innerWidth - 125, y: 25 }, { width: 100, height: 50 }, buttonColor, "Restart", () => {
            loadLevel(level.index);
        });

        let jumpButton = new JumpButton(ctx, { x: window.innerWidth - 150, y: window.innerHeight }, 100, "#111", () => {
            if (isMobile) {
                player.jump();
            }
        });

        buttons.push(restartButton);
        buttons.push(jumpButton);

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
            case 'ArrowLeft':
                colorWheel.previousColor();
                activeKeys = activeKeys.filter(key => key !== 'q' && key !== 'ArrowLeft');
                break;
            case 'e':
            case 'ArrowRight':
                colorWheel.nextColor();
                activeKeys = activeKeys.filter(key => key !== 'e' && key !== 'ArrowRight');
                break;
            case 'r':
                loadLevel(level.index);
                break;
            case ' ':
                player.jump();
                break;
        }
    }

    if (isMobile) {
        for (let touch of touches) {
            processTouchOrClick(touch.clientX, touch.clientY, touch.identifier);
        }

        if (touches.length > 0) {
            let touch = touches.find(touch => touch.identifier === colorWheel.touchIdentifier);

            if (touch === undefined) {
                colorWheel.isDragging = false;
                colorWheel.touchIdentifier = null;
            }
        }
    }
    else {
        if (mouseDown) {
            processTouchOrClick(mouseX, mouseY);
        }
        else {
            colorWheel.isDragging = false;
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


function processTouchOrClick(x, y, touchIdentifier = null) {
    let touchUsed = false;
    for (let button of buttons) {
        if (button.isClicked(x, y)) {
            touchUsed = true;
            break;
        }
    }

    if (!touchUsed) {
        colorWheel.isMoved(x, y, touchIdentifier);
    }
}


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();


function addTouchEventListener() {
    window.addEventListener('touchstart', (touchEvent) => {
        touchEvent.preventDefault();

        for (let touch of touchEvent.changedTouches) {
            touches.push(touch);
        }
    }, { passive: false });

    window.addEventListener('touchmove', (touchEvent) => {
        touchEvent.preventDefault();

        for (let touch of touchEvent.changedTouches) {
            if (touches.some(t => t.identifier === touch.identifier)) {
                touches = touches.filter(t => t.identifier !== touch.identifier);
                touches.push(touch);
            }
        }
    }, { passive: false });

    window.addEventListener('touchend', (touchEvent) => {
        touchEvent.preventDefault();

        for (let touch of touchEvent.changedTouches) {
            touches = touches.filter(t => t.identifier !== touch.identifier);
        }
    }, { passive: false });
}


function addKeyEventListener() {
    window.addEventListener('keydown', (keyEvent) => {
        activeKeys.push(keyEvent.key);
    });

    window.addEventListener('keyup', (keyEvent) => {
        keyEvent.preventDefault();

        activeKeys = activeKeys.filter(key => key !== keyEvent.key);
    });

    window.addEventListener('mousedown', (mouseEvent) => {
        mouseEvent.preventDefault();

        mouseDown = true;
    });

    window.addEventListener('mouseup', (mouseEvent) => {
        mouseEvent.preventDefault();

        mouseDown = false;
    });

    window.addEventListener('mousemove', (mouseEvent) => {
        mouseEvent.preventDefault();

        mouseX = mouseEvent.clientX;
        mouseY = mouseEvent.clientY;
    });
}

window.addEventListener('resize', resizeCanvas);

window.addEventListener('orientationchange', resizeCanvas);

window.onload = setup;