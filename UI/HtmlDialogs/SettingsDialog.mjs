export class SettingsDialog {

    visible = false;

    container = null;

    constructor(document, controlsDialog) {
        this.document = document;
        this.controlsDialog = controlsDialog;
    }



    createElement() {
        this.container = this.document.createElement("div");
        this.container.classList.add("dialog", "settings-dialog", "glassy");
        this.hide();

        let header = this.document.createElement("div");
        header.classList.add("header");
        this.container.appendChild(header);

        let title = this.document.createElement("h1");
        title.innerText = "Settings";
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

        let createLevelButton = this.document.createElement("button");
        createLevelButton.classList.add("create-level-button");
        createLevelButton.innerText = "Create Level";
        createLevelButton.addEventListener("click", () => {
            window.location.href = "/levelEditor.html";
        });
        this.container.appendChild(createLevelButton);

        if (this.controlsDialog) {
            let controlsButton = this.document.createElement("button");
            controlsButton.classList.add("controls-button");
            controlsButton.innerText = "Show Controls";
            controlsButton.addEventListener("click", () => {
                this.hide();
                this.controlsDialog.show();
            });
            this.container.appendChild(controlsButton);
        }

        return this.container;
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