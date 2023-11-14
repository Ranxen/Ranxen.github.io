export class ControlsDialog {

    visible = false;

    container = null;

    controls = [
        {
            key: 'A',
            description: 'Move left'
        },
        {
            key: 'D',
            description: 'Move right'
        },
        {
            key: 'Space',
            description: 'Jump'
        },
        {
            key: 'E, Arrow Right, Scroll Down',
            description: 'Switch to next color'
        },
        {
            key: 'Q, Arrow Left, Scroll Up',
            description: 'Switch to previous color'
        }
    ]

    constructor(document) {
        this.document = document;
    }



    createElement() {
        this.container = this.document.createElement("div");
        this.container.classList.add("dialog", "controls-dialog", "glassy");
        this.hide();

        let header = this.document.createElement("div");
        header.classList.add("header");
        this.container.appendChild(header);

        let title = this.document.createElement("h1");
        title.innerText = "Controls";
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