export class Inspector {


    constructor(document, colorCallback) {
        this.document = document;
        this.colorCallback = colorCallback;
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
        this.title.innerText = object.constructor.name;
        
        let editableAttributes = object.getEditableAttributes();

        for (let attribute of editableAttributes) {
            let div = this.document.createElement("div");
            div.classList.add("attribute-container");
            let label = this.document.createElement("label");
            label.style.margin = "4px";
            label.innerText = attribute.name;
            div.appendChild(label);

            let input = this.createInputElementByType(attribute.type, attribute.value, attribute.callback);

            div.appendChild(input);
            this.attributeContainer.appendChild(div);
        }

        this.show();
    }


    hide() {
        this.container.style.display = "none";
    }


    show() {
        this.container.style.display = "block";
    }


    createInputElementByType(type, value, callback) {
        if (type === 'vector') {
            let vector = this.document.createElement("div");
            vector.classList.add("horizontal");

            let x = this.createInputElementByType("number", value.x, (value) => {
                callback("x", value);
            });
            vector.appendChild(x);

            let y = this.createInputElementByType("number", value.y, (value) => {
                callback("y", value);
            });
            vector.appendChild(y);

            return vector;
        }
        else if (type === 'number') {
            let input = this.document.createElement("input");
            input.type = "number";
            input.value = value;
            input.addEventListener("input", () => {
                callback(input.valueAsNumber);
            });
            return input;
        }
        else if (type === 'checkbox') {
            let input = this.document.createElement("input");
            input.type = "checkbox";
            input.checked = value;
            input.addEventListener("change", () => {
                callback(input.checked);
            });
            return input;
        }
        else {
            let input = this.document.createElement("input");
            input.type = "text"
            input.value = value;
            input.addEventListener("input", () => {
                callback(input.value);

                if (type === 'color') {
                    this.colorCallback();
                }
            });
            return input;
        }
    }


}