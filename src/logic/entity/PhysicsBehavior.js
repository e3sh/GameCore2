import { Behavior } from './Behavior.js';

/**
 * @class PhysicsBehavior
 * @description 重力や摩擦などの物理演算をエンティティに適用する。
 */
export class PhysicsBehavior extends Behavior {
    constructor(params = {}) {
        super();
        this.gravity = params.gravity || 0.5;
        this.friction = params.friction || 0.98;
        this.bounce = params.bounce || 0;
        this.isGrounded = false;
        this._nextGrounded = false;
        // 以前の groundY は廃止し、実際の地形との衝突に依存する
    }

    update(dt) {
        const e = this.entity;
        if (!e) return;

        // 前回フレームでの接地判定を確定させ、次への準備をする
        this.isGrounded = this._nextGrounded;
        this._nextGrounded = false;

        // 重力の適用
        e.vy += this.gravity * (dt / 16);

        // 画面外落下へのフォールバック（デバッグ用）
        if (e.y > 2000) {
            e.y = 0;
            e.vy = 0;
        }
    }

    onCollision(other, colData) {
        const e = this.entity;
        if (!e || !other.isSolid || !colData) return;

        // AABBめり込み解決法 (Penetration Resolution)
        // めり込みが浅い軸の方へ押し出す
        if (colData.overlapX < colData.overlapY) {
            // X軸（左右）の衝突
            if (colData.dx > 0) {
                e.x += colData.overlapX; // 右へ押し出す
            } else {
                e.x -= colData.overlapX; // 左へ押し出す
            }
            e.vx = 0;
        } else {
            // Y軸（上下）の衝突
            if (colData.dy > 0) {
                // 天井にぶつかった (下へ押し出す)
                e.y += colData.overlapY;
                if (e.vy < 0) e.vy = 0;
            } else {
                // 床に着地した (上へ押し出す)
                e.y -= colData.overlapY;
                if (e.vy > 0) e.vy *= -this.bounce;
                e.vx *= this.friction; // 接地時のみ摩擦を強く適用
                if (Math.abs(e.vy) < 0.2) e.vy = 0;
                this._nextGrounded = true;
            }
        }
    }
}
