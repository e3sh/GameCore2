import { Behavior } from "../../../src/logic/entity/Behavior.js";
import { Entity } from "../../../src/logic/entity/EntityManager.js";

/**
 * @class HitboxBehavior
 * @description
 * 攻撃判定を持つ見えない（あるいはエフェクトだけの）エンティティ用のBehavior。
 * 指定時間が経過するか、敵に当たると消滅します。
 */
export class HitboxBehavior extends Behavior {
    constructor(engine, options = {}) {
        super();
        this.engine = engine;
        this.damage = options.damage || 1;
        this.lifeTime = options.lifeTime || 10; // フレーム数（おおよその持続時間）
        this.owner = options.owner || null;     // 攻撃の主（自分自身には当たらないようにする）

        this._age = 0;
        this.hasHit = false; // 多段ヒット防止
    }

    onAttach(entity) {
        super.onAttach(entity);
        // PhysicsBehaviorがないと衝突判定が発生しないため、もし無ければ追加するか前提とする
        // 今回の呼び出し側でPhysicsBehaviorをアタッチする想定
    }

    update(dt) {
        this._age++;

        if (this._age > this.lifeTime || this.hasHit) {
            // 寿命が尽きた、あるいは既にヒットしたなら消滅
            this.entity.alive = false;
        }
    }

    onCollision(other, colData) {
        if (this.hasHit) return;
        if (other === this.owner) return; // 攻撃した本人には当たらない

        // Entity以外のオブジェクト（マップチップ等）との衝突は無視
        if (!(other instanceof Entity)) return;

        // 相手が SimpleEnemyBehavior を持っているか判定
        const enemyBehavior = other.getBehavior("SimpleEnemyBehavior");
        if (enemyBehavior) {
            enemyBehavior.takeDamage(this.damage);
            this.hasHit = true; // 1回の攻撃判定で複数回ダメージが連続で入るのを防ぐ

            // ヒットエフェクト（火花）の発生
            if (this.engine.particles) {
                for (let i = 0; i < 8; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 2 + Math.random() * 3;
                    this.engine.particles.emit({
                        x: other.x + other.width / 2, // 敵の中心から
                        y: other.y + other.height / 2,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 200 + Math.random() * 150,
                        color: 'rgba(255, 200, 50, 1.0)', // オレンジ/黄色の火花
                        size: 2 + Math.random() * 3,
                        drag: 0.92,
                        gravity: 0.2
                    });
                }
            }

            // ヒット時に消滅（貫通させたい場合は消滅させない設定も可能）
            this.entity.alive = false;
        }
    }
}
