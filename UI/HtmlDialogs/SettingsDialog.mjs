export class SettingsDialog {

    visible = false;

    container = null;

    constructor(document, controlsDialog, loadEncodedLevel) {
        this.document = document;
        this.controlsDialog = controlsDialog;
        this.loadEncodedLevel = loadEncodedLevel;
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


        let buttonContainer = this.document.createElement("div");
        buttonContainer.classList.add("vertical");

        if (this.controlsDialog) {
            let controlsButton = this.document.createElement("button");
            controlsButton.classList.add("controls-button");
            controlsButton.innerText = "Show Controls";
            controlsButton.addEventListener("click", () => {
                this.hide();
                this.controlsDialog.show();
            });
            buttonContainer.appendChild(controlsButton);
        }

        let createLevelButton = this.document.createElement("button");
        createLevelButton.innerText = "Create Level";
        createLevelButton.addEventListener("click", () => {
            window.location.href = "/levelEditor.html";
        });
        buttonContainer.appendChild(createLevelButton);


        let loadLevelContainer = this.document.createElement("div");
        loadLevelContainer.classList.add("horizontal");

        let encodedLevelField = this.document.createElement("input");
        encodedLevelField.classList.add("margin");
        encodedLevelField.placeholder = "Paste level here";
        encodedLevelField.draggable = false;
        loadLevelContainer.appendChild(encodedLevelField);

        let loadEncodedButton = this.document.createElement("button");
        loadEncodedButton.classList.add("margin");
        loadEncodedButton.innerText = "Load";
        loadEncodedButton.addEventListener("click", () => {
            this.hide();
            this.loadEncodedLevel(encodedLevelField.value);
        });
        loadLevelContainer.appendChild(loadEncodedButton);

        buttonContainer.appendChild(loadLevelContainer);

        this.container.appendChild(buttonContainer);

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