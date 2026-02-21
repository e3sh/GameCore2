import { UIElement } from './UIElement.js';

/**
 * @class UIButton
 * @description
 * クリック可能なボタンUI要素。
 */
export class UIButton extends UIElement {
    constructor(text = "", onClick = null) {
        super();
        this.text = text;
        this.onClick = onClick;
        this.color = "#555";
        this.hoverColor = "#888";
        this.textColor = "white";
        this.fontSize = 20;
        this.isHovered = false;
    }

    update(dt, engine) {
        super.update(dt, engine);

        if (!engine) {
            console.error("UIButton.js update: engine IS UNDEFINED!");
            return;
        }

        // 当たり判定 (エンジンの入力システムを利用)
        const mx = engine.input.raw.mouse.x;
        const my = engine.input.raw.mouse.y;

        this.isHovered = this.hitTest(mx, my);

        if (this.isHovered && engine.input.isDown('Select')) {
            if (this.onClick) this.onClick();
        }
    }

    onDraw(display) {
        const layer = display.getLayer(0);
        const pos = this.getGlobalPos();

        // 背景
        layer.ctx.fillStyle = this.isHovered ? this.hoverColor : this.color;
        layer.ctx.fillRect(pos.x, pos.y, this.width, this.height);

        // 枠線
        layer.ctx.strokeStyle = "white";
        layer.ctx.strokeRect(pos.x, pos.y, this.width, this.height);

        // テキスト
        layer.ctx.fillStyle = this.textColor;
        layer.ctx.font = `${this.fontSize}px Arial`;
        layer.ctx.textAlign = "center";
        layer.ctx.textBaseline = "middle";
        layer.ctx.fillText(this.text, pos.x + this.width / 2, pos.y + this.height / 2);
    }
}
