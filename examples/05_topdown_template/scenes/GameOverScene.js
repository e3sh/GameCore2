import { BaseScene } from '../../../src/logic/scene/SceneSystem.js';

export class GameOverScene extends BaseScene {
    constructor(engine) {
        super(engine);
    }

    async init() {
        console.log("GameOverScene initialized.");
        this.timer = 0;
    }

    onEnter() {
        // バックグラウンドで動いている他のキャラクターたちをフリーズさせる
        this.engine.entities.updateEnabled = false;
        // （もしパーティクルシステムなどもフリーズさせたい場合は同様に追加可能）
    }

    onExit() {
        // 元に戻す（通常はリロードされるので呼ばれないが安全のため）
        this.engine.entities.updateEnabled = true;
    }

    update(dt) {
        super.update(dt);
        this.timer += dt;

        // SpaceキーまたはEnterキー、あるいは一定時間経過でタイトルに戻る
        const isAction = this.engine.input.isDown('action1') || this.engine.input.isDown('jump');
        if (isAction || this.timer > 3000) {
            // 現在のシーン (GameOver) とその下のシーン (GameScene) を破棄してTitleへ
            // （現状は簡易的に配列を空にして新しいTitleSceneを入れるかリロードで代用）
            window.location.reload(); // CVBase等での簡易リセット手法に倣う
        }
    }

    draw(display, viewport) {
        super.draw(display, viewport);

        // UIレイヤーに「GAME OVER」テキストを描画
        const ctx = display.getLayer(1).ctx;
        if (!ctx) return;

        display.getLayer(1).clear(); // 一旦UIレイヤーをクリアする

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // 半透明の黒背景を加える
        ctx.fillRect(0, 0, display.width, display.height);

        ctx.fillStyle = 'red';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("GAME OVER", display.width / 2, display.height / 2);

        // 点滅するテキスト
        if (Math.floor(this.timer / 500) % 2 === 0) {
            ctx.fillStyle = 'white';
            ctx.font = '16px monospace';
            ctx.fillText("Press Action Key to Restart", display.width / 2, display.height / 2 + 30);
        }
        ctx.restore();
    }
}
