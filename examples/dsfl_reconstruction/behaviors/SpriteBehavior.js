import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * @class SpriteBehavior
 * @description エンティティにスプライト画像を描画する機能を提供します。
 */
export class SpriteBehavior extends Behavior {
    constructor(engine, imageKey, options = {}) {
        super();
        this.engine = engine;
        this.imageKey = imageKey;

        // オプション（デフォルト値）
        this.sx = options.sx || 0;
        this.sy = options.sy || 0;
        this.sw = options.sw || 32;
        this.sh = options.sh || 32;
        // heightを示すzと混同しないよう、scaleに変更（互換性のため旧zもフォールバックとして残す）
        this.scale = options.scale !== undefined ? options.scale : (options.z !== undefined ? options.z : 1.0);
        this.alpha = options.alpha !== undefined ? options.alpha : 255;
        this.rotation = options.rotation || 0;
        this.flipX = options.flipX || false;
        this.flipY = options.flipY || false;
    }

    draw(display, viewport) {
        const img = this.engine.assets.getImage(this.imageKey);
        if (!img) return;

        // UI要素かどうかの判定
        const isUI = this.entity.behaviors.some(b => b.isUI);
        let drawX = this.entity.x;
        let drawY = this.entity.y;

        if (!isUI) {
            // ゲーム画面上の座標変換
            const screenPos = viewport.worldToScreen(drawX, drawY);
            drawX = screenPos.x;
            drawY = screenPos.y;
        }

        // isUI が true の場合は UI 用の前景レイヤー(Layer 1以上)に描画させる
        const layer = display.getLayer(isUI ? 1 : 0);
        const m11 = this.flipX ? -1 : 1;
        const m22 = this.flipY ? -1 : 1;

        // トップビューの場合は高さを擬似的に拡大率で表現
        let currentScale = this.scale;
        if (this.engine.viewMode === 'top' && this.entity.z > 0) {
            // 例: 高さ32pxにつき10% (0.1) 拡大
            currentScale += (this.entity.z / 32) * 0.1;
        }

        const dw = this.sw * currentScale;
        const dh = this.sh * currentScale;

        layer.spPut(
            img,
            this.sx, this.sy, this.sw, this.sh,
            -dw / 2, -dh / 2, dw, dh,
            m11, 0, 0, m22,
            drawX, drawY,
            this.alpha,
            this.rotation
        );
    }
}
