import { Player } from "../Game/Player.mjs";

export class Inspector {


    constructor(document, colorCallback, selectParentCallback) {
        this.document = document;
        this.colorCallback = colorCallback;
        this.selectParentCallback = selectParentCallback;
    }


    createElement() {
        this.container = this.document.createElement("div");
        this.container.classList.add("right-drawer", "glassy");

        let header = this.document.createElement("div");
        header.classList.add("header");
        this.container.appendChild(header);

        this.title = this.document.createElement("h1");
        this.title.innerText = "Object Inspector";
        header.appendChild(this.title);

        this.parentButton = this.document.createElement("button");
        this.parentButton.innerText = "Attach";
        this.parentButton.style.margin = "4px";
        this.parentButton.addEventListener("click", () => {
            this.selectParentCallback();
            if (!this.object.parent) {
                this.parentButton.innerText = "Attach";
            }
        });
        header.appendChild(this.parentButton);

        this.attributeContainer = this.document.createElement("div");
        this.attributeContainer.style.margin = "4px";
        this.container.appendChild(this.attributeContainer);

        return this.container;
    }


    setObject(object) {
        if (object.getEditableAttributes === undefined) {
            return;
        }

        this.attributeContainer.innerHTML = "";
        this.object = object;
        this.title.innerText = object.constructor.name.replace(/([a-z])([A-Z])/g, '$1 $2');

        if (object instanceof Player) {
            this.parentButton.style.display = "none";
        }
        else {
            this.parentButton.style.display = "block";
        }

        if (object.parent) {
            this.parentButton.innerText = "Detach";
        }
        else {
            this.parentButton.innerText = "Attach";
        }
        
        let editableAttributes = object.getEditableAttributes();

        for (let attribute of editableAttributes) {
            let div = this.document.createElement("div");
            div.classList.add("attribute-container");
            let label = this.document.createElement("label");
            label.style.margin = "4px";
            label.innerText = attribute.name;
            div.appendChild(label);

            let input = this.createInputElementByType(attribute);

            div.appendChild(input);
            this.attributeContainer.appendChild(div);
        }

        this.show();
    }


    hide() {
        this.container.style.display = "none";
        this.parentButton.style.display = "none";
    }


    show() {
        this.container.style.display = "block";
    }


    createInputElementByType(attribute) {
        if (attribute.type === 'vector') {
            let vector = this.document.createElement("div");
            vector.classList.add("horizontal");

            let x = this.createInputElementByType({ type: 'number', value: attribute.value.x, callback: (value) => { attribute.callback("x", value); } });
            vector.appendChild(x);

            let y = this.createInputElementByType({ type: 'number', value: attribute.value.y, callback: (value) => { attribute.callback("y", value); } });
            vector.appendChild(y);

            return vector;
        }
        else if (attribute.type === 'number') {
            let input = this.document.createElement("input");
            input.type = "number";
            input.value = attribute.value;
            input.addEventListener("input", () => {
                attribute.callback(input.valueAsNumber);
            });
            return input;
        }
        else if (attribute.type === 'slider') {
            let input = this.document.createElement("input");
            input.type = "range";
            input.min = attribute.min;
            input.max = attribute.max;
            input.step = (attribute.max - attribute.min) / 100;
            input.value = attribute.value;
            input.addEventListener("input", () => {
                attribute.callback(input.valueAsNumber);
            });
            return input;
        }
        else if (attribute.type === 'checkbox') {
            let input = this.document.createElement("input");
            input.type = "checkbox";
            input.checked = attribute.value;
            input.addEventListener("change", () => {
                attribute.callback(input.checked);
            });
            return input;
        }
        else {
            let input = this.document.createElement("input");
            input.type = "text"
            input.value = attribute.value;
            input.addEventListener("input", () => {
                attribute.callback(input.value);

                if (attribute.type === 'color') {
                    this.colorCallback();
                }
            });
            return input;
        }
    }


}