import { Behavior } from '../../../src/logic/entity/Behavior.js';
import { Entity } from '../../../src/logic/entity/EntityManager.js';
import { TextBehavior } from '../../../src/logic/entity/TextBehavior.js';
import { PopupTextBehavior } from './PopupTextBehavior.js';

/**
 * @class PlayerInventoryBehavior
 * @description プレイヤーが取得したアイテムの管理と、アイテムEntityとの接触(Collision)時の処理を行う。
 */
export class PlayerInventoryBehavior extends Behavior {
    constructor() {
        super();
        this.items = {}; // { itemId: count }
    }

    onCollision(other, colData) {
        const e = this.entity;
        if (!e || !other) return;

        // 相手がアイテムかどうか判定
        if (other.isItem && other.alive) {
            const itemId = other.itemId || 'unknown_item';

            // アイテムを取得
            this.addItem(itemId, 1);

            // UIに通知するなどのイベントフック（HUD等との連携用）
            if (e.engine && e.engine.onItemCollected) {
                e.engine.onItemCollected(itemId);
            }

            // 特殊効果（即時発動）の処理
            this.applyItemEffect(other);

            // 取得したアイテムEntityを削除
            other.alive = false;

            // ポップアップテキスト生成
            this.spawnPopupText(other.x, other.y - 16, `Get ${itemId}!`);

            // アイテム取得パーティクル生成
            if (e.engine && e.engine.particleSystem) {
                for (let i = 0; i < 10; i++) {
                    e.engine.particleSystem.emit({
                        x: other.x,
                        y: other.y - 10,
                        vx: (Math.random() - 0.5) * 100,
                        vy: (Math.random() - 1.0) * 150,
                        life: 200 + Math.random() * 200,
                        color: 'yellow',
                        size: 2 + Math.random() * 2,
                        drag: 0.95,
                        gravity: 300
                    });
                }
            }

            // アイテム取得音
            // ※音声ファイルをSEとして再生する場合は以下のように記述します:
            // const seBuffer = e.engine.assets.getSound('item_se_name');
            // if (seBuffer) e.engine.sound.playSE(seBuffer);

            if (e.engine && e.engine.sound) {
                e.engine.sound.playScore("V15 O5 L16 C E G O6 C", 50, performance.now());
            }
        }
    }

    spawnPopupText(x, y, text) {
        const e = this.entity;
        if (!e || !e.engine) return;

        const popup = new Entity();
        popup.x = x;
        popup.y = y;
        popup.zOrder = 100; // 手前に表示
        popup.addBehavior(new TextBehavior({
            text: text,
            font: '12px monospace',
            color: 'rgba(255, 255, 0, 1.0)',
            align: 'center'
        }));
        popup.addBehavior(new PopupTextBehavior({ lifetime: 45, floatSpeed: 0.8 }));
        e.engine.entities.add(popup);
    }

    addItem(itemId, count = 1) {
        if (!this.items[itemId]) {
            this.items[itemId] = 0;
        }
        this.items[itemId] += count;
        console.log(`[Inventory] Obtained ${itemId}. Total: ${this.items[itemId]}`);
    }

    removeItem(itemId, count = 1) {
        if (this.items[itemId]) {
            this.items[itemId] -= count;
            if (this.items[itemId] < 0) this.items[itemId] = 0;
        }
    }

    getItemCount(itemId) {
        return this.items[itemId] || 0;
    }

    applyItemEffect(itemEntity) {
        const e = this.entity;
        const pcb = e.getBehavior('PlayerCombatBehavior');

        switch (itemEntity.itemId) {
            case 'potion_hp':
                // HP回復
                if (pcb) {
                    pcb.heal(itemEntity.healAmount || 20);
                }
                break;
            case 'coin':
                // スコアや所持金加算（必要に応じて）
                break;
            // その他のアイテム効果
        }
    }
}
