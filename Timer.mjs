import * as drawLib from './drawLib.mjs';
import { formatTime } from './formatTime.mjs';


export class Timer {


    times = [];
    running = false;


    constructor(ctx, pos, size, color, isMobile) {
        this.ctx = ctx;
        this.pos = pos;
        this.size = size;
        this.color = color;
        this.isMobile = isMobile;
        this.time = Date.now();
        this.currentTime = this.time;
        this.ticks = 0;
        this.currentColor = color;
    }


    draw() {
        this.ctx.translate(this.pos.x, this.pos.y);
        drawLib.rect(this.ctx, 0, 0, this.size.width, this.size.height, this.currentColor);
        drawLib.text(this.ctx, this.size.width / 2, this.size.height / 2 - 5, formatTime(this.currentTime - this.time), 'black');
        drawLib.text(this.ctx, this.size.width / 2, this.size.height / 2 + 15, `${this.ticks} ticks`, 'black', 'center', 'middle', '15px sans-serif');

        this.ctx.translate(this.size.width * 0.1, this.size.height);
        drawLib.rect(this.ctx, 0, 0, this.size.width * 0.8, this.size.height / 2, this.color);
        drawLib.text(this.ctx, (this.size.width * 0.8) / 2, this.size.height / 4, this.calcTotalTime(), 'black', 'center', 'middle', '15px sans-serif');
        
        this.ctx.translate(-this.size.width * 0.05, 0);

        if (this.times.length > 0 && !this.isMobile) {
            for (const time of this.times) {
                this.ctx.translate(0, this.size.height / 2 + 10);
                drawLib.rect(this.ctx, 0, 0, this.size.width * 0.9, this.size.height / 2, this.color);
                drawLib.text(this.ctx, (this.size.width * 0.9) / 2, this.size.height / 4, `${time.level}. ${formatTime(time.time)}`, 'black', 'center', 'middle', '15px sans-serif');
            }   
        }

        this.ctx.resetTransform();
    }


    start() {
        this.running = true;
        this.ticks = 0;
        this.time = Date.now();
        this.currentColor = this.color;
    }


    stop() {
        this.running = false;
    }


    reset() {
        this.stop();
        this.ticks = 0;
        this.time = Date.now();
        this.currentTime = this.time;
        this.currentColor = this.color;
    }


    update() {
        if (this.running) {
            this.currentTime = Date.now();
            this.ticks++;
        }
    }


    saveTime(level) {
        this.stop();
        let time = this.times.find(time => time.level === level);
        if (time === undefined) {
            this.times.unshift({ level: level, time: this.currentTime - this.time, ticks: this.ticks });
        }
        else if (this.ticks < time.ticks || (this.ticks === time.ticks && this.currentTime - this.time < time.time)) {
            time.time = this.currentTime - this.time;
            time.ticks = this.ticks;
            this.currentColor = '#289959';
        }
        else {
            this.currentColor = '#99283d';
        }

        this.times.sort((a, b) => a.level - b.level);
    }


    calcTotalTime() {
        let total = 0;

        for (const time of this.times) {
            total += time.time;
        }

        if (this.running) {
            total += this.currentTime - this.time;
        }

        return formatTime(total);
    }


}