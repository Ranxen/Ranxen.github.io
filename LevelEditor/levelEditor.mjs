import * as levelLoader from "../Helper/levelLoader.mjs";
import { LeftDrawer } from "./leftDrawer.mjs";
import { LocalLevels } from "../UI/HtmlDialogs/LocalLevels.mjs";
import { Level } from "../Game/Level.mjs";
import { Player } from "../Game/Player.mjs";
import { Obstacle } from "../Game/Obstacle.mjs";
import { MovingObstacle } from "../Game/MovingObstacle.mjs";
import { MovingObstaclePath } from "./MovingObstaclePath.mjs";
import { ColorOrb } from "../Game/ColorOrb.mjs";
import { Spike } from "../Game/Spike.mjs";
import { Finish } from "../Game/Finish.mjs";
import { Key } from "../Game/Key.mjs";
import { EditorControls } from "./EditorControls.mjs";
import { Inspector } from "./Inspector.mjs";
import { ColorPalette } from "./ColorPalette.mjs";
import { EditorGameManager } from "./EditorGameManager.mjs";
import { ParentChildRelation } from "./ParentChildRelation.mjs";
import { TimedColorOrb } from "../Game/TimedColorOrb.mjs";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


let levelEditor;
let gameManager;
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

    leftDrawer = new LeftDrawer(document, localLevels, editorControls, levelEditor.createActions(), { copyEncoded: () => levelEditor.copyEncodedLevel(), loadEncodedLevel: (encodedLevel) => levelEditor.loadLevelFromBase64(encodedLevel), toggleGrid: () => levelEditor.toggleGrid(), showGrid: () => levelEditor.showGrid(), changeGridSize: (value) => levelEditor.changeGridSize(value), saveLevel : () => levelEditor.saveLevel(), uploadLevel : (json) => levelEditor.uploadLevel(json), saveToBrowserCache : () => levelEditor.saveToBrowserCache(), changeLevelName : (name) => levelEditor.changeLevelName(name) });
    parentContainer.appendChild(leftDrawer.createElement());

    inspector = new Inspector(document, () => levelEditor.getUsedColors(), () => levelEditor.selectParent());
    parentContainer.appendChild(inspector.createElement());
    inspector.hide();

    colorPalette = new ColorPalette(document, levelEditor.colors, (color) => levelEditor.selectColor(color));
    parentContainer.appendChild(colorPalette.createElement());
}


function setup() {
    levelEditor = new LevelEditor(ctx);
    gameManager = new EditorGameManager();
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
    gridShown = true;
    selectingParent = false;


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


    changeGridSize(value) {
        this.gridSize = parseInt(value);
    }


    createPlayer() {
        if (this.player) {
            gameManager.removeEntity(this.player);
        }

        this.player = new Player(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated}, { width: 50, height: 50 }, this.currentColor);
        gameManager.addEntity(this.player);
        this.selectObject(this.player);
    }


    createObstacle() {
        let obstacle = new Obstacle(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated }, { width: 200, height: 25 }, this.currentColor);
        this.level.entities.push(obstacle);
        gameManager.addEntity(obstacle);
        this.selectObject(obstacle);
    }


    createMovingObstacle() {
        let movingObstacle = new MovingObstacle(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated }, { width: 200, height: 25 }, this.currentColor, 0, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated }, 1);
        this.level.entities.push(movingObstacle);
        gameManager.addEntity(movingObstacle);
        gameManager.addEntity(new MovingObstaclePath(this.ctx, movingObstacle));
        this.selectObject(movingObstacle);
    }


    createColorOrb() {
        let colorOrb = new ColorOrb(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated }, { width: 25, height: 25 }, this.currentColor);
        this.level.entities.push(colorOrb);
        gameManager.addEntity(colorOrb);
        this.selectObject(colorOrb);
    }


    createTimedColorOrb() {
        let colorOrb = new TimedColorOrb(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated }, { width: 25, height: 25 }, this.currentColor, 60);
        this.level.entities.push(colorOrb);
        gameManager.addEntity(colorOrb);
        this.selectObject(colorOrb);
    }


    createSpike() {
        let spike = new Spike(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated }, { width: 25, height: 25 }, 0, this.currentColor);
        this.level.entities.push(spike);
        gameManager.addEntity(spike);
        this.selectObject(spike);
    }


    createFinish() {
        if (this.level.finish) {
            if (this.level.finish.parent) {
                this.level.finish.parent.removeChild(this.level.finish);
            }

            gameManager.removeEntity(this.level.finish);
        }

        this.level.finish = new Finish(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated}, { width: 50, height: 100});
        gameManager.addEntity(this.level.finish);
        this.selectObject(this.level.finish);
    }


    createKey() {
        if (this.level.key) {
            if (this.level.key.parent) {
                this.level.key.parent.removeChild(this.level.key);
            }

            gameManager.removeEntity(this.level.key);
        }

        this.level.key = new Key(this.ctx, { x: this.mouseXInGridTranslated, y: this.mouseYInGridTranslated});
        gameManager.addEntity(this.level.key);
        this.selectObject(this.level.key);
    }


    selectObject(object) {
        this.currentObject = object;
        inspector.setObject(object);
    }


    getUsedColors() {
        let usedColors = [];
        for (let entity of gameManager.entities) {
            if (entity.color && !(entity instanceof Key)) {
                usedColors.push(entity.color);
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


    selectParent() {
        if (inspector.object && !(inspector.object instanceof Player)) {
            if (inspector.object.parent) {
                gameManager.removeParentChildRelation(inspector.object);
                inspector.object.parent.removeChild(inspector.object);
                inspector.object.parent = null;
                this.level.entities.push(inspector.object);
                gameManager.addEntity(inspector.object);
            }
            else {
                this.selectingParent = true;
            }
        }
    }


    createActions() {
        return [{ "name": "Player", "action": () => this.createPlayer() }, { "name": "Obstacle", "action": () => this.createObstacle() }, { "name": "Moving Obstacle", "action": () => this.createMovingObstacle() }, { "name": "Color Orb", "action": () => this.createColorOrb() }, { "name": "Timed Color Orb", "action": () => this.createTimedColorOrb() }, { "name" : "Spike", "action" : () => this.createSpike()}, { "name" : "Finish", "action" : () => this.createFinish()}, { "name" : "Key", "action" : () => this.createKey()}];
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

            this.currentObject.setPosition(this.mouseXInGridTranslated, this.mouseYInGridTranslated);

            if (this.currentObject instanceof MovingObstaclePath) {
                inspector.setObject(this.currentObject.movingObstacle);
            }
            else {
                inspector.setObject(this.currentObject);
            }
        }

        this.mouseX = x;
        this.mouseY = y;
    }


    mouseClicked(button, x, y) {
        if (!this.activeMouseButtons.includes(button)) {
            this.activeMouseButtons.push(button);
        }

        if (button === 0 && !this.currentObject && !this.selectingParent) {
            let result = this.detectClickOnObject(x, y);

            if (result) {
                this.currentObject = result;
                if (this.currentObject instanceof MovingObstaclePath) {
                    inspector.setObject(this.currentObject.movingObstacle);
                }
                else {
                    inspector.setObject(result);
                }
            }
            else {
                inspector.hide();
                inspector.object = null;
            }
        }
        else if (button === 0 && inspector.object && this.selectingParent) {
            let result = this.detectClickOnObject(x, y);
            if (result && result !== inspector.object && (result instanceof MovingObstacle || result instanceof Obstacle)) {
                result.addChild(inspector.object);
                
                this.level.entities = this.level.entities.filter(entity => entity !== inspector.object);
                
                gameManager.removeEntityFromRender(inspector.object, true);
                gameManager.addEntity(new ParentChildRelation(this.ctx, result, inspector.object));
            }

            this.selectingParent = false;
        }
    }


    detectClickOnObject(x, y) {
        x -= this.camera.x;
        y -= this.camera.y;

        return gameManager.detectClick(x, y);
    }

    
    mouseReleased(button) {
        this.activeMouseButtons.splice(this.activeMouseButtons.indexOf(button), 1);

        if (button === 0) {
            if (this.keysPressed.includes("ShiftLeft")) {
                if (this.currentObject) {
                    let newEntity = this.copyEntity(this.currentObject);

                    if (this.currentObject.parent) {
                        this.currentObject.parent.addChild(newEntity);
                        gameManager.addEntity(new ParentChildRelation(this.ctx, this.currentObject.parent, newEntity));
                    }
                    else {
                        this.level.entities.push(newEntity);
                        gameManager.addEntity(newEntity);
                    }
                }
            }
            else {
                this.currentObject = null;
            }
        }
    }


    copyEntity(entity) {
        let newEntity = null;
        if (entity instanceof MovingObstacle) {
            newEntity = new MovingObstacle(this.ctx, { x: entity.pos.x, y: entity.pos.y }, { width: entity.size.width, height: entity.size.height }, entity.color, entity.startAt, entity.targetPos, entity.speed);
        }
        else if (entity instanceof Obstacle) {
            newEntity = new Obstacle(this.ctx, { x: entity.pos.x, y: entity.pos.y }, { width: entity.size.width, height: entity.size.height }, entity.color);
        }
        else if (entity instanceof TimedColorOrb) {
            newEntity = new TimedColorOrb(this.ctx, { x: entity.pos.x, y: entity.pos.y }, entity.size, entity.color, entity.timeout);
        }
        else if (entity instanceof ColorOrb) {
            newEntity = new ColorOrb(this.ctx, { x: entity.pos.x, y: entity.pos.y }, entity.size, entity.color);
        }
        else if (entity instanceof Spike) {
            newEntity = new Spike(this.ctx, { x: entity.pos.x, y: entity.pos.y }, { width: entity.size.width, height: entity.size.height }, entity.rotation, entity.color);
            newEntity.rotation = entity.rotation;
        }

        if (newEntity) {
            entity.children.forEach(child => {
                newEntity.addChild(this.copyEntity(child));
            });
        }

        return newEntity;
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

        if (object instanceof MovingObstaclePath) {
            object = object.movingObstacle;
        }

        if (object.parent) {
            object.parent.removeChild(object);
        }

        gameManager.removeEntity(object);

        if (object instanceof Player) {
            this.player = null;
        }
        else if (object instanceof Finish) {
            this.level.finish = null;
        }
        else if (object instanceof Key) {
            this.level.key = null;
        }
        else {
            this.level.entities = this.level.entities.filter(entity => entity !== object);
        }
    }


    increaseCurrentObjectWidth() {
        if (this.currentObject) {
            let changeBy = this.gridSize - (this.currentObject.size.width % this.gridSize);
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
            let changeBy = this.currentObject.size.width % this.gridSize;
            if (changeBy === 0) {
                changeBy = this.gridSize;
            }
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
            let changeBy = this.gridSize - (this.currentObject.size.height % this.gridSize);
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
            let changeBy = this.currentObject.size.height % this.gridSize;
            if (changeBy === 0) {
                changeBy = this.gridSize;
            }
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
        return this.level.entities.length > 0 && this.level.finish && this.level.key && this.player;
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
            this.setLevel(level);
        });
    }


    loadLevelFromJSON(json) {
        inspector.hide();
        this.colors = [];
        this.originalColors = [];

        this.setLevel(levelLoader.jsonToLevel(json, this.ctx));
    }


    encodeLevelToBase64() {
        let encodedLevel = btoa(levelLoader.levelToJSON(this.level, this.player));

        return encodedLevel;
    }


    loadLevelFromBase64(encodedLevel) {
        inspector.hide();
        this.colors = [];
        this.originalColors = [];

        this.setLevel(levelLoader.loadLevel(ctx, encodedLevel));
    }

    setLevel(level) {
        this.level = level;
        this.player = new Player(this.ctx, this.level.startPos, { width: 50, height: 50 }, this.level.startColor);
        leftDrawer.setLevelName(this.level.levelName);
        gameManager.buildEntities(this.level, this.player);
        this.getUsedColors();
    }


    draw() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.translate(this.camera.x, this.camera.y);

        if (this.gridShown) {
            this.drawGrid();
        }

        gameManager.draw();

        this.ctx.resetTransform();
    }


    drawGrid() {
        this.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width - this.camera.x; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = i % (this.gridSize * 5) === 0 ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.5)";
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, canvas.height - this.camera.y);
            this.ctx.stroke();
        }

        for (let i = 0; i < canvas.height - this.camera.y; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = i % (this.gridSize * 5) === 0 ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.5)";
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(canvas.width - this.camera.x, i);
            this.ctx.stroke();
        }
    }

}