export class ColorPalette {
    constructor(document, colors, selectColor) {
        this.document = document;
        this.colors = colors;
        this.selectColor = selectColor;
    }

    createElement() {
        this.container = this.document.createElement("div");
        this.container.classList.add("top-drawer", "glassy");

        this.colorContainer = this.document.createElement("div");
        this.container.appendChild(this.colorContainer);
        this.createColors();

        return this.container;
    }

    createColors() {
        this.colorContainer.innerHTML = "";
        for (let color of this.colors) {
            let colorElement = this.document.createElement("div");
            colorElement.classList.add("palette-color");
            colorElement.style.backgroundColor = color;
            colorElement.addEventListener("click", () => {
                if (this.selected) {
                    this.selected.classList.remove("selected");
                }

                colorElement.classList.add("selected");
                this.selected = colorElement;
                this.selectColor(color);
            });
            this.colorContainer.appendChild(colorElement);
        }
    }

    updateColors(colors) {
        this.colors = colors;

        if (this.colors.length > 0) {
            this.createColors();
        }
        else {
            this.hide();
        }

    }

    hide() {
        this.container.style.display = "none";
    }

    show() {
        this.container.style.display = "block";
    }
}