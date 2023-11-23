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

        this.container.appendChild(loadLevelContainer);

        let copyEncodedButton = this.document.createElement("button");
        copyEncodedButton.classList.add("margin");
        copyEncodedButton.innerText = "Copy Level";
        copyEncodedButton.addEventListener("click", () => {
            if (this.editorActions.copyEncoded()) {
                this.showCopiedToast();
            }
        });
        this.container.appendChild(copyEncodedButton);

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