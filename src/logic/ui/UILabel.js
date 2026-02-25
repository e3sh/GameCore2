import { UIElement } from './UIElement.js';

/**
 * @class UILabel
 * @description
 * テキストを表示するUI要素。
 */
export class UILabel extends UIElement {
    constructor(text = "") {
        super();
        this.text = text;
        this.fontSize = 20;
        this.fontFamily = "Arial";
        this.color = "white";
        this.align = "left"; // left, center, right
        this.baseline = "top";
    }

    onDraw(display, layerIndex = 0) {
        const layer = display.getLayer(layerIndex);
        if (!layer) return;
        const pos = this.getGlobalPos();

        const ctx = layer.ctx;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = this.align;
        ctx.textBaseline = this.baseline;
        ctx.fillText(this.text, pos.x, pos.y);
        ctx.restore();
    }
}
