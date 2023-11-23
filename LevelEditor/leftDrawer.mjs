export class LeftDrawer {


    actionsPerRow = 2;


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
        for (let objectFunction of this.createObjectFunctions) {
            let button = this.document.createElement("button");
            button.classList.add("margin");
            button.innerText = objectFunction.name;
            button.addEventListener("click", () => {
                objectFunction.action();
            });
            objectContainer.appendChild(button);
        }
        this.container.appendChild(objectContainer);

        let encodedLevelField = this.document.createElement("textarea");
        encodedLevelField.classList.add("margin");
        encodedLevelField.id = "encodedLevel";
        this.container.appendChild(encodedLevelField);

        let loadEncodedButton = this.document.createElement("button");
        loadEncodedButton.classList.add("margin");
        loadEncodedButton.innerText = "Load Encoded";
        loadEncodedButton.addEventListener("click", () => {
            this.editorActions.loadEncodedLevel(encodedLevelField.value);
        });
        this.container.appendChild(loadEncodedButton);

        let copyEncodedButton = this.document.createElement("button");
        copyEncodedButton.classList.add("margin");
        copyEncodedButton.innerText = "Copy Encoded";
        copyEncodedButton.addEventListener("click", () => {
            this.editorActions.copyEncoded();
        });
        this.container.appendChild(copyEncodedButton);

        return this.container;
    }


}