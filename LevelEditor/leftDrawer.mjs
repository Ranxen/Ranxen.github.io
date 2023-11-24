export class LeftDrawer {


    objectsPerRow = 2;


    constructor(document, createObjectFunctions, editorActions) {
        this.document = document;
        this.createObjectFunctions = createObjectFunctions;
        this.editorActions = editorActions;
    }


    createElement() {
        this.container = this.document.createElement("div");
        this.container.classList.add("left-drawer", "glassy");

        let header = this.document.createElement("div");
        header.classList.add("header");
        this.container.appendChild(header);

        let title = this.document.createElement("h1");
        title.innerText = "Objects";
        header.appendChild(title);

        let objectContainer = this.document.createElement("div");
        objectContainer.classList.add("object-container");

        let objectRow = this.document.createElement("div");

        let objectsCreated = 0;
        for (let objectFunction of this.createObjectFunctions) {
            let button = this.document.createElement("button");
            button.classList.add("margin");
            button.innerText = objectFunction.name;
            button.addEventListener("click", () => {
                objectFunction.action();
            });
            objectRow.appendChild(button);
            objectsCreated++;

            if (objectsCreated % this.objectsPerRow === 0) {
                objectContainer.appendChild(objectRow);
                objectRow = this.document.createElement("div");
            }
        }
        this.container.appendChild(objectContainer);

        let buttonsContainer = this.document.createElement("div");
        buttonsContainer.classList.add("vertical");

        let loadLevelContainer = this.document.createElement("div");
        loadLevelContainer.classList.add("horizontal", "margin");

        let encodedLevelField = this.document.createElement("input");
        encodedLevelField.id = "encodedLevel";
        loadLevelContainer.appendChild(encodedLevelField);

        let loadEncodedButton = this.document.createElement("button");
        loadEncodedButton.innerText = "Load";
        encodedLevelField.placeholder = "Paste level here";
        loadEncodedButton.addEventListener("click", () => {
            this.editorActions.loadEncodedLevel(encodedLevelField.value);
        });
        loadLevelContainer.appendChild(loadEncodedButton);

        buttonsContainer.appendChild(loadLevelContainer);

        let copyOrSaveContainer = this.document.createElement("div");
        copyOrSaveContainer.classList.add("horizontal", "center");

        let copyEncodedButton = this.document.createElement("button");
        copyEncodedButton.innerText = "Copy Level";
        copyEncodedButton.addEventListener("click", () => {
            if (this.editorActions.copyEncoded()) {
                this.showCopiedToast();
            }
        });
        copyOrSaveContainer.appendChild(copyEncodedButton);

        let saveLevelButton = this.document.createElement("button");
        saveLevelButton.innerText = "Download Level";
        saveLevelButton.addEventListener("click", () => {
            this.editorActions.saveLevel();
        });
        copyOrSaveContainer.appendChild(saveLevelButton);

        buttonsContainer.appendChild(copyOrSaveContainer);


        let toggleGridContainer = this.document.createElement("div");
        toggleGridContainer.classList.add("horizontal", "margin");

        let toggleGridButton = this.document.createElement("input");
        toggleGridButton.type = "checkbox";
        toggleGridButton.checked = true;
        toggleGridButton.addEventListener("click", () => {
            this.editorActions.toggleGrid();
        });
        toggleGridContainer.appendChild(toggleGridButton);

        let toggleGridLabel = this.document.createElement("div");
        toggleGridLabel.classList.add("center");
        toggleGridLabel.innerText = "Enable Grid";
        toggleGridContainer.appendChild(toggleGridLabel);

        buttonsContainer.appendChild(toggleGridContainer);

        this.container.appendChild(buttonsContainer);

        return this.container;
    }


    showCopiedToast() {
        let toast = this.document.createElement("div");
        toast.classList.add("toast", "glassy");
        toast.innerText = "Copied level to clipboard";
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }


}