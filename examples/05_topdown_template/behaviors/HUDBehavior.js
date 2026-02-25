import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * HUD (Heads Up Display) を描画するBehavior。
 * 通常はプレイヤのEntityにアタッチし、自分のステータスを画面の固定位置（Layer 1以上）に描画させます。
 */
export class HUDBehavior extends Behavior {
    constructor() {
        super();
        this.isUI = true; // SpriteSystemや描画パスに対してUIレイヤーで描画させるマーカー
    }

    draw(display, viewport) {
        // UI専用レイヤー（Layer 1）を取得
        const ctx = display.getLayer(1).ctx;
        if (!ctx) return;

        // PlayerCombatBehavior から HP 情報を取得
        const combat = this.entity.getBehavior('PlayerCombatBehavior');
        if (!combat) return;

        const maxHp = combat.maxHp;
        const currentHp = combat.currentHp;
        const hpRatio = Math.max(0, currentHp / maxHp);

        // --- HPゲージの描画設定 ---
        const barX = 10;
        const barY = 10;
        const barWidth = 100;
        const barHeight = 8;

        ctx.save();

        // 枠（背景色）
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 残りHP
        ctx.fillStyle = hpRatio > 0.2 ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';
        ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

        // ボーダー
        ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // テキスト表示 (オプション)
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.fillText(`HP: ${Math.ceil(currentHp)}`, barX + barWidth + 5, barY + 8);

        // --- インベントリ（取得アイテム）の表示 ---
        const inventory = this.entity.getBehavior('PlayerInventoryBehavior');
        if (inventory && Object.keys(inventory.items).length > 0) {
            let invY = barY + 30;
            ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
            Object.keys(inventory.items).forEach(itemId => {
                ctx.fillText(`[${itemId}] x ${inventory.items[itemId]}`, barX, invY);
                invY += 12;
            });
        }

        // --- 階層表示（Top Right） ---
        const gState = this.entity.engine.globalState;
        if (gState && gState.stageno) {
            ctx.textAlign = 'right';
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(`FLOOR: ${gState.stageno}`, display.width - 10, 20);
        }

        // --- デバッグ情報 ---
        ctx.textAlign = 'left';
        ctx.font = '8px monospace';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        const vp = this.entity.engine.viewport;
        ctx.fillText(`DP: ${display.width}x${display.height} | VP: ${vp.width}x${vp.height}`, barX, 220);
        ctx.fillText(`CAM: ${Math.floor(vp.worldX)},${Math.floor(vp.worldY)}`, barX, 230);

        ctx.restore();
    }
}
