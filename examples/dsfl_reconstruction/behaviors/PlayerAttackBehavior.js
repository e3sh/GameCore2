import { Behavior } from "../../../src/logic/entity/Behavior.js";
import { Entity } from "../../../src/logic/entity/EntityManager.js";
import { PhysicsBehavior } from "../../../src/logic/entity/PhysicsBehavior.js";
import { HitboxBehavior } from "./HitboxBehavior.js";

/**
 * @class PlayerAttackBehavior
 * @description
 * プレイヤーが「Attack」キーを押した際に前方に攻撃判定(Hitbox)を生成する機能。
 */
export class PlayerAttackBehavior extends Behavior {
    constructor(engine) {
        super();
        this.engine = engine;
        this.input = null;
        this.sprite = null;

        // 攻撃のクールダウン管理用
        this.attackCooldown = 0;
        this.attackRate = 20; // 攻撃間隔（フレーム数）
    }

    onAttach(entity) {
        super.onAttach(entity);
        this.input = this.engine.input;
        this.sprite = this.entity.getBehavior("SpriteBehavior");
    }

    update(dt) {
        if (!this.input) return;

        // クールダウンの消化
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        // 攻撃入力の検知
        if (this.input.isDown('Attack') && this.attackCooldown <= 0) {
            this.performAttack();
        }
    }

    performAttack() {
        this.attackCooldown = this.attackRate;

        // 向いている方向を判定 (SpriteBehaviorのflipXに依存)
        const direction = (this.sprite && this.sprite.flipX) ? -1 : 1;

        // 攻撃判定エンティティの生成
        const hitboxEntity = new Entity();
        hitboxEntity.width = 32;  // 当たり判定の幅
        hitboxEntity.height = 32; // 当たり判定の高さ

        // 判定自身の位置（プレイヤーの少し前方に発生させる）
        // GameCoreの衝突判定システムの中心は entity.x, entity.y と一致するため
        // そのままプレイヤーの中心から前方にズラすだけでOK
        const offsetX = direction === 1 ? this.entity.width : -hitboxEntity.width;

        hitboxEntity.x = this.entity.x + offsetX;
        hitboxEntity.y = this.entity.y;

        // 透明なエンティティだが、デバッグ用に色を付けることも可能
        hitboxEntity.color = "rgba(255, 255, 0, 0.5)"; // 半透明な黄色

        // 物理挙動をアタッチ (重力OFFで空中に停滞させる)
        const hitPhysics = new PhysicsBehavior({ gravity: 0, friction: 1, bounce: 0 });
        hitboxEntity.addBehavior(hitPhysics);

        // HitboxBehaviorをアタッチ
        hitboxEntity.addBehavior(new HitboxBehavior(this.engine, {
            damage: 1,
            lifeTime: 8, // 短時間だけ判定が残る
            owner: this.entity
        }));

        // エンティティマネージャーに登録
        this.engine.entities.add(hitboxEntity);

        // [拡張] ここで攻撃中のアニメーションを再生したり、SEを鳴らす処理を追加できる
    }
}
