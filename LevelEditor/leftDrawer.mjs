export class LeftDrawer {


    objectsPerRow = 2;
    levelNameInput = null;
    toggleGridButton = null;
    showGridButton = null;


    constructor(document, localLevels, editorControls, createObjectFunctions, editorActions) {
        this.document = document;
        this.localLevels = localLevels;
        this.editorControls = editorControls;
        this.createObjectFunctions = createObjectFunctions;
        this.editorActions = editorActions;
    }


    createElement() {
        this.container = this.document.createElement("div");
        this.container.classList.add("left-drawer", "glassy");

        let header = this.document.createElement("div");
        header.classList.add("header");
        this.container.appendChild(header);

        let backToGameButton = this.document.createElement("button");
        backToGameButton.innerText = "<";
        backToGameButton.addEventListener("click", () => {
            window.location.href = "/index.html";
        });
        header.appendChild(backToGameButton);

        let title = this.document.createElement("h1");
        title.innerText = "Objects";
        header.appendChild(title);

        let showEditorControlsButton = this.document.createElement("button");
        showEditorControlsButton.innerText = "?";
        showEditorControlsButton.addEventListener("click", () => {
            this.editorControls.show();
        });
        header.appendChild(showEditorControlsButton);

        let objectContainer = this.document.createElement("div");
        objectContainer.classList.add("object-container");

        let objectRow = this.document.createElement("div");
        objectContainer.appendChild(objectRow);

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
                objectRow = this.document.createElement("div");
                objectContainer.appendChild(objectRow);
            }
        }
        this.container.appendChild(objectContainer);

        let buttonsContainer = this.document.createElement("div");
        buttonsContainer.classList.add("vertical");

        let loadLevelContainer = this.document.createElement("div");
        loadLevelContainer.classList.add("horizontal", "margin");

        let encodedLevelField = this.document.createElement("input");
        encodedLevelField.name = "encodedLevel";
        loadLevelContainer.appendChild(encodedLevelField);

        let loadEncodedButton = this.document.createElement("button");
        loadEncodedButton.innerText = "Load";
        encodedLevelField.placeholder = "Paste level here";
        loadEncodedButton.addEventListener("click", () => {
            try {
                this.editorActions.loadEncodedLevel(encodedLevelField.value);
            }
            catch (error) {
                this.showInvalidLevelToast();
            }
        });
        loadLevelContainer.appendChild(loadEncodedButton);

        buttonsContainer.appendChild(loadLevelContainer);

        let uploadLevelContainer = this.document.createElement("div");
        uploadLevelContainer.classList.add("horizontal", "margin");

        let uploadLevelField = this.document.createElement("input");
        uploadLevelField.type = "file";
        uploadLevelField.accept = ".json";
        uploadLevelContainer.appendChild(uploadLevelField);

        let uploadLevelButton = this.document.createElement("button");
        uploadLevelButton.innerText = "Upload Level";
        uploadLevelButton.addEventListener("click", () => {
            try {
                this.editorActions.uploadLevel(uploadLevelField.files[0]);
            }
            catch (error) {
                this.showInvalidLevelToast();
            }
        });
        uploadLevelContainer.appendChild(uploadLevelButton);

        buttonsContainer.appendChild(uploadLevelContainer);


        this.levelNameInput = this.document.createElement("input");
        this.levelNameInput.placeholder = "Level Name";
        this.levelNameInput.classList.add("margin");
        this.levelNameInput.addEventListener("change", () => {
            this.editorActions.changeLevelName(this.levelNameInput.value);
        });
        buttonsContainer.appendChild(this.levelNameInput);

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

        let saveToBrowserCache = this.document.createElement("button");
        saveToBrowserCache.innerText = "Save to Browser Cache";
        saveToBrowserCache.classList.add("margin");
        saveToBrowserCache.addEventListener("click", () => {
            try {
                if (this.editorActions.saveToBrowserCache()) {
                    this.showSuccessToast("Level saved");
                }
            }
            catch (error) {
                this.showInvalidToast("Could not save level");
            }
        });
        buttonsContainer.appendChild(saveToBrowserCache);

        let toggleGridContainer = this.document.createElement("div");
        toggleGridContainer.classList.add("horizontal", "margin");

        this.toggleGridButton = this.document.createElement("input");
        this.toggleGridButton.type = "checkbox";
        this.toggleGridButton.checked = true;
        this.toggleGridButton.addEventListener("click", () => {
            this.editorActions.toggleGrid();
        });
        toggleGridContainer.appendChild(this.toggleGridButton);

        let toggleGridLabel = this.document.createElement("div");
        toggleGridLabel.classList.add("center");
        toggleGridLabel.innerText = "Enable Grid";
        toggleGridContainer.appendChild(toggleGridLabel);

        this.showGridButton = this.document.createElement("button");
        this.showGridButton.innerText = "Show";
        this.showGridButton.addEventListener("click", () => {
            this.editorActions.showGrid();
        });
        toggleGridContainer.appendChild(this.showGridButton);

        buttonsContainer.appendChild(toggleGridContainer);

        let showLocalLevelsButton = this.document.createElement("button");
        showLocalLevelsButton.innerText = "Show Local Levels";
        showLocalLevelsButton.classList.add("margin");
        showLocalLevelsButton.addEventListener("click", () => {
            this.localLevels.show();
        });
        buttonsContainer.appendChild(showLocalLevelsButton);

        this.container.appendChild(buttonsContainer);

        return this.container;
    }


    setLevelName(levelName) {
        this.levelNameInput.value = levelName;
    }


    toggleGrid(value) {
        this.toggleGridButton.checked = value;
    }


    showGrid(shown) {
        this.showGridButton.innerText = shown ? "Hide" : "Show";
    }


    showSuccessToast(title) {
        let toast = this.document.createElement("div");
        toast.classList.add("toast", "glassy");
        toast.innerText = title;
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }


    showCopiedToast() {
        this.showSuccessToast("Copied level to clipboard");
    }


    showErrorToast(title) {
        let toast = this.document.createElement("div");
        toast.classList.add("toast", "glassy", "error");
        toast.innerText = title;
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }


    showInvalidLevelToast() {
        this.showErrorToast("Could not Load level");
    }


}