import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * デバッグ用：エンティティの当たり判定（AABB）の枠線を描画するBehavior
 */
export class DebugHitboxBehavior extends Behavior {
    constructor(color = 'rgba(255, 0, 0, 0.5)') {
        super();
        this.color = color;
        this.isUI = false; // ゲーム内座標として描画
    }

    draw(display, viewport) {
        const e = this.entity;
        if (!e) return;

        let drawX = e.x;
        let drawY = e.y;

        const screenPos = viewport.worldToScreen(drawX, drawY);
        drawX = screenPos.x;
        drawY = screenPos.y;

        const layer = display.getLayer(0);
        const ctx = layer.ctx;

        const w = e.width || 32;
        const h = e.height || 32;

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;

        if (e.engine && e.engine.viewMode === 'top' && e.z > 0) {
            drawY -= e.z; // ジャンプ中はヒットボックス描画も上へずらす
        }

        // 中心座標基準で描画
        ctx.strokeRect(drawX - w / 2, drawY - h / 2, w, h);

        // 中心点もプロット
        ctx.fillStyle = this.color;
        ctx.fillRect(drawX - 1, drawY - 1, 2, 2);
    }
}
