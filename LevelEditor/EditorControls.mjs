export class EditorControls {

    visible = false;

    container = null;

    controls = [
        {
            key: 'Left Click',
            description: 'Place object and move object'
        },
        {
            key: 'Right Click',
            description: 'Move camera'
        },
        {
            key: "G",
            description: "Toggle grid"
        },
        {
            key: 'X',
            description: 'Delete selected object or cancel placement'
        },
        {
            key: 'C',
            description: 'Change color of selected object'
        },
        {
            key: 'A',
            description: 'Decrease width of selected object'
        },
        {
            key: 'D',
            description: 'Increase width of selected object'
        },
        {
            key: 'W',
            description: 'Decrease height of selected object'
        },
        {
            key: 'S',
            description: 'Increase height of selected object'
        },
        {
            key: 'R',
            description: 'Rotate selected object'
        },
        {
            key: 'Shift',
            description: 'Hold to place multiple objects'
        }
    ]

    constructor(document) {
        this.document = document;
    }


    createElement() {
        this.container = this.document.createElement("div");
        this.container.classList.add("dialog", "glassy");
        this.hide();

        let header = this.document.createElement("div");
        header.classList.add("header");
        this.container.appendChild(header);

        let title = this.document.createElement("h1");
        title.innerText = "Editor Controls";
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

        let table = this.document.createElement("table");
        table.classList.add("controls-table");

        this.controls.forEach(control => {
            let row = this.document.createElement("tr");

            let key = this.document.createElement("td");
            key.classList.add("key");
            key.innerText = control.key;
            row.appendChild(key);

            let description = this.document.createElement("td");
            description.innerText = control.description;
            row.appendChild(description);

            table.appendChild(row);
        });

        this.container.appendChild(table);

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