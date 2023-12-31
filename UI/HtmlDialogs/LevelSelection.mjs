export class LevelSelection {

    availableLevels = [];
    currentLevel = null;
    maxLevelsPerRow = 3;
    maxRows = 2;
    currentSite = 0;
    visible = false;

    container = null;
    levelContainer = null;
    previousSiteButton = null;
    nextSiteButton = null;

    constructor(document, loadLevel, showLocalLevels) {
        this.document = document;
        this.loadLevel = loadLevel;
        this.showLocalLevels = showLocalLevels;
    }



    createElement() {
        this.container = this.document.createElement("div");
        this.container.classList.add("dialog", "level-selection", "glassy");
        this.hide();

        let header = this.document.createElement("div");
        header.classList.add("header");
        this.container.appendChild(header);

        let title = this.document.createElement("h1");
        title.innerText = "Levels";
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

        this.levelContainer = this.document.createElement("div");
        this.levelContainer.classList.add("level-container");
        this.container.appendChild(this.levelContainer);

        let buttonContainer = this.document.createElement("div");
        buttonContainer.classList.add("button-container");
        this.container.appendChild(buttonContainer);

        this.previousSiteButton = this.document.createElement("button");
        this.previousSiteButton.innerText = "<";
        this.previousSiteButton.addEventListener("click", () => {
            this.previousSite();
        });
        this.previousSiteButton.addEventListener("touchend", () => {
            this.previousSite();
        });
        buttonContainer.appendChild(this.previousSiteButton);

        let showLocalLevelsButton = this.document.createElement("button");
        showLocalLevelsButton.innerText = "Local Levels";
        showLocalLevelsButton.addEventListener("click", () => {
            this.hide();
            this.showLocalLevels();
        });
        showLocalLevelsButton.addEventListener("touchend", () => {
            this.hide();
            this.showLocalLevels();
        });
        buttonContainer.appendChild(showLocalLevelsButton);

        this.nextSiteButton = this.document.createElement("button");
        this.nextSiteButton.innerText = ">";
        this.nextSiteButton.addEventListener("click", () => {
            this.nextSite();
        });
        this.nextSiteButton.addEventListener("touchend", () => {
            this.nextSite();
        });
        buttonContainer.appendChild(this.nextSiteButton);

        this.drawLevelSite();

        return this.container;
    }


    drawLevelSite() {
        this.levelContainer.innerHTML = "";

        for (let i = 0; i < this.maxRows; i++) {
            let row = this.document.createElement("div");
            row.classList.add("level-row");
            for (let j = 0; j < this.maxLevelsPerRow; j++) {
                let targetIndex = this.currentSite * this.maxLevelsPerRow * this.maxRows;
                if (targetIndex + i * this.maxLevelsPerRow + j >= this.availableLevels.length) {
                    break;
                }

                let level = this.document.createElement("div");
                level.classList.add("level", "glassy");
                level.innerText = this.availableLevels[targetIndex + i * this.maxLevelsPerRow + j];
                level.addEventListener("click", () => {
                    this.hide();
                    this.loadLevel(this.availableLevels[targetIndex + i * this.maxLevelsPerRow + j]);
                });
                level.addEventListener("touchend", () => {
                    this.hide();
                    this.loadLevel(this.availableLevels[targetIndex + i * this.maxLevelsPerRow + j]);
                });
                row.appendChild(level);
            }
            this.levelContainer.appendChild(row);
        }

        this.previousSiteButton.disabled = this.currentSite === 0;
        this.nextSiteButton.disabled = (this.currentSite + 1) * this.maxLevelsPerRow * this.maxRows >= this.availableLevels.length;
    }


    previousSite() {
        if (this.currentSite === 0) {
            return;
        }

        this.currentSite--;
        this.drawLevelSite();
    }


    nextSite() {
        if ((this.currentSite + 1) * this.maxLevelsPerRow * this.maxRows >= this.availableLevels.length) {
            return;
        }

        this.currentSite++;
        this.drawLevelSite();
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


    setAvailableLevels(availableLevels) {
        this.availableLevels = availableLevels;
        this.drawLevelSite();
    }


    nextLevel() {
        let index = this.availableLevels.indexOf(this.currentLevel);
        if (index === -1) {
            return;
        }

        if (index + 1 < this.availableLevels.length) {
            this.loadLevel(this.availableLevels[index + 1]);
        }
    }


    hasNextLevel() {
        let index = this.availableLevels.indexOf(this.currentLevel);
        if (index === -1) {
            return false;
        }

        return index + 1 < this.availableLevels.length;
    }


    setCurrentLevel(level) {
        this.currentLevel = level;
    }

}