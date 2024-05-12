import * as drawLib from "../Helper/drawLib.mjs";
import * as levelLoader from "../Helper/levelLoader.mjs";
import { LeftDrawer } from "./leftDrawer.mjs";
import { LocalLevels } from "../UI/HtmlDialogs/LocalLevels.mjs";
import { Level } from "../Game/Level.mjs";
import { Player } from "../Game/Player.mjs";
import { Obstacle } from "../Game/Obstacle.mjs";
import { MovingObstacle } from "../Game/MovingObstacle.mjs";
import { ColorOrb } from "../Game/ColorOrb.mjs";
import { Spike } from "../Game/Spike.mjs";
import { Finish } from "../Game/Finish.mjs";
import { Key } from "../Game/Key.mjs";
import { EditorControls } from "./EditorControls.mjs";
import { Inspector } from "./Inspector.mjs";
import { ColorPalette } from "./ColorPalette.mjs";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


let levelEditor;
let leftDrawer;
let localLevels;
let editorControls;
let inspector;
let colorPalette;


function drawHtml() {
    let parentContainer = document.getElementById("overlay");

    localLevels = new LocalLevels(document, (level) => levelEditor.loadLevelFromJSON(level));
    parentContainer.appendChild(localLevels.createElement());

    editorControls = new EditorControls(document);
    parentContainer.appendChild(editorControls.createElement());

    leftDrawer = new LeftDrawer(document, localLevels, editorControls, levelEditor.createActions(), { copyEncoded : () => levelEditor.copyEncodedLevel(), loadEncodedLevel : (encodedLevel) => levelEditor.loadLevelFromBase64(encodedLevel), toggleGrid : () => levelEditor.toggleGrid(), showGrid : () => levelEditor.showGrid(), saveLevel : () => levelEditor.saveLevel(), uploadLevel : (json) => levelEditor.uploadLevel(json), saveToBrowserCache : () => levelEditor.saveToBrowserCache(), changeLevelName : (name) => levelEditor.changeLevelName(name) });
    parentContainer.appendChild(leftDrawer.createElement());

    inspector = new Inspector(document, () => levelEditor.getUsedColors());
    parentContainer.appendChild(inspector.createElement());
    inspector.hide();

    colorPalette = new ColorPalette(document, levelEditor.colors, (color) => levelEditor.selectColor(color));
    parentContainer.appendChild(colorPalette.createElement());
}


function setup() {
    levelEditor = new LevelEditor(ctx);
    addEventListener();

    drawHtml();

    draw();
}


function draw() {
    levelEditor.draw();
    
    setTimeout(draw, 1000 / 60);
}


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


function addEventListener() {
    window.addEventListener("mousemove", (event) => {
        if (event.target.id === "overlay") {
            event.preventDefault();
            levelEditor.mouseMoved(event.clientX, event.clientY);
        }
    });

    window.addEventListener("mousedown", (event) => {
        if (event.target.id === "overlay") {
            event.preventDefault();
            levelEditor.mouseClicked(event.button, event.clientX, event.clientY);
        }
    });

    window.addEventListener("mouseup", (event) => {
        if (event.target.id === "overlay") {
            event.preventDefault();
            levelEditor.mouseReleased(event.button);
        }
    });

    window.addEventListener("keydown", (event) => {
        if (levelEditor.usesKey(event.code) && event.target.id === "overlay") {
            event.preventDefault();
        }

        levelEditor.keyPressed(event.code);
    })

    window.addEventListener("keyup", (event) => {
        if (levelEditor.usesKey(event.code) && event.target.id === "overlay") {
            event.preventDefault();
        }

        levelEditor.keyReleased(event.code);
    })

    window.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
}


resizeCanvas();

window.addEventListener('resize', resizeCanvas);

window.addEventListener('orientationchange', resizeCanvas);

window.onload = setup;


export class LevelEditor {


    originalColors = ["red", "green", "blue", "yellow", "purple", "orange", "pink"];
    colors = ["red", "green", "blue", "yellow", "purple", "orange", "pink"];

    currentObject = null;
    camera = { x: 0, y: 0, zoom: 1 };

    keysPressed = [];
    keyMap = { "KeyR" : () => this.rotate(), "KeyC" : () => this.changeColor(), "KeyX" : () => this.deleteCurrentObject(), "KeyA" : () => this.decreaseCurrentObjectWidth(), "KeyD" : () => this.increaseCurrentObjectWidth(), "KeyS" : () => this.increaseCurrentObjectHeight(), "KeyW" : () => this.decreaseCurrentObjectHeight(), "KeyG" : () => this.toggleGrid() }
    otherKeys = ["ShiftLeft"];


    activeMouseButtons = [];
    mouseX = 0;
    mouseY = 0;
    mouseXInGridTranslated = 0;
    mouseYInGridTranslated = 0;
    gridSize = 25;
    gridEnabled = true;
    gridShown = false;


    constructor(ctx) {
        this.ctx = ctx;
        this.level = new Level(ctx);
        this.player = null;
        this.currentColor = this.colors[0];
    }


    toggleGrid() {
        this.gridEnabled = !this.gridEnabled;
        leftDrawer.toggleGrid(this.gridEnabled);
    }


    showGrid() {
        this.gridShown = !this.gridShown;
        leftDrawer.showGrid(this.gridShown);
    }


    createPlayer() {
        this.player = new Player(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated}, 50, this.currentColor);
        this.selectObject(this.player);
    }


    createObstacle() {
        this.level.obstacles.push(new Obstacle(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated }, { width: 200, height: 25 }, this.currentColor));
        this.selectObject(this.level.obstacles[this.level.obstacles.length - 1]);
    }


    createMovingObstacle() {
        this.level.movingObstacles.push(new MovingObstacle(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated }, { width: 200, height: 25 }, this.currentColor, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated }, 1));
        this.selectObject(this.level.movingObstacles[this.level.movingObstacles.length - 1]);
    }


    createColorOrb() {
        this.level.colorOrbs.push(new ColorOrb(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated }, 25, this.currentColor));
        this.selectObject(this.level.colorOrbs[this.level.colorOrbs.length - 1]);
    }


    createSpike() {
        this.level.spikes.push(new Spike(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated }, { width: 25, height: 25 }, 0, this.currentColor));
        this.selectObject(this.level.spikes[this.level.spikes.length - 1]);
    }


    createFinish() {
        this.level.finish = new Finish(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated}, { width: 50, height: 100});
        this.selectObject(this.level.finish);
    }


    createKey() {
        this.level.key = new Key(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated});
        this.selectObject(this.level.key);
    }


    selectObject(object) {
        this.currentObject = object;
        inspector.setObject(object);
    }


    getUsedColors() {
        let usedColors = [];
        for (let obstacle of this.level.obstacles) {
            if (!usedColors.includes(obstacle.color)) {
                usedColors.push(obstacle.color);
            }
        }

        for (let movingObstacle of this.level.movingObstacles) {
            if (!usedColors.includes(movingObstacle.color)) {
                usedColors.push(movingObstacle.color);
            }
        }

        for (let colorOrb of this.level.colorOrbs) {
            if (!usedColors.includes(colorOrb.color)) {
                usedColors.push(colorOrb.color);
            }
        }

        for (let spike of this.level.spikes) {
            if (!usedColors.includes(spike.color)) {
                usedColors.push(spike.color);
            }
        }

        if (this.player) {
            if (!usedColors.includes(this.player.color)) {
                usedColors.push(this.player.color);
            }
        }

        this.colors = [...this.originalColors];
        usedColors.forEach((color) => {
            if (!this.colors.includes(color)) {
                this.colors.push(color);
            }
        });

        colorPalette.updateColors(this.colors);
    }


    selectColor(color) {
        this.currentColor = color;
        if (this.currentObject && this.currentObject?.color && !(this.currentObject instanceof Key)) {
            this.currentObject.color = color;
            inspector.setObject(this.currentObject);
        }
        else if (inspector.object?.color && !(inspector.object instanceof Key)) {
            inspector.object.color = color;
            inspector.setObject(inspector.object);
        }
    }


    createActions() {
        return [{ "name": "Player", "action": () => this.createPlayer() }, { "name": "Obstacle", "action": () => this.createObstacle() }, { "name": "Moving Obstacle", "action": () => this.createMovingObstacle() }, { "name" : "Color Orb", "action" : () => this.createColorOrb()}, { "name" : "Spike", "action" : () => this.createSpike()}, { "name" : "Finish", "action" : () => this.createFinish()}, { "name" : "Key", "action" : () => this.createKey()}];
    }


    mouseMoved(x, y) {
        if (this.activeMouseButtons.includes(2)) {
            this.camera.x += (x - this.mouseX) / this.camera.zoom;
            this.camera.y += (y - this.mouseY) / this.camera.zoom;
        }

        if (this.currentObject) {
            if (this.gridEnabled) {
                this.mouseXInGridTranslated = Math.floor((x - this.camera.x) / this.gridSize) * this.gridSize;
                this.mouseYInGridTranslated = Math.floor((y - this.camera.y) / this.gridSize) * this.gridSize;
            }
            else {
                this.mouseXInGridTranslated = x - this.camera.x;
                this.mouseYInGridTranslated = y - this.camera.y;
            }

            this.currentObject.pos.x = this.mouseXInGridTranslated;
            this.currentObject.pos.y = this.mouseYInGridTranslated;

            inspector.setObject(this.currentObject);
        }

        this.mouseX = x;
        this.mouseY = y;
    }


    mouseClicked(button, x, y) {
        if (!this.activeMouseButtons.includes(button)) {
            this.activeMouseButtons.push(button);
        }

        if (button === 0 && !this.currentObject) {
            let result = this.detectClickOnObject(x, y);

            if (result) {
                this.currentObject = result;
                inspector.setObject(result);
            }
            else {
                inspector.hide();
                inspector.object = null;
            }
        }
    }


    detectClickOnObject(x, y) {
        x -= this.camera.x;
        y -= this.camera.y;

        for (let obstacle of this.level.obstacles) {
            if (obstacle.detectClick(x, y)) {
                return obstacle;
            }
        }

        for (let movingObstacle of this.level.movingObstacles) {
            if (movingObstacle.detectClick(x, y)) {
                return movingObstacle;
            }
        }

        for (let spike of this.level.spikes) {
            if (spike.detectClick(x, y)) {
                return spike;
            }
        }

        for (let colorOrb of this.level.colorOrbs) {
            if (colorOrb.detectClick(x, y)) {
                return colorOrb;
            }
        }

        if (this.level.finish) {
            if (this.level.finish.detectClick(x, y)) {
                return this.level.finish;
            }
        }

        if (this.level.key) {
            if (this.level.key.detectClick(x, y)) {
                return this.level.key;
            }
        }

        if (this.player) {
            if (this.player.detectClick(x, y)) {
                return this.player;
            }
        }

        return null;
    }

    
    mouseReleased(button) {
        this.activeMouseButtons.splice(this.activeMouseButtons.indexOf(button), 1);

        if (button === 0) {
            if (this.keysPressed.includes("ShiftLeft")) {
                if (this.currentObject) {
                    if (this.currentObject instanceof MovingObstacle) {
                        this.level.movingObstacles.push(new MovingObstacle(this.ctx, { x: this.currentObject.pos.x, y: this.currentObject.pos.y}, { width: this.currentObject.size.width, height: this.currentObject.size.height}, this.currentObject.color, this.currentObject.targetPos, this.currentObject.speed));
                    }
                    else if (this.currentObject instanceof Obstacle) {
                        this.level.obstacles.push(new Obstacle(this.ctx, { x: this.currentObject.pos.x, y: this.currentObject.pos.y}, { width: this.currentObject.size.width, height: this.currentObject.size.height}, this.currentObject.color));
                    }
                    else if (this.currentObject instanceof ColorOrb) {
                        this.level.colorOrbs.push(new ColorOrb(this.ctx, { x: this.currentObject.pos.x, y: this.currentObject.pos.y}, this.currentObject.size, this.currentObject.color));
                    }
                    else if (this.currentObject instanceof Spike) {
                        this.level.spikes.push(new Spike(this.ctx, { x: this.currentObject.pos.x, y: this.currentObject.pos.y}, { width: this.currentObject.size.width, height: this.currentObject.size.height}, this.currentObject.rotation, this.currentObject.color));
                        this.level.spikes[this.level.spikes.length - 1].rotation = this.currentObject.rotation;
                    }
                }
            }
            else {
                this.currentObject = null;
            }
        }
    }


    usesKey(key) {
        return this.keyMap[key] !== undefined || this.otherKeys.includes(key);
    }

    
    keyPressed(key) {
        if (!this.keysPressed.includes(key)) {
            this.keysPressed.push(key);
        }

        if (this.keyMap[key]) {
            this.keyMap[key]();
        }
    }


    keyReleased(key) {
        this.keysPressed = this.keysPressed.filter((pressedKey) => pressedKey !== key);
    }


    rotate() {
        if (this.currentObject) {
            if (this.gridEnabled) {
                this.currentObject.rotate(90);
            }
            else {
                this.currentObject.rotate(1);
            }

            inspector.setObject(this.currentObject);
        }
    }


    changeColor() {
        if (this.currentObject?.color && !(this.currentObject instanceof Key)) {
            this.currentObject.color = this.nextColor(this.currentObject.color);
        }
    }


    deleteCurrentObject() {
        if (this.currentObject) {
            this.deleteObject(this.currentObject);
            this.currentObject = null;
            inspector.hide();
            this.getUsedColors();
        }
        else {
            let result = this.detectClickOnObject(this.mouseX, this.mouseY);
            if (result) {
                this.deleteObject(result);
                this.getUsedColors();
            }
        }
    }


    deleteObject(object) {
        if (object === inspector.object) {
            inspector.hide();
        }

        if (object instanceof Player) {
            this.player = null;
        }
        else if (object instanceof MovingObstacle) {
            this.level.movingObstacles.splice(this.level.movingObstacles.indexOf(object), 1);
        }
        else if (object instanceof Obstacle) {
            this.level.obstacles.splice(this.level.obstacles.indexOf(object), 1);
        }
        else if (object instanceof ColorOrb) {
            this.level.colorOrbs.splice(this.level.colorOrbs.indexOf(object), 1);
        }
        else if (object instanceof Spike) {
            this.level.spikes.splice(this.level.spikes.indexOf(object), 1);
        }
        else if (object instanceof Finish) {
            this.level.finish = null;
        }
        else if (object instanceof Key) {
            this.level.key = null;
        }
    }


    increaseCurrentObjectWidth() {
        if (this.currentObject) {
            let changeBy = this.gridSize;
            if (!this.gridEnabled) {
                changeBy = 1;
            }

            if (this.currentObject instanceof Obstacle || this.currentObject instanceof MovingObstacle || this.currentObject instanceof Spike || this.currentObject instanceof Finish) {
                this.currentObject.size.width += changeBy;
                inspector.setObject(this.currentObject);
            }
        }
    }


    decreaseCurrentObjectWidth() {
        if (this.currentObject) {
            let changeBy = this.gridSize;
            if (!this.gridEnabled) {
                changeBy = 1;
            }

            if (this.currentObject instanceof Obstacle || this.currentObject instanceof MovingObstacle || this.currentObject instanceof Spike || this.currentObject instanceof Finish) {
                this.decreaseObjectWidth(this.currentObject, changeBy);
                inspector.setObject(this.currentObject);
            }
        }
    }


    decreaseObjectWidth(object, width) {
        if (object.size.width - width > 0) {
            object.size.width -= width;
        }
    }


    increaseCurrentObjectHeight() {
        if (this.currentObject) {
            let changeBy = this.gridSize;
            if (!this.gridEnabled) {
                changeBy = 1;
            }

            if (this.currentObject instanceof Obstacle || this.currentObject instanceof MovingObstacle || this.currentObject instanceof Spike || this.currentObject instanceof Finish) {
                this.currentObject.size.height += changeBy;
                inspector.setObject(this.currentObject);
            }
        }
    }


    decreaseCurrentObjectHeight() {
        if (this.currentObject) {
            let changeBy = this.gridSize;
            if (!this.gridEnabled) {
                changeBy = 1;
            }

            if (this.currentObject instanceof Obstacle || this.currentObject instanceof MovingObstacle || this.currentObject instanceof Spike || this.currentObject instanceof Finish) {
                this.decreaseObjectHeight(this.currentObject, changeBy);
                inspector.setObject(this.currentObject);
            }
        }
    }


    decreaseObjectHeight(object, height) {
        if (object.size.height - height > 0) {
            object.size.height -= height;
        }
    }


    nextColor(color) {
        return this.colors[(this.colors.indexOf(color) + 1) % this.colors.length];
    }


    levelIsValid() {
        return this.level.obstacles.length > 0 && this.level.finish !== null && this.level.key !== null && this.player !== null;
    }


    changeLevelName(name) {
        this.level.levelName = name;
    }


    saveLevel() {
        if (this.levelIsValid()) {
            let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(levelLoader.levelToJSON(this.level, this.player));
            let downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", this.level.levelName + ".json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    }


    saveToBrowserCache() {
        if (this.levelIsValid()) {
            let levels = localStorage.getItem("levels");
            if (levels) {
                levels = JSON.parse(levels);
            }
            else {
                levels = [];
            }

            levels.push(levelLoader.levelToJSON(this.level, this.player));
            localStorage.setItem("levels", JSON.stringify(levels));
            localLevels.updateLevels();

            return true;
        }

        return false;
    }


    copyEncodedLevel() {
        if (this.levelIsValid()) {
            navigator.clipboard.writeText(this.encodeLevelToBase64());
            return true;
        }
        else {
            return false;
        }
    }


    uploadLevel(file) {
        if (!file?.name.endsWith(".json")) {
            return;
        }

        inspector.hide();
        this.colors = [];
        this.originalColors = [];

        levelLoader.loadLevelFromFile(this.ctx, file, undefined, (level) => {
            this.level = level;
            this.player = new Player(this.ctx, this.level.startPos, 50, this.level.startColor);
            leftDrawer.setLevelName(this.level.levelName);
            this.getUsedColors();
        });
    }


    loadLevelFromJSON(json) {
        inspector.hide();
        this.colors = [];
        this.originalColors = [];

        this.level = new Level(this.ctx, json);
        this.player = new Player(this.ctx, this.level.startPos, 50, this.level.startColor);
        leftDrawer.setLevelName(this.level.levelName);
        this.getUsedColors();
    }


    encodeLevelToBase64() {
        let encodedLevel = btoa(levelLoader.levelToJSON(this.level, this.player));

        return encodedLevel;
    }


    loadLevelFromBase64(encodedLevel) {
        inspector.hide();
        this.colors = [];
        this.originalColors = [];

        this.level = levelLoader.loadLevel(ctx, encodedLevel);
        this.player = new Player(this.ctx, this.level.startPos, 50, this.level.startColor);
        leftDrawer.setLevelName(this.level.levelName);
        this.getUsedColors();
    }


    draw() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.translate(this.camera.x, this.camera.y);

        if (this.gridShown) {
            this.drawGrid();
        }

        this.level.drawObstacles();
        this.drawMovingObstaclesPaths();
        this.level.drawSpikes();
        this.level.drawColorOrbs();
        if (this.level.finish) {
            this.level.drawFinish();
        }

        if (this.player) {
            this.player.draw();
        }

        if (this.level.key) {
            if (this.player) {
                this.level.drawKey(this.player);
            }
            else {
                this.level.key.draw({ hasKey: false });
            }
        }

        this.ctx.resetTransform();
    }


    drawMovingObstaclesPaths() {
        for (let movingObstacle of this.level.movingObstacles) {
            ctx.save();
            ctx.translate(movingObstacle.size.width / 2, movingObstacle.size.height / 2);
            drawLib.circle(ctx, movingObstacle.pos.x, movingObstacle.pos.y, 5, 'grey');
            ctx.strokeStyle = 'grey';
            ctx.beginPath();
            ctx.moveTo(movingObstacle.pos.x, movingObstacle.pos.y);
            ctx.lineTo(movingObstacle.targetPos.x, movingObstacle.targetPos.y);
            ctx.stroke();
            drawLib.circle(ctx, movingObstacle.targetPos.x, movingObstacle.targetPos.y, 5, 'grey');
            ctx.restore();
        }
    }


    drawGrid() {
        this.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, canvas.height);
            this.ctx.stroke();
        }

        for (let i = 0; i < canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(canvas.width, i);
            this.ctx.stroke();
        }
    }
}