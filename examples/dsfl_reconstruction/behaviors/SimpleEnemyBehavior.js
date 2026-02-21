import { Behavior } from "../../../src/logic/entity/Behavior.js";

/**
 * @class SimpleEnemyBehavior
 * @description
 * 左右に自動でパトロール移動を行うシンプルな敵AIコンポーネント。
 * 壁にぶつかると反転します。
 */
export class SimpleEnemyBehavior extends Behavior {
    constructor(engine, options = {}) {
        super();
        this.engine = engine;
        this.hp = options.hp || 3;
        this.speed = options.speed || 1.5;
        this.direction = options.direction || 1; // 1: right, -1: left

        this.physics = null;
        this.sprite = null;
    }

    onAttach(entity) {
        super.onAttach(entity);
        this.physics = this.entity.getBehavior("PhysicsBehavior");
        this.sprite = this.entity.getBehavior("SpriteBehavior");

        // Ensure entity starts with initial velocity
        this.entity.vx = this.speed * this.direction;
    }

    update(dt) {
        if (this.hp <= 0) {
            this.entity.alive = false;

            // 撃破エフェクト（爆発っぽい四散）
            if (this.engine.particles) {
                for (let i = 0; i < 20; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1 + Math.random() * 4;
                    this.engine.particles.emit({
                        x: this.entity.x + this.entity.width / 2, // 敵の中心
                        y: this.entity.y + this.entity.height / 2,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 300 + Math.random() * 300,
                        color: Math.random() > 0.5 ? 'rgba(255, 50, 50, 1.0)' : 'rgba(200, 200, 200, 1.0)', // 赤とグレー
                        size: 3 + Math.random() * 5,
                        drag: 0.90,
                        gravity: 0.1 // 少し重力で落ちる
                    });
                }
            }

            // TODO: スコア加算やアイテムドロップなど
            return;
        }

        // 基本は常に前進
        this.entity.vx = this.speed * this.direction;

        // --- 段差（崖）判定 ---
        if (this.physics && this.physics.isGrounded) {
            // 現在の進行方向の少し先、かつ足元の座標
            const probeX = this.direction > 0 ? (this.entity.x + this.entity.width + 2) : (this.entity.x - 2);
            const probeY = this.entity.y + this.entity.height + 2;

            // CollisionSystemに登録されているすべての壁(isSolid)オブジェクトから、
            // probeX, probeY を含むものを探す
            const colSys = this.engine.entities.collision;
            let hasFloorAhead = false;

            if (colSys && colSys.entities) {
                for (let i = 0; i < colSys.entities.length; i++) {
                    const solid = colSys.entities[i];
                    if (solid.isSolid && solid !== this.entity) {
                        // 点(probeX, probeY)がAABB(solid)の内側にあるか判定
                        if (probeX >= solid.x && probeX <= (solid.x + solid.width) &&
                            probeY >= solid.y && probeY <= (solid.y + solid.height)) {
                            hasFloorAhead = true;
                            break;
                        }
                    }
                }
            }

            // 進行方向の足元に床が無ければ反転する
            if (!hasFloorAhead) {
                this.direction *= -1;
                this.entity.vx = this.speed * this.direction;
            }
        }

        // 向きに合わせてスプライトを反転
        if (this.sprite) {
            this.sprite.flipX = (this.direction < 0);
        }
    }

    onCollision(other, colData) {
        // 壁（地形）などの不動オブジェクトに左右からぶつかったら反転
        if (other.isSolid && colData.overlapX < colData.overlapY) {
            this.direction *= -1; // 進行方向を逆にする
            this.entity.vx = this.speed * this.direction;
        }
    }

    /**
     * @method takeDamage
     * 外部からダメージを与える際に呼び出す
     */
    takeDamage(amount) {
        this.hp -= amount;

        // ノックバック処理や点滅（必要に応じて）
        this.entity.vy = -3; // 少し浮く
        this.entity.vx = -this.direction * 2; // 後ろに弾かれる
    }
}
