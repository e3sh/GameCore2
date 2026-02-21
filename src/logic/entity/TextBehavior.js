import { Behavior } from './Behavior.js';

/**
 * @class TextBehavior
 * @description
 * 文字列を描画するコンポーネント。
 * UIBehavior と併用された場合は画面固定のテキストとして描画される。
 */
export class TextBehavior extends Behavior {
    /**
     * @param {Object} options
     * @param {string} options.text 描画するテキスト
     * @param {string} options.font フォント設定（例: '16px monospace'）
     * @param {string} options.color テキストの色
     * @param {string} options.align テキストの揃え（left, center, right）
     */
    constructor(options = {}) {
        super();
        this.text = options.text || "";
        this.font = options.font || "16px monospace";
        this.color = options.color || "white";
        this.align = options.align || "left";
        this.paddingX = options.paddingX || 0;
        this.paddingY = options.paddingY || 0;
    }

    draw(display, viewport) {
        if (!this.text) return;

        // 親エンティティに UIBehavior が付与されていればカメラの影響を無視する
        const isUI = this.entity.behaviors.some(b => b.isUI);
        let drawX = this.entity.x + this.paddingX;
        let drawY = this.entity.y + this.paddingY;

        if (!isUI) {
            const screenPos = viewport.worldToScreen(drawX, drawY);
            drawX = screenPos.x;
            drawY = screenPos.y;
        }

        const layer = display.getLayer(isUI ? 1 : 0); // UIは手前のレイヤーに描画する想定
        const ctx = layer.ctx;

        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.textAlign = this.align;
        // TextBaseline は状況により調整するが、一旦 top に統一
        ctx.textBaseline = 'top';

        // 改行対応 (簡易的)
        const lines = this.text.split('\n');
        // フォントサイズを簡易的に計算（例: "16px" -> 16）
        const fontSizeMatch = this.font.match(/(\d+)px/);
        const lineHeight = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) + 4 : 20;

        lines.forEach((line, index) => {
            ctx.fillText(line, drawX, drawY + (index * lineHeight));
        });
    }
}
