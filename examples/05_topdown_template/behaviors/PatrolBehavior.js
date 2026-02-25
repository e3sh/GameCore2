import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * @class PatrolBehavior
 * @description
 * 左右に移動を続ける徘徊AI。
 * 進行方向に壁がある場合、または進行方向の足元に床がない（崖）場合に反転する。
 */
export class PatrolBehavior extends Behavior {
    /**
     * @param {number} speed 移動速度
     * @param {number} direction 初期進行方向 (1: 右, -1: 左)
     */
    constructor(speed = 1.0, direction = -1) {
        super();
        this.speed = speed;
        this.direction = direction; // 1 or -1
    }

    update(dt) {
        const e = this.entity;
        if (!e || !e.engine) return;

        // 進行方向の壁と床をチェック
        const wallCheck = this.checkCollision(
            e.x + (e.width / 2) * this.direction + this.direction * 4,
            e.y
        );

        const floorCheck = this.checkCollision(
            e.x + (e.width / 2) * this.direction + this.direction * 4,
            e.y + (e.height / 2) + 4
        );

        // 前方に壁がある、または前方の足元に床がない場合は反転
        if (wallCheck || !floorCheck) {
            this.direction *= -1; // 反転
        }

        // 速度を適用
        e.vx = this.speed * this.direction;

        // 向いている方向(ラジアン->度)を更新 (右が0度, 左が180度想定)
        e.vector = this.direction === 1 ? 0 : 180;
    }

    /**
     * 指定された座標(x, y)にisSolidなエンティティが存在するか(ポイント判定)
     */
    checkCollision(x, y) {
        const e = this.entity;
        for (const other of e.engine.entities.entities) {
            if (other === e || !other.isSolid || !other.alive) continue;

            // Z高さが大きく違うものは無視
            if (Math.abs((e.z || 0) - (other.z || 0)) > 1) continue;

            const halfW = (other.width || 32) / 2;
            const halfH = (other.height || 32) / 2;

            if (
                x >= other.x - halfW && x <= other.x + halfW &&
                y >= other.y - halfH && y <= other.y + halfH
            ) {
                return true;
            }
        }
        return false;
    }
}
