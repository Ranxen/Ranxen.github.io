import { formatTime } from "./formatTime.mjs";


export class LevelDoneDialog {

    visible = false;

    container = null;
    timesContainer = null;
    nextLevelButton = null;

    constructor(document, nextLevel, retryLevel) {
        this.document = document;
        this.nextLevel = nextLevel;
        this.retryLevel = retryLevel;
    }



    createElement() {
        this.container = this.document.createElement("div");
        this.container.classList.add("dialog", "level-done-dialog", "glassy");
        this.hide();

        let header = this.document.createElement("div");
        header.classList.add("header");
        this.container.appendChild(header);

        let title = this.document.createElement("h1");
        title.innerText = "Level Done";
        header.appendChild(title);

        let closeButton = this.document.createElement("button");
        closeButton.classList.add("close-button");
        closeButton.innerText = "X";
        closeButton.addEventListener("click", () => {
            this.hide();
        });
        closeButton.addEventListener("touchend", () => {
            this.hide();
        });
        header.appendChild(closeButton);

        this.timesContainer = this.document.createElement("div");
        this.timesContainer.classList.add("times-container");
        this.container.appendChild(this.timesContainer);

        let buttonContainer = this.document.createElement("div");
        buttonContainer.classList.add("button-container");
        this.container.appendChild(buttonContainer);

        let tryAgainButton = this.document.createElement("button");
        tryAgainButton.innerText = "Try Again";
        tryAgainButton.addEventListener("click", () => {
            this.hide();
            this.retryLevel();
        });
        tryAgainButton.addEventListener("touchend", () => {
            this.hide();
            this.retryLevel();
        });
        buttonContainer.appendChild(tryAgainButton);

        this.nextLevelButton = this.document.createElement("button");
        this.nextLevelButton.innerText = "Next Level";
        this.nextLevelButton.addEventListener("click", () => {
            this.hide();
            this.nextLevel();
        });
        this.nextLevelButton.addEventListener("touchend", () => {
            this.hide();
            this.nextLevel();
        });
        buttonContainer.appendChild(this.nextLevelButton);

        return this.container;
    }


    drawLevelTimes(times) {
        this.timesContainer.innerHTML = "";

        let totalTime = this.document.createElement("div");
        totalTime.innerText = "Total Time: " + formatTime(times.reduce((acc, cur) => acc + cur.time, 0));
        this.timesContainer.appendChild(totalTime);

        let table = this.document.createElement("table");
        table.classList.add("level-times-table");

        let level = this.document.createElement("th");
        level.innerText = "Level";
        table.appendChild(level);

        let time = this.document.createElement("th");
        time.innerText = "Time";
        table.appendChild(time);

        for (const levelTime of times) {
            let row = this.document.createElement("tr");

            let level = this.document.createElement("td");
            level.innerText = levelTime.level;
            row.appendChild(level);

            let time = this.document.createElement("td");
            time.innerText = formatTime(levelTime.time);
            row.appendChild(time);

            table.appendChild(row);
        }

        this.timesContainer.appendChild(table);
    }


    hide() {
        this.container.style.opacity = 0;
        this.container.style.visibility = "hidden";
        this.visible = false;
    }


    show() {
        this.container.style.opacity = 1;
        this.container.style.visibility = "visible";
        this.visible = true;
    }

}