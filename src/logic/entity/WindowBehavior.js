import { Behavior } from './Behavior.js';

/**
 * @class WindowBehavior
 * @description
 * メッセージウィンドウやメニューの背景となる矩形枠を描画するコンポーネント。
 */
export class WindowBehavior extends Behavior {
    /**
     * @param {Object} options
     * @param {string} options.bgColor 背景色
     * @param {string} options.borderColor 枠線の色
     * @param {number} options.borderWidth 枠線の太さ
     */
    constructor(options = {}) {
        super();
        this.bgColor = options.bgColor || "rgba(0, 0, 0, 0.8)";
        this.borderColor = options.borderColor || "white";
        this.borderWidth = options.borderWidth !== undefined ? options.borderWidth : 2;
    }

    // 描画ロジックは Renderer 側から呼ばれる
    // エンティティの x, y, width, height を基に枠線と背景を描画する
    render(ctx, drawX, drawY, entity) {
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(drawX, drawY, entity.width, entity.height);

        if (this.borderWidth > 0) {
            ctx.lineWidth = this.borderWidth;
            ctx.strokeStyle = this.borderColor;
            ctx.strokeRect(drawX, drawY, entity.width, entity.height);
        }
    }
}
