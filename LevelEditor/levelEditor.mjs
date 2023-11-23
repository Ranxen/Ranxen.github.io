import { LeftDrawer } from "./leftDrawer.mjs";
import { Player } from "../Game/Player.mjs";
import { Obstacle } from "../Game/Obstacle.mjs";
import { ColorOrb } from "../Game/ColorOrb.mjs";
import { Spike } from "../Game/Spike.mjs";
import { Finish } from "../Game/Finish.mjs";
import { Key } from "../Game/Key.mjs";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


let levelEditor;
let leftDrawer;


function drawHtml() {
    let parentContainer = document.getElementById("overlay");

    leftDrawer = new LeftDrawer(document, levelEditor.createActions(), { copyEncoded : () => levelEditor.copyEncodedLevel(), loadEncodedLevel : (encodedLevel) => levelEditor.loadLevelFromBase64(encodedLevel)});
    parentContainer.appendChild(leftDrawer.createElement());
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
            levelEditor.mouseClicked(event.clientX, event.clientY);
        }
    });

    window.addEventListener("mouseup", (event) => {
        if (event.target.id === "overlay") {
            event.preventDefault();
            levelEditor.mouseReleased();
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
            if (levelEditor.usesKey(event.code)) {
                event.preventDefault();
            }

            levelEditor.keyReleased(event.code);
        }
    })
}


resizeCanvas();

window.addEventListener('resize', resizeCanvas);

window.addEventListener('orientationchange', resizeCanvas);

window.onload = setup;


export class LevelEditor {


    colors = ["red", "green", "blue", "yellow", "purple", "orange", "pink"];

    currentObject = null;

    keysPressed = [];
    keyMap = { "KeyR" : () => this.rotate(), "KeyC" : () => this.changeColor()}


    mouseX = 0;
    mouseY = 0;
    gridSize = 25;


    constructor(ctx) {
        this.ctx = ctx;
        this.level = { player: null, obstacles: [], colorOrbs: [], spikes: [], finish: null, key: null };
    }

    createPlayer() {
        this.level.player = new Player(this.ctx, { x: this.mouseX, y: this.mouseY}, 50, "red");
        this.currentObject = this.level.player;
    }


    createObstacle() {
        this.level.obstacles.push(new Obstacle(this.ctx, { x: this.mouseX, y: this.mouseY}, { width: 200, height: 25}, "green"));
        this.currentObject = this.level.obstacles[this.level.obstacles.length - 1];
    }


    createColorOrb() {
        this.level.colorOrbs.push(new ColorOrb(this.ctx, { x: this.mouseX, y: this.mouseY}, 25, "blue"));
        this.currentObject = this.level.colorOrbs[this.level.colorOrbs.length - 1];
    }


    createSpike() {
        this.level.spikes.push(new Spike(this.ctx, { x: this.mouseX, y: this.mouseY}, { width: 25, height: 25}, 0, "yellow"));
        this.currentObject = this.level.spikes[this.level.spikes.length - 1];
    }


    createFinish() {
        this.level.finish = new Finish(this.ctx, { x: this.mouseX, y: this.mouseY}, { width: 50, height: 100});
        this.currentObject = this.level.finish;
    }


    createKey() {
        this.level.key = new Key(this.ctx, { x: this.mouseX, y: this.mouseY});
        this.currentObject = this.level.key;
    }


    createActions() {
        return [{ "name" : "Player", "action" : () => this.createPlayer()}, { "name" : "Obstacle", "action" : () => this.createObstacle()}, { "name" : "Color Orb", "action" : () => this.createColorOrb()}, { "name" : "Spike", "action" : () => this.createSpike()}, { "name" : "Finish", "action" : () => this.createFinish()}, { "name" : "Key", "action" : () => this.createKey()}];
    }


    mouseMoved(x, y) {
        this.mouseX = Math.floor(x / this.gridSize) * this.gridSize;
        this.mouseY = Math.floor(y / this.gridSize) * this.gridSize;

        if (this.currentObject) {
            this.currentObject.pos.x = this.mouseX;
            this.currentObject.pos.y = this.mouseY;
        }
    }


    mouseClicked(x, y) {
        if (!this.currentObject) {
            for (let obstacle of this.level.obstacles) {
                if (obstacle.detectClick(x, y)) {
                    this.currentObject = obstacle;
                }
            }

            for (let spike of this.level.spikes) {
                if (spike.detectClick(x, y)) {
                    this.currentObject = spike;
                }
            }

            for (let colorOrb of this.level.colorOrbs) {
                if (colorOrb.detectClick(x, y)) {
                    this.currentObject = colorOrb;
                }
            }

            if (this.level.finish) {
                if (this.level.finish.detectClick(x, y)) {
                    this.currentObject = this.level.finish;
                }
            }

            if (this.level.key) {
                if (this.level.key.detectClick(x, y)) {
                    this.currentObject = this.level.key;
                }
            }

            if (this.level.player) {
                if (this.level.player.detectClick(x, y)) {
                    this.currentObject = this.level.player;
                }
            }
        }
    }

    
    mouseReleased() {
        this.currentObject = null;
    }


    usesKey(key) {
        return this.keyMap[key] !== undefined;
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
        this.keysPressed.splice(this.keysPressed.indexOf(key), 1);
    }


    rotate() {
        if (this.currentObject) {
            this.currentObject.rotate(90);
        }
    }


    changeColor() {
        if (this.currentObject?.color && this.currentObject.color !== "gold") {
            this.currentObject.color = this.nextColor(this.currentObject.color);
        }
    }


    nextColor(color) {
        return this.colors[(this.colors.indexOf(color) + 1) % this.colors.length];
    }


    copyEncodedLevel() {
        navigator.clipboard.writeText(this.encodeLevelToBase64());
    }


    encodeLevelToBase64() {
        let level = JSON.stringify(this.level);
        let encodedLevel = btoa(level);

        return encodedLevel;
    }


    loadLevelFromBase64(encodedLevel) {
        let level = JSON.parse(atob(encodedLevel));
        this.level.player = new Player(this.ctx, level.player.pos, level.player.size, level.player.color);
        this.level.obstacles = level.obstacles.map(obstacle => new Obstacle(this.ctx, obstacle.pos, obstacle.size, obstacle.color));
        this.level.colorOrbs = level.colorOrbs.map(colorOrb => new ColorOrb(this.ctx, colorOrb.pos, colorOrb.size, colorOrb.color));
        this.level.spikes = level.spikes.map(spike => new Spike(this.ctx, spike.pos, spike.size, spike.rotation, spike.color));
        this.level.finish = new Finish(this.ctx, level.finish.pos, level.finish.size);
        this.level.key = new Key(this.ctx, level.key.pos);
    }


    draw() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let obstacle of this.level.obstacles) {
            obstacle.draw();
        }

        for (let spike of this.level.spikes) {
            spike.draw();
        }

        for (let colorOrb of this.level.colorOrbs) {
            colorOrb.draw();
        }

        if (this.level.finish) {
            this.level.finish.draw();
        }

        if (this.level.player) {
            this.level.player.draw();
        }

        if (this.level.key) {
            if (this.level.player) {
                this.level.key.draw(this.level.player);
            }
            else {
                this.level.key.draw({ hasKey: false });
            }
        }
    }
}