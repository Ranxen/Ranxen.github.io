import { Player } from "./Game/Player.mjs";
import { Button } from "./UI/Canvas/Button.mjs";
import { JumpButton } from "./UI/Canvas/JumpButton.mjs";
import { ColorWheel } from "./UI/Canvas/ColorWheel.mjs";
import { Level } from "./Game/Level.mjs";
import { LevelSelection } from "./UI/HtmlDialogs/LevelSelection.mjs";
import { LevelDoneDialog } from "./UI/HtmlDialogs/LevelDoneDialog.mjs";
import { SettingsDialog } from "./UI/HtmlDialogs/SettingsDialog.mjs";
import { ControlsDialog } from "./UI/HtmlDialogs/ControlsDialog.mjs";
import { LocalLevels } from "./UI/HtmlDialogs/LocalLevels.mjs";
import { Timer } from "./UI/Canvas/Timer.mjs";
import * as drawLib from "./Helper/drawLib.mjs";
import * as levelLoader from "./Helper/levelLoader.mjs";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var settingsDialog = null;
var controlsDialog = null;
var levelSelection = null;
var levelDoneDialog = null;
var localLevels = null;


var level = null;
var levelData = null;
var player = null;

var buttons = [];
var restartButton = null;
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
var running = false;
var isMobile = true;
var levelCode = null;

var buttonColor = '#414e5c';


async function loadAvailableLevels() {
    await fetch("/levels/availableLevels.json")
        .then(response => response.json())
        .catch(error => {
            
        })
        .then(json => {
            levelSelection.setAvailableLevels(json.availableLevels);
            localLevels.setStartIndex(json.availableLevels.length);
        }).catch(error => {
            
        });
}


async function loadLevel(index) {
    if (loadingLevel || index < 0) {
        return;
    }

    stopGame();

    let currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    let path = "/levels/" + index + ".json";

    await fetch(currentPath + path)
        .then(response => response.json())
        .catch(error => {
            loadingLevel = false;
        })
        .then(json => {
            levelData = json;
            setLevel(new Level(ctx, json, { restartLevel: restartLevel }));
        }).catch(error => { 
            loadingLevel = false;
        });
}


function loadEncodedLevel(encodedLevel) {
    stopGame();

    levelCode = encodedLevel;
    level = levelLoader.loadLevel(ctx, encodedLevel, { restartLevel: restartLevel });
    level.isCustom = true;
    setLevel(level);
}


function loadLevelFromJSON(json) {
    level = new Level(ctx, json, { restartLevel: restartLevel });
    level.isCustom = true;
    levelData = json;
    setLevel(level);
}


function uploadLevel(file) {
    if (!file?.name.endsWith(".json")) {
        return;
    }

    stopGame();

    this.level = levelLoader.loadLevelFromFile(ctx, file, { restartLevel: restartLevel }, (level) => {
        level.isCustom = true;
        setLevel(level);
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
}


function restartLevel() {
    stopGame();
    level = levelLoader.loadLevelFromJSON(ctx, levelData, { restartLevel: restartLevel });
    setLevel(level);
}


function stopGame() {
    loadingLevel = true;
    running = false;
    timer.reset();
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
            let showSettingsButton = new Button(ctx, { x: 150, y: 25 }, { width: 50, height: 50 }, buttonColor, "⚙", () => {
                settingsDialog.show();
            });

            buttons.push(showSettingsButton);
        }

        let showLevelSelectionButton = new Button(ctx, { x: 25, y: 25 }, { width: 100, height: 50 }, buttonColor, "Levels", () => {
            levelSelection.show();
        });

        restartButton = new Button(ctx, { x: window.innerWidth - 125, y: 25 }, { width: 100, height: 50 }, buttonColor, "Restart", restartLevel);

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

    localLevels = new LocalLevels(document, (level) => loadLevelFromJSON(level));
    parentContainer.appendChild(localLevels.createElement());

    levelSelection = new LevelSelection(document, loadLevel, () => localLevels.show());
    parentContainer.appendChild(levelSelection.createElement());

    levelDoneDialog = new LevelDoneDialog(document, () => levelSelection.nextLevel(), restartLevel);
    parentContainer.appendChild(levelDoneDialog.createElement());

    if (!isMobile) {
        controlsDialog = new ControlsDialog(document);
        parentContainer.appendChild(controlsDialog.createElement());
    }

    settingsDialog = new SettingsDialog(document, controlsDialog, loadEncodedLevel, uploadLevel);
    parentContainer.appendChild(settingsDialog.createElement());
}


function dialogShown() {
    return levelSelection.visible || levelDoneDialog.visible || controlsDialog?.visible || settingsDialog.visible || localLevels.visible;
}


function hideDialogs() {
    levelSelection.hide();
    levelDoneDialog.hide();
    controlsDialog?.hide();
    settingsDialog.hide();
    localLevels.hide();
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLib.rect(ctx, 0, 0, canvas.width, canvas.height, "#123")

    updateCameraPos();

    if ((activeKeys.length > 0 || touches.length > 0) && !running) {
        startGame();
    }

    if (dialogShown()) {
        activeKeys = [];
        touches = [];
    }

    player.velocity.x = 0;

    processKeys();
    processTouchesAndClick();

    if (running) {
        computePhysics();
    }

    drawGameObjects();

    ctx.resetTransform();

    drawHUD();
    setTimeout(draw, 1000 / 60);
}


function startGame() {
    running = true;
    timer.start();
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
                restartLevel();
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


function computePhysics() {
    player.clearCollisions();

    level.detectColorOrbCollisions(player, colorWheel);
    level.detectSpikeCollisions(player);
    level.detectObstacleCollisions(player);

    level.colorOrbs = level.colorOrbs.filter(colorOrb => !colorOrb.delete);
    player.update();
    level.key.detectCollision(player);
    level.finish.detectCollision(player);

    timer.update();
}


function drawGameObjects() {
    level.drawObstacles();
    level.drawSpikes();
    level.drawColorOrbs();

    level.drawFinish();
    player.draw();
    level.drawKey(player);
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

    if (restartButton !== null) {
        restartButton.pos.x = window.innerWidth - 125;
    }

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

        if (dialogShown()) {
            if (keyEvent.code === 'KeyR') {
                hideDialogs();
                restartLevel();
            }
            else if (keyEvent.code === 'ShiftLeft') {
                hideDialogs();
                levelSelection.nextLevel();
            }
        }
    });

    window.addEventListener('mousedown', (mouseEvent) => {
        if (mouseEvent.target.id === 'overlay') {
            mouseEvent.preventDefault();
        }

        if (!dialogShown()) {
            mouseDown = true;
        }
    });

    window.addEventListener('mouseup', (mouseEvent) => {
        if (mouseEvent.target.id === 'overlay') {
            mouseEvent.preventDefault();
        }

        mouseDown = false;
    });

    window.addEventListener('mousemove', (mouseEvent) => {
        if (mouseEvent.target.id === 'overlay') {
            mouseEvent.preventDefault();
        }

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