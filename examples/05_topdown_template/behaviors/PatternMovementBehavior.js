import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * 渡されたベクトル(角度)と速度に基づいて直進移動を行う基本Behavior。
 * @class PatternMovementBehavior
 */
export class PatternMovementBehavior extends Behavior {
    /**
     * @param {number} vector - 進行方向（度数法、右を0として時計回り）
     * @param {number} speed - 移動速度
     */
    constructor(vector = 0, speed = 1.0) {
        super();
        this.vector = vector;
        this.speed = speed;
    }

    update(dt) {
        const e = this.entity;
        if (!e) return;

        // 度数法からラジアンへ変換
        const rad = this.vector * (Math.PI / 180);

        // エンティティの速度ベクトルを更新
        // dt/16 の補正は EntityManager 側にあるため、ここではピクセル/フレーム相当のベース速度を設定する
        e.vx = Math.cos(rad) * this.speed;
        e.vy = Math.sin(rad) * this.speed;

        // （SpriteBehavior があれば向きを同期させるなどの拡張が可能）
    }
}
