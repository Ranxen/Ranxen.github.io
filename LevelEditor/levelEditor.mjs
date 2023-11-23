import { LeftDrawer } from "./leftDrawer.mjs";
import { Player } from "../Game/Player.mjs";
import { Obstacle } from "../Game/Obstacle.mjs";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


let levelEditor;
let leftDrawer;


function drawHtml() {
    let parentContainer = document.getElementById("overlay");

    leftDrawer = new LeftDrawer(document, levelEditor.createActions());
    parentContainer.appendChild(leftDrawer.createElement());
}


function setup() {
    levelEditor = new LevelEditor(ctx);
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


window.addEventListener("mousemove", (event) => {
    levelEditor.mouseMoved(event.clientX, event.clientY);
});


window.addEventListener("mouseup", (event) => {
    levelEditor.mouseReleased();
});


resizeCanvas();

window.addEventListener('resize', resizeCanvas);

window.addEventListener('orientationchange', resizeCanvas);

window.onload = setup;


export class LevelEditor {


    // gameObjects = [createPlayer, createObstacle, createSpike, createColorOrb, createFinish, createKey];

    currentObject = null;


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


    createActions() {
        return [{ "name" : "Player", "action" : () => this.createPlayer()}, { "name" : "Obstacle", "action" : () => this.createObstacle()}];
    }


    mouseMoved(x, y) {
        this.mouseX = Math.floor(x / this.gridSize) * this.gridSize;
        this.mouseY = Math.floor(y / this.gridSize) * this.gridSize;

        if (this.currentObject) {
            this.currentObject.pos.x = this.mouseX;
            this.currentObject.pos.y = this.mouseY;
        }
    }

    
    mouseReleased() {
        this.currentObject = null;
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

        if (this.level.player) {
            this.level.player.draw();
        }
    }
}