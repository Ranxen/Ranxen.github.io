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
    }


    draw() {
        this.ctx.translate(this.pos.x, this.pos.y);
        drawLib.rect(this.ctx, 0, 0, this.size.width, this.size.height, this.color);
        if (this.running) {
            drawLib.text(this.ctx, this.size.width / 2, this.size.height / 2, formatTime(Date.now() - this.time), 'black');
        } else {
            drawLib.text(this.ctx, this.size.width / 2, this.size.height / 2, '00:00:00', 'black');
        }

        this.ctx.translate(this.size.width * 0.1, this.size.height);
        drawLib.rect(this.ctx, 0, 0, this.size.width * 0.8, this.size.height / 2, this.color);
        drawLib.text(this.ctx, (this.size.width * 0.8) / 2, this.size.height / 4, this.calcTotalTime(), 'black', 'center', 'middle', '15px sans-serif');

        if (this.times.length > 0 && !this.isMobile) {
            for (const time of this.times) {
                this.ctx.translate(0, this.size.height / 2 + 10);
                drawLib.rect(this.ctx, 0, 0, this.size.width * 0.8, this.size.height / 2, this.color);
                drawLib.text(this.ctx, (this.size.width * 0.8) / 2, this.size.height / 4, `${time.level}. ${formatTime(time.time)}`, 'black', 'center', 'middle', '15px sans-serif');
            }   
        }

        this.ctx.resetTransform();
    }


    start() {
        this.time = Date.now();
        this.running = true;
    }


    stop() {
        this.running = false;
    }


    saveTime(level) {
        this.stop();
        let time = this.times.find(time => time.level === level);
        if (time === undefined) {
            this.times.unshift({ level: level, time: Date.now() - this.time });
        }
        else if (Date.now() - this.time < time.time) {
            time.time = Date.now() - this.time;
        }
    }


    calcTotalTime() {
        let total = 0;

        for (const time of this.times) {
            total += time.time;
        }

        if (this.running) {
            total += Date.now() - this.time;
        }

        return formatTime(total);
    }


}