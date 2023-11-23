export class LeftDrawer {


    actionsPerRow = 2;


    constructor(document, createObjectFunctions) {
        this.document = document;
        this.createObjectFunctions = createObjectFunctions;
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

        return this.container;
    }


}