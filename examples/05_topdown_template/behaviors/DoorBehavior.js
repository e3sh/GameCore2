import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * 鍵などの条件を満たすと開く（消滅する）ドアのBehavior
 */
export class DoorBehavior extends Behavior {
    /**
     * @param {string} requiredKey - 開錠に必要な鍵のID (null なら鍵不要)
     */
    constructor(requiredKey = null) {
        super();
        this.requiredKey = requiredKey;
        this.isOpen = false;
    }

    onAttach(entity) {
        super.onAttach(entity);
        // ドアは最初は通行不可
        entity.isSolid = true;
    }

    /**
     * プレイヤーが触れたときに呼ばれ、条件判定をしてドアを開く
     * @param {Entity} player 
     */
    tryOpen(player) {
        if (this.isOpen) return;

        // 鍵穴のチェックが必要か？
        if (this.requiredKey) {
            // TODO: PlayerInventoryBehaviorなどで鍵を持っているかチェックする
            const hasKey = true; // 仮で常に持っていることにしておく
            if (!hasKey) {
                console.log(`Door requires key: ${this.requiredKey}`);
                return;
            }
        }

        this.open();
    }

    open() {
        this.isOpen = true;
        this.entity.isSolid = false; // 通行可能にする
        console.log("Door opened!");

        // 演出：スプライトを変えるか、Entityを削除する
        // 今回は単純にEntityの描画と当たり判定を消す
        const sprite = this.entity.getBehavior('SpriteBehavior');
        if (sprite) {
            sprite.enabled = false;
        }

        // DebugHitboxがあればそれを消す
        const debug = this.entity.getBehavior('DebugHitboxBehavior');
        if (debug) {
            debug.enabled = false;
        }

        // ドア破壊パーティクル
        if (this.entity && this.entity.engine && this.entity.engine.particleSystem) {
            for (let i = 0; i < 20; i++) {
                this.entity.engine.particleSystem.emit({
                    x: this.entity.x,
                    y: this.entity.y,
                    vx: (Math.random() - 0.5) * 150,
                    vy: (Math.random() - 1.0) * 150,
                    life: 300 + Math.random() * 200,
                    color: '#8B4513', // 茶色
                    size: 3 + Math.random() * 4,
                    drag: 0.9,
                    gravity: 400
                });
            }
        }

        // あるいは this.entity.alive = false; にして完全に消去してもよい
    }

    onCollision(other, colData) {
        // プレイヤーであることを確認
        if (typeof other.getBehavior === 'function' && other.getBehavior('PlayerControlBehavior')) {
            this.tryOpen(other);
        }
    }
}
