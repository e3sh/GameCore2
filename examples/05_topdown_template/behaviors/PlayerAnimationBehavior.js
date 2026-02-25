import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * プレイヤーの状態（移動方向など）に基づいてスプライトのパターンを切り替えるBehavior
 */
export class PlayerAnimationBehavior extends Behavior {
    constructor() {
        super();
        this.currentAnim = "Mayura_Down";
        // アニメーションプレフィックス (向きに対応: 0=up, 1=right, 2=down, 3=left)
        this.directionMap = {
            0: "Mayura_Up",
            1: "Mayura_Right",
            2: "Mayura_Down",
            3: "Mayura_Left"
        };
    }

    update(dt) {
        const e = this.entity;
        if (!e) return;

        // PlayerControlBehavior から方向を取得
        const control = e.getBehavior('PlayerControlBehavior');
        const sprite = e.getBehavior('SpriteBehavior');

        if (control && sprite) {
            const dir = control.direction;
            let nextAnim = this.directionMap[dir] || "Mayura_Down";

            // TODO: 今後攻撃中(action1)などの状態が取れるようになったら優先して切り替える

            if (this.currentAnim !== nextAnim) {
                this.currentAnim = nextAnim;
                sprite.patternId = this.currentAnim;
                sprite.frameIndex = 0;
                sprite.animTimer = 0;
            }
        }
    }
}
