import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * @class HUDBehavior
 * @description
 * プレイヤーのステータス（HP、現在の階層など）を画面上に描画するコンポーネント。
 */
export class HUDBehavior extends Behavior {
    constructor(engine) {
        super();
        this.engine = engine;
        this.isUI = true;
    }

    draw(display) {
        // UI専用レイヤー（Layer 1）を取得
        const layer = display.getLayer(1);
        if (!layer) return;
        const ctx = layer.ctx;
        if (!ctx) return;

        const state = this.engine.state;
        if (!state || !state.player) return;

        const player = state.player;
        const hp = player.hp;
        const maxHp = player.maxhp;
        const hpRatio = Math.max(0, hp / maxHp);

        ctx.save();

        // --- HPゲージの描画 ---
        const barX = 20;
        const barY = 20;
        const barWidth = 150;
        const barHeight = 12;

        // 外枠と背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

        // メインバー
        const color = hpRatio > 0.5 ? '#00cc00' : (hpRatio > 0.2 ? '#cccc00' : '#cc0000');
        ctx.fillStyle = color;
        ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

        // テキスト表示
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px "Courier New", Courier, monospace';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 3;
        ctx.textAlign = 'left';
        ctx.fillText(`LIFE ${Math.ceil(hp)}/${maxHp}`, barX, barY + barHeight + 14);

        // --- 階層（Floor）表示 ---
        ctx.textAlign = 'right';
        ctx.font = 'bold 16px "Courier New", Courier, monospace';
        const floorText = `FLOOR B${state.nowstage + 1}F`;
        ctx.fillText(floorText, display.width - 20, 35);

        // --- DEBUG INFO ---
        ctx.textAlign = 'left';
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        const vp = this.engine.viewport;
        ctx.fillText(`DP: ${display.width}x${display.height} | VP: ${vp.width}x${vp.height}`, 20, 90);
        ctx.fillText(`CAM: ${Math.floor(vp.worldX)},${Math.floor(vp.worldY)}`, 20, 105);
        // ------------------

        ctx.restore();
    }
}
