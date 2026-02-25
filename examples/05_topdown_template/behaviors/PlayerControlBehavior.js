import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * CVBase風のトップダウンプレイヤー操作
 * 8方向移動、Z軸ジャンプ、攻撃方向の固定などを担当
 */
export class PlayerControlBehavior extends Behavior {
    constructor() {
        super();
        this.speed = 2.5; // 移動速度
        this.jumpForce = 7; // ジャンプ力
        this.direction = 0; // 向いている方向 (0:上, 1:右, 2:下, 3:左)
    }

    update(dt) {
        const e = this.entity;
        if (!e || !e.engine) return;
        const input = e.engine.input;

        // X/Y 軸の移動
        e.vx = 0;
        e.vy = 0;

        if (input.isPressed('left')) {
            e.vx = -this.speed;
            this.direction = 3;
        }
        if (input.isPressed('right')) {
            e.vx = this.speed;
            this.direction = 1;
        }
        if (input.isPressed('up')) {
            e.vy = -this.speed;
            this.direction = 0;
        }
        if (input.isPressed('down')) {
            e.vy = this.speed;
            this.direction = 2;
        }

        // 斜め移動時の速度正規化
        if (e.vx !== 0 && e.vy !== 0) {
            e.vx *= Math.SQRT1_2;
            e.vy *= Math.SQRT1_2;
        }

        // ジャンプ (CVBaseではCキー, ここでは 'jump' バインド)
        // 床 (z <= 0) にいる時のみジャンプ可能
        if (input.isDown('jump') && e.z <= 0) {
            e.vz = this.jumpForce;
            if (e.engine && e.engine.sound) {
                // ピヨっというジャンプ音
                // ※音声ファイルをSEとして再生する場合は以下のように記述します:
                // const seBuffer = e.engine.assets.getSound('jump_se_name');
                // if (seBuffer) e.engine.sound.playSE(seBuffer);

                e.engine.sound.playScore("O5 L16 C F", 100, performance.now());
            }
        }

        // アクション (攻撃など)
        if (input.isDown('action1')) {
            // TODO: 攻撃処理（武器の振る舞い呼び出しなど）
            console.log("Attack!");
            if (e.engine && e.engine.sound) {
                // シュッという短い攻撃振り音
                // ※音声ファイルをSEとして再生する場合は以下のように記述します:
                // const seBuffer = e.engine.assets.getSound('attack_se_name');
                // if (seBuffer) e.engine.sound.playSE(seBuffer);

                e.engine.sound.playScore("O6 V10 L32 C", 50, performance.now());
            }
        }

        // 表示の調整（ジャンプ中は影っぽく半透明にする簡易対応）
        const sprite = e.getBehavior('SpriteBehavior');
        if (sprite) {
            sprite.alpha = (e.z > 0) ? 200 : 255;
        }

        // デバッグ表示更新
        this.updateDebugInfo();
    }

    updateDebugInfo() {
        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo && this.entity) {
            const e = this.entity;
            debugInfo.innerHTML = `
                X: ${Math.round(e.x)}, Y: ${Math.round(e.y)}<br>
                Z (Height): ${Math.round(e.z)}<br>
                Dir: ${this.direction}
            `;
        }
    }
}
