import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * @class SpriteBehavior
 * @description エンティティにスプライトを描画する機能を提供します。
 * GameCoreのSpriteSystemに登録されたパターンを使用します。
 */
export class SpriteBehavior extends Behavior {
    constructor(engine, patternId, options = {}) {
        super();
        this.engine = engine;
        this.patternId = patternId;

        // アニメーション関連
        this.frameIndex = 0;
        this.animTimer = 0;

        // オプション（デフォルト値）
        this.scale = options.scale !== undefined ? options.scale : (options.z !== undefined ? options.z : 1.0);
        this.alpha = options.alpha !== undefined ? options.alpha : 255;
        this.rotation = options.rotation || 0;
        this.flipX = options.flipX || false;
        this.flipY = options.flipY || false;
    }

    update(dt) {
        const ptn = this.engine.sprite.patterns.get(this.patternId);
        if (!ptn || !ptn.frames || ptn.frames.length <= 1) return;

        // アニメーション更新
        this.animTimer += dt;
        const frameTime = (ptn.wait || 8) * 16.6; // デフォルトウェイトを8(約132ms)とする
        if (this.animTimer >= frameTime) {
            this.animTimer = 0;
            this.frameIndex = (this.frameIndex + 1) % ptn.frames.length;
        }
    }

    draw(display, viewport) {
        const ptn = this.engine.sprite.patterns.get(this.patternId);
        if (!ptn || !ptn.frames || this.frameIndex >= ptn.frames.length) return;

        const frame = ptn.frames[this.frameIndex];
        const img = this.engine.assets.getImage(ptn.imageKey);
        if (!img) return;

        // UI要素かどうかの判定 (Behavior自身のプロパティで判断する)
        const isUI = this.isUI || false;
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
        const m11 = (this.flipX !== !!frame.fh) ? -1 : 1;
        const m22 = (this.flipY !== !!frame.fv) ? -1 : 1;

        // トップビューの場合は高さを擬似的に拡大率で表現、かつ表示位置を上にずらす
        let currentScale = this.scale;
        if (this.engine.viewMode === 'top' && this.entity.z > 0) {
            currentScale += (this.entity.z / 32) * 0.1;
            drawY -= this.entity.z; // ジャンプした高さ分だけ画面上へ描画位置を移動
        }

        const dw = frame.w * currentScale;
        const dh = frame.h * currentScale;

        layer.spPut(
            img,
            frame.x, frame.y, frame.w, frame.h,
            -dw / 2, -dh / 2, dw, dh,
            m11, 0, 0, m22,
            drawX, drawY,
            this.alpha,
            this.rotation || frame.r || 0
        );
    }
}
