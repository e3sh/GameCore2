import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * @class ItemDropBehavior
 * @description アイテムがドロップされた際の初期ベロシティ（拡散やバウンド）を付与し、一定時間での消滅等を管理する。
 */
export class ItemDropBehavior extends Behavior {
    constructor(params = {}) {
        super();
        this.spreadX = params.spreadX || 2.0;
        this.spreadY = params.spreadY || 2.0;
        this.jumpZ = params.jumpZ || 5.0;
        this.lifetime = params.lifetime || -1; // -1は無限
        this.age = 0;
        this.initialized = false;
    }

    onAttach(entity) {
        super.onAttach(entity);
        // ドロップ時の初期速度を設定
        if (!this.initialized) {
            // ランダムに散らばる
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random();
            entity.vx = Math.cos(angle) * this.spreadX * speed;
            entity.vy = Math.sin(angle) * this.spreadY * speed;
            entity.vz = this.jumpZ; // 上に跳ねる

            // 地面に落ちていない状態にする
            entity.z = entity.z || 10; // 少し高い位置から落とす
            this.initialized = true;
        }

        // アイテムとしての識別用フラグ
        entity.isItem = true;
    }

    update(dt) {
        const e = this.entity;
        if (!e) return;

        // 寿命管理
        if (this.lifetime > 0) {
            this.age += dt;
            if (this.age >= this.lifetime) {
                e.alive = false;
            } else if (this.lifetime - this.age < 2000) {
                // 消滅2秒前から点滅させる等の演出（SpriteBehaviorに依存）
                if (e.sprites && e.sprites.length > 0) {
                    e.sprites[0].alpha = Math.floor(this.age / 100) % 2 === 0 ? 1 : 0.3;
                }
            }
        }
    }
}
