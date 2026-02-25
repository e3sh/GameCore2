import { Behavior } from '../../../src/logic/entity/Behavior.js';
import { GameOverScene } from '../scenes/GameOverScene.js';
import { EffectBehavior } from './EffectBehavior.js';

/**
 * プレイヤー（または他のEntity）の体力とダメージ処理を管理するBehavior
 */
export class PlayerCombatBehavior extends Behavior {
    /**
     * @param {number} maxHp - 最大体力
     */
    constructor(maxHp = 100) {
        super();
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.invincibleTimer = 0; // 無敵時間のタイマー
        this.invincibleDuration = 60 * (16.6); // 被弾後の無敵時間(約1秒=60フレーム相当)
        this.isDead = false; // 死亡フラグ
    }

    update(dt) {
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }
    }

    /**
     * ダメージを受ける処理
     * @param {number} amount - ダメージ量
     */
    takeDamage(amount) {
        // 死亡中、または無敵時間中はダメージを受けない
        if (this.isDead || this.invincibleTimer > 0) return;

        this.currentHp -= amount;
        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.die();
        } else {
            // ダメージを受けたら無敵時間開始
            this.invincibleTimer = this.invincibleDuration;

            // EffectBehaviorを用いて点滅させる
            let effect = this.entity.getBehavior('EffectBehavior');
            if (!effect) {
                effect = new EffectBehavior();
                this.entity.addBehavior(effect);
            }
            effect.addBlink(this.invincibleDuration, 100);
        }

        // ダメージパーティクル生成
        if (this.entity && this.entity.engine && this.entity.engine.particleSystem) {
            for (let i = 0; i < 15; i++) {
                this.entity.engine.particleSystem.emit({
                    x: this.entity.x,
                    y: this.entity.y - 10,
                    vx: (Math.random() - 0.5) * 150,
                    vy: (Math.random() - 0.5) * 150 - 50,
                    life: 300 + Math.random() * 200,
                    color: 'red',
                    size: 3 + Math.random() * 4,
                    drag: 0.9,
                    gravity: 200
                });
            }
        }

        // ダメージ音
        // ※音声ファイルをSEとして再生する場合は以下のように記述します:
        // const seBuffer = this.entity.engine.assets.getSound('damage_se_name');
        // if (seBuffer) this.entity.engine.sound.playSE(seBuffer);

        if (this.entity && this.entity.engine && this.entity.engine.sound) {
            this.entity.engine.sound.playScore("T240 V15 O2 L32 C G E C", 50, performance.now());
        }

        console.log(`Player took ${amount} damage. Current HP: ${this.currentHp}/${this.maxHp}`);
    }

    /**
     * 回復する処理
     * @param {number} amount - 回復量
     */
    heal(amount) {
        this.currentHp = Math.min(this.currentHp + amount, this.maxHp);
        console.log(`Player healed ${amount}. Current HP: ${this.currentHp}/${this.maxHp}`);
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        console.log("Entity Died!");

        // 死亡時パーティクル爆発
        if (this.entity && this.entity.engine && this.entity.engine.particleSystem) {
            for (let i = 0; i < 30; i++) {
                this.entity.engine.particleSystem.emit({
                    x: this.entity.x,
                    y: this.entity.y - 10,
                    vx: (Math.random() - 0.5) * 200,
                    vy: (Math.random() - 0.5) * 200 - 50,
                    life: 400 + Math.random() * 300,
                    color: Math.random() > 0.5 ? 'orange' : 'white',
                    size: 3 + Math.random() * 5,
                    drag: 0.95,
                    gravity: 100
                });
            }
        }

        // プレイヤー自身の場合のみ GameOver シーンへ遷移
        if (this.entity && this.entity.engine && this.entity.getBehavior('PlayerControlBehavior')) {
            this.entity.engine.scenes.push(new GameOverScene(this.entity.engine));
        } else {
            // 敵などの場合はEntityを削除
            this.entity.alive = false;
        }
    }

    onCollision(other, colData) {
        // 敵や弾に触れたらダメージを受ける判定
        // NOTE: より高度な判定をする場合は、otherがDamageBehaviorを持っているかなどをチェックする
        if (other.collisionEnabled && other.hasDamage) {
            this.takeDamage(other.damageAmount || 10);
        }
    }
}
