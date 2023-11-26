export class LocalLevels {

    availableLevels = [];
    maxLevelsPerRow = 3;
    maxRows = 2;
    currentSite = 0;
    visible = false;
    levelStartIndex = 0;

    container = null;
    levelContainer = null;
    previousSiteButton = null;
    nextSiteButton = null;

    constructor(document, onLevelSelected) {
        this.document = document;
        this.onLevelSelected = onLevelSelected;
        this.updateElement = true;
        this.updateLevels();
    }

    
    setStartIndex(index) {
        this.levelStartIndex = index;
        this.updateLevels();
    }


    updateLevels() {
        this.availableLevels = JSON.parse(localStorage.getItem("levels")) || [];

        for (let i = 0; i < this.availableLevels.length; i++) {
            if (typeof this.availableLevels[i] === "string") {
                this.availableLevels[i] = JSON.parse(this.availableLevels[i]);
            }
            this.availableLevels[i].index = this.levelStartIndex + i;
        }

        this.updateElement = true;
    }


    createElement() {
        this.container = this.document.createElement("div");
        this.container.classList.add("local-levels", "glassy");
        this.hide();

        let header = this.document.createElement("div");
        header.classList.add("header");
        this.container.appendChild(header);

        let title = this.document.createElement("h1");
        title.innerText = "Local Levels";
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
        this.levelContainer.classList.add("local-level-container");
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

        if (this.availableLevels.length === 0) {
            let noLevels = this.document.createElement("div");
            noLevels.innerText = "No levels found :(";
            this.levelContainer.appendChild(noLevels);
            return;
        }

        for (let i = 0; i < this.maxRows; i++) {
            let row = this.document.createElement("div");
            row.classList.add("local-level-row");
            for (let j = 0; j < this.maxLevelsPerRow; j++) {
                let targetIndex = this.currentSite * this.maxLevelsPerRow * this.maxRows;
                if (targetIndex + i * this.maxLevelsPerRow + j >= this.availableLevels.length) {
                    break;
                }

                let level = this.document.createElement("div");
                level.classList.add("local-level", "glassy", "margin");
                level.innerText = this.availableLevels[targetIndex + i * this.maxLevelsPerRow + j].levelName;
                level.addEventListener("click", () => {
                    this.hide();
                    this.onLevelSelected(this.availableLevels[targetIndex + i * this.maxLevelsPerRow + j]);
                });
                level.addEventListener("touchend", () => {
                    this.hide();
                    this.onLevelSelected(this.availableLevels[targetIndex + i * this.maxLevelsPerRow + j]);
                });

                let deleteButton = this.document.createElement("button");
                deleteButton.classList.add("delete-button");
                deleteButton.innerText = "x";
                deleteButton.addEventListener("click", (event) => {
                    event.stopPropagation();
                    this.removeLevel(targetIndex + i * this.maxLevelsPerRow + j);
                });
                deleteButton.addEventListener("touchend", (event) => {
                    event.stopPropagation();
                    this.removeLevel(targetIndex + i * this.maxLevelsPerRow + j);
                });
                level.appendChild(deleteButton);

                row.appendChild(level);
            }
            this.levelContainer.appendChild(row);
        }

        this.previousSiteButton.disabled = this.currentSite === 0;
        this.nextSiteButton.disabled = (this.currentSite + 1) * this.maxLevelsPerRow * this.maxRows >= this.availableLevels.length;
        this.updateElement = false;
    }


    removeLevel(index) {
        this.availableLevels.splice(index, 1);
        localStorage.setItem("levels", JSON.stringify(this.availableLevels));
        this.updateLevels();
        this.drawLevelSite();
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
        if (this.updateElement) {
            this.drawLevelSite();
        }

        this.container.style.opacity = 1;
        this.container.style.visibility = "visible";
        this.visible = true;
    }

}