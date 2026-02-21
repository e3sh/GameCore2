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

    onDraw(display) {
        const layer = display.getLayer(0); // 基本的に最背面レイヤーか特定レイヤー
        const pos = this.getGlobalPos();

        layer.ctx.fillStyle = this.color;
        layer.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        layer.ctx.textAlign = this.align;
        layer.ctx.textBaseline = this.baseline;
        layer.ctx.fillText(this.text, pos.x, pos.y);
    }
}
