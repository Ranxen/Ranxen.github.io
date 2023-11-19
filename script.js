import { Player } from "./Player.mjs";
import { Obstacle } from "./Obstacle.mjs";
import { Button } from "./Button.mjs";
import { JumpButton } from "./JumpButton.mjs";
import { ColorOrb } from "./ColorOrb.mjs";
import { ColorWheel } from "./ColorWheel.mjs";
import { Finish } from "./Finish.mjs";
import { Key } from "./Key.mjs";
import { Level } from "./Level.mjs";
import { LevelSelection } from "./LevelSelection.mjs";
import { LevelDoneDialog } from "./LevelDoneDialog.mjs";
import { ControlsDialog } from "./ControlsDialog.mjs";
import { Timer } from "./Timer.mjs";
import * as drawLib from "./drawLib.mjs";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var controlsDialog = null
var levelSelection = null;
var levelDoneDialog = null;


var level = null;
var player = null;

var buttons = [];
var colorWheel = null;
var leftButton = null;
var rightButton = null;
var jumpButton = null;
var timer = null;

var mouseDown = false;
var mouseX = 0;
var mouseY = 0;

var touches = [];
var activeKeys = [];

var cameraPos = { x: 0, y: 0 };
var loadingLevel = false;
var isMobile = true;

var buttonColor = '#414e5c';


async function loadAvailableLevels() {
    await fetch("/levels/availableLevels.json")
        .then(response => response.json())
        .catch(error => {
            
        })
        .then(json => {
            levelSelection.setAvailableLevels(json.availableLevels);
        }).catch(error => {
            
        });
}


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
    levelSelection.setCurrentLevel(level.index);
    levelDoneDialog.nextLevelButton.disabled = !levelSelection.hasNextLevel();
    level.finish.onFinish = () => {
        timer.saveTime(level.index);
        levelDoneDialog.drawLevelTimes(timer.times);
        levelDoneDialog.show();
    };
    player = new Player(ctx, level.startPos, 50, level.startColor);
    colorWheel = new ColorWheel(ctx, { x: window.innerWidth - 150, y: window.innerHeight }, 150, player);
    loadingLevel = false;
    timer.start();
}


function setup() {
    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && !/Windows/i.test(navigator.userAgent));

    drawHtml();

    loadAvailableLevels().then(() => {
        if (isMobile) {
            addTouchEventListener();
        } else {
            addKeyEventListener();
        }

        if (isMobile) {
            leftButton = new Button(ctx, { x: 50, y: window.innerHeight - 100 }, { width: 100, height: 50 }, buttonColor, "<", () => {
                player.moveLeft();
            });

            rightButton = new Button(ctx, { x: 175, y: window.innerHeight - 100 }, { width: 100, height: 50 }, buttonColor, ">", () => {
                player.moveRight();
            });

            buttons.push(leftButton);
            buttons.push(rightButton);
        } else {
            let showControlsButton = new Button(ctx, { x: 150, y: 25 }, { width: 50, height: 50 }, buttonColor, "?", () => {
                controlsDialog.show();
            });

            buttons.push(showControlsButton);
        }

        let showLevelSelectionButton = new Button(ctx, { x: 25, y: 25 }, { width: 100, height: 50 }, buttonColor, "Levels", () => {
            levelSelection.show();
        });

        let restartButton = new Button(ctx, { x: window.innerWidth - 125, y: 25 }, { width: 100, height: 50 }, buttonColor, "Restart", () => {
            loadLevel(level.index);
        });

        jumpButton = new JumpButton(ctx, { x: window.innerWidth - 150, y: window.innerHeight }, 100, "#111", () => {
            if (isMobile) {
                player.jump();
            }
        });

        buttons.push(showLevelSelectionButton);
        buttons.push(restartButton);
        buttons.push(jumpButton);

        timer = new Timer(ctx, { x: 25, y: 100 }, { width: 100, height: 50 }, buttonColor, isMobile);

        loadLevel(0).then(() => {
            draw();
        });
    });
}


function drawHtml() {
    let parentContainer = document.getElementById("overlay");

    levelSelection = new LevelSelection(document, loadLevel);
    parentContainer.appendChild(levelSelection.createElement());

    levelDoneDialog = new LevelDoneDialog(document, () => levelSelection.nextLevel(), () => loadLevel(level.index));
    parentContainer.appendChild(levelDoneDialog.createElement());

    if (!isMobile) {
        controlsDialog = new ControlsDialog(document);
        parentContainer.appendChild(controlsDialog.createElement());
    }
}


function dialogShown() {
    return levelSelection.visible || levelDoneDialog.visible || controlsDialog?.visible;
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLib.rect(ctx, 0, 0, canvas.width, canvas.height, "#123")

    updateCameraPos();

    if (dialogShown()) {
        activeKeys = [];
        touches = [];
    }

    player.velocity.x = 0;

    processKeys();
    processTouchesAndClick();

    handleCollisions();

    drawGameObjects();

    ctx.resetTransform();

    drawHUD();
    setTimeout(draw, 1000 / 60);
}


function updateCameraPos() {
    cameraPos.x = player.pos.x - window.innerWidth / 2;
    cameraPos.y = player.pos.y - window.innerHeight / 2;

    ctx.translate(-cameraPos.x, -cameraPos.y);
}


function processKeys() {
    for (let key of activeKeys) {
        switch (key) {
            case 'KeyA':
                player.moveLeft();
                break;
            case 'KeyD':
                player.moveRight();
                break;
            case 'KeyQ':
            case 'ArrowLeft':
                colorWheel.previousColor();
                activeKeys = activeKeys.filter(key => key !== 'KeyQ' && key !== 'ArrowLeft');
                break;
            case 'KeyE':
            case 'ArrowRight':
                colorWheel.nextColor();
                activeKeys = activeKeys.filter(key => key !== 'KeyE' && key !== 'ArrowRight');
                break;
            case 'KeyR':
                loadLevel(level.index);
                break;
            case 'Space':
                player.jump();
                break;
        }
    }
}


function processTouchesAndClick() {
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
        else {
            colorWheel.isDragging = false;
            colorWheel.touchIdentifier = null;
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


function handleCollisions() {
    player.clearCollisions();

    for (let colorOrb of level.colorOrbs) {
        colorOrb.detectCollision(player, colorWheel);
    }

    for (let obstacle of level.obstacles) {
        player.detectCollision(obstacle);
    }

    level.colorOrbs = level.colorOrbs.filter(colorOrb => !colorOrb.delete);
    player.update();
    level.key.detectCollision(player);
    level.finish.detectCollision(player);

    timer.update();
}


function drawGameObjects() {
    for (let obstacle of level.obstacles) {
        obstacle.draw();
    }

    for (let colorOrb of level.colorOrbs) {
        colorOrb.draw();
    }

    level.finish.draw();
    player.draw();
    level.key.draw(player);
}


function drawHUD() {
    colorWheel.draw();

    for (let button of buttons) {
        button.draw();
    }

    timer.draw();
}


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (leftButton !== null) {
        leftButton.pos.y = window.innerHeight - 100;
        rightButton.pos.y = window.innerHeight - 100;
    }

    if (jumpButton !== null) {
        jumpButton.pos.x = window.innerWidth - 150;
        jumpButton.pos.y = window.innerHeight;
    }

    if (colorWheel !== null) {
        colorWheel.pos.x = window.innerWidth - 150;
        colorWheel.pos.y = window.innerHeight;
    }
}


function addTouchEventListener() {
    window.addEventListener('touchstart', (touchEvent) => {
        if (touchEvent.target.id === 'overlay') {
            touchEvent.preventDefault();

            if (!dialogShown()) {
                for (let touch of touchEvent.changedTouches) {
                    touches.push(touch);
                }
            }
        }
    }, { passive: false });

    window.addEventListener('touchmove', (touchEvent) => {
        if (touchEvent.target.id === 'overlay') {
            touchEvent.preventDefault();

            for (let touch of touchEvent.changedTouches) {
                if (touches.some(t => t.identifier === touch.identifier)) {
                    touches = touches.filter(t => t.identifier !== touch.identifier);
                    touches.push(touch);
                }
            }
        }
    }, { passive: false });

    window.addEventListener('touchend', (touchEvent) => {
        if (touchEvent.target.id === 'overlay') {
            touchEvent.preventDefault();

            for (let touch of touchEvent.changedTouches) {
                touches = touches.filter(t => t.identifier !== touch.identifier);
            }
        }
    }, { passive: false });
}


function addKeyEventListener() {
    window.addEventListener('keydown', (keyEvent) => {
        if (!dialogShown()) {
            activeKeys.push(keyEvent.code);
        }
    });

    window.addEventListener('keyup', (keyEvent) => {
        keyEvent.preventDefault();

        activeKeys = activeKeys.filter(key => key !== keyEvent.code);
    });

    window.addEventListener('mousedown', (mouseEvent) => {
        mouseEvent.preventDefault();

        if (!dialogShown()) {
            mouseDown = true;
        }
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

    window.addEventListener('wheel', (scrollEvent) => {
        if (scrollEvent.target.id === 'overlay') {
            scrollEvent.preventDefault();

            if (!dialogShown()) {
                if (scrollEvent.deltaY < 0) {
                    colorWheel.previousColor();
                }
                else {
                    colorWheel.nextColor();
                }
            }
        }
    }, { passive: false });
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

window.addEventListener('orientationchange', resizeCanvas);

window.onload = setup;