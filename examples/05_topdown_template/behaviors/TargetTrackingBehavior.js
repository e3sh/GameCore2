import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * 指定したターゲットを一定の速度で追尾するBehavior。
 * @class TargetTrackingBehavior
 */
export class TargetTrackingBehavior extends Behavior {
    /**
     * @param {Entity} target - 追尾対象
     * @param {number} speed - 追尾時の移動速度
     * @param {number} trackingDistance - この距離内に近づいた時のみ追尾する(0で常に追尾)
     */
    constructor(target = null, speed = 1.0, trackingDistance = 0) {
        super();
        this.target = target;
        this.speed = speed;
        this.trackingDistance = trackingDistance;
    }

    update(dt) {
        const e = this.entity;
        // ターゲットが設定されていない、または死亡しているなら停止
        if (!e || !this.target || !this.target.alive) {
            e.vx = 0;
            e.vy = 0;
            return;
        }

        const dx = this.target.x - e.x;
        const dy = this.target.y - e.y;
        const distSq = dx * dx + dy * dy;

        // 距離チェック
        if (this.trackingDistance > 0 && distSq > this.trackingDistance * this.trackingDistance) {
            e.vx = 0;
            e.vy = 0;
            return;
        }

        // 追尾処理(正規化して速度計算)
        if (distSq > 0) {
            const dist = Math.sqrt(distSq);
            e.vx = (dx / dist) * this.speed;
            e.vy = (dy / dist) * this.speed;

            // 回転を同期(右が0度)
            const rad = Math.atan2(dy, dx);
            e.vector = rad * (180 / Math.PI);
        }
    }
}
