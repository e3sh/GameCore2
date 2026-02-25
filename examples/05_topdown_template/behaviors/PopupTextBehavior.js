import { Behavior } from '../../../src/logic/entity/Behavior.js';
import { TextBehavior } from '../../../src/logic/entity/TextBehavior.js';

/**
 * @class PopupTextBehavior
 * @description 一定時間上に移動しながらフェードアウトし、その後エンティティを削除するBehavior。
 * TextBehaviorと併用されることを想定。
 */
export class PopupTextBehavior extends Behavior {
    constructor(params = {}) {
        super();
        this.lifetime = params.lifetime || 60; // フレーム単位の寿命 (約1秒)
        this.age = 0;
        this.floatSpeed = params.floatSpeed || 0.5;
    }

    update(dt) {
        const e = this.entity;
        if (!e) return;

        // 上に浮かせる
        e.y -= this.floatSpeed * (dt / 16);

        // テキストのアルファ値を変更してフェードアウト
        const textBehavior = e.getBehavior('TextBehavior');
        if (textBehavior && textBehavior.color.startsWith('rgba')) {
            const alpha = Math.max(0, 1.0 - (this.age / this.lifetime));
            textBehavior.color = textBehavior.color.replace(/[\d.]+\)$/, `${alpha})`);
        }

        this.age += (dt / 16);
        if (this.age >= this.lifetime) {
            e.alive = false;
        }
    }
}
