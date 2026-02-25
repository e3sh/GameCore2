import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * @class EffectBehavior
 * @description
 * Entityの各種パラメータ（Spriteのアルファ値やカラー指定など）を時間経過で変化させる汎用エフェクトコンポーネント。
 */
export class EffectBehavior extends Behavior {
    constructor() {
        super();
        this.effects = [];
    }

    /**
     * 点滅(Blink)エフェクトを追加する
     * @param {number} duration エフェクトの総時間(ミリ秒)
     * @param {number} interval 点滅の間隔(ミリ秒)
     */
    addBlink(duration, interval = 100) {
        this.effects.push({
            type: 'blink',
            timer: duration,
            interval: interval
        });
    }

    update(dt) {
        if (this.effects.length === 0) return;

        const sprite = this.entity.getBehavior('SpriteBehavior');
        if (!sprite) return;

        let alphaApplied = false;

        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.timer -= dt;

            if (effect.timer <= 0) {
                this.effects.splice(i, 1);
                // エフェクト終了時にリセット
                if (effect.type === 'blink') {
                    sprite.alpha = 255;
                }
                continue;
            }

            if (effect.type === 'blink') {
                sprite.alpha = (Math.floor(effect.timer / effect.interval) % 2 === 0) ? 255 : 100;
                alphaApplied = true;
            }
        }

        // もし複数のエフェクトがあり、Blinkが適用されなかった場合は元に戻す(安全策)
        if (!alphaApplied && this.effects.every(e => e.type !== 'blink')) {
            sprite.alpha = 255;
        }
    }
}
