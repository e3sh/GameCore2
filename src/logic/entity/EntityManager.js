import { CollisionSystem } from '../collision/CollisionSystem.js?v=10';

/**
 * 全てのゲームオブジェクトの基底クラス。
 * Behavior（コンポーネント）を追加することで機能が拡張されます。
 * @class Entity
 */
export class Entity {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0; // 高さ
        this.vx = 0;
        this.vy = 0;
        this.vz = 0; // 高さの速度
        this.width = 32;
        this.height = 32;
        this.alive = true;
        this.collisionEnabled = true;
        this.color = 'white';
        this.behaviors = [];
        this.zOrder = 0; // 基本の描画順
        this.engine = null; // EntityManagerからセットされる
    }

    /**
     * Entityに新しいBehavior（コンポーネント）を追加します。
     * @method addBehavior
     * @param {Behavior} behavior - 追加するBehaviorインスタンス
     * @returns {Behavior} 追加したインスタンス
     */
    addBehavior(behavior) {
        this.behaviors.push(behavior);
        if (typeof behavior.onAttach === 'function') {
            behavior.onAttach(this);
        }
        return behavior;
    }

    /**
     * 指定されたクラス名を持つ最初のBehaviorを取得します。
     * @method getBehavior
     * @param {string} className - クラス名（例："SpriteBehavior"）
     * @returns {Behavior|undefined} 見つかったBehavior
     */
    getBehavior(className) {
        return this.behaviors.find(b => b.constructor.name === className);
    }

    /**
     * 指定されたクラス名を持つ全てのBehaviorの配列を取得します。
     * @method getBehaviors
     * @param {string} className - クラス名
     * @returns {Behavior[]}
     */
    getBehaviors(className) {
        return this.behaviors.filter(b => b.constructor.name === className);
    }

    /**
     * Entityおよび追加された全ての有効なBehaviorを更新します。
     * @method update
     * @param {number} dt - デルタタイム
     */
    update(dt) {
        this.behaviors.forEach(b => {
            if (b.enabled !== false && typeof b.update === 'function') {
                b.update(dt);
            }
        });
        this.x += this.vx * (dt / 16);
        this.y += this.vy * (dt / 16);
    }

    /**
     * 衝突判定システムから衝突検知時に呼び出されます。
     * 全ての有効なBehaviorに衝突イベントを伝播させます。
     * @method onCollision
     * @param {Entity} other - 衝突相手
     * @param {Object} colData - 衝突の詳細情報
     */
    onCollision(other, colData) {
        this.behaviors.forEach(b => {
            if (b.enabled !== false && typeof b.onCollision === 'function') {
                b.onCollision(other, colData);
            }
        });
    }

    /**
     * EntityおよびそのBehaviorを描画します。
     * @method draw
     * @param {DisplayManager} display - 描画管理システム
     * @param {Viewport} viewport - ゲームカメラ
     */
    draw(display, viewport) {
        let drawHandled = false;

        // 全てのBehaviorに描画を委譲
        this.behaviors.forEach(b => {
            if (b.enabled !== false) {
                if (typeof b.draw === 'function') {
                    b.draw(display, viewport);
                    drawHandled = true;
                } else if (typeof b.render === 'function') {
                    // WindowBehavior 向け: 簡易的な描画フォールバック
                    const isUI = this.behaviors.some(ub => ub.isUI);
                    let drawX = this.x;
                    let drawY = this.y;

                    if (!isUI) {
                        const screenPos = viewport.worldToScreen(drawX, drawY);
                        drawX = screenPos.x;
                        drawY = screenPos.y;
                    }

                    const layer = display.getLayer(isUI ? 1 : 0);
                    b.render(layer.ctx, drawX, drawY, this);
                    drawHandled = true;
                }
            }
        });

        // どのBehaviorも描画を行わなかった場合、デフォルトの矩形を表示
        if (!drawHandled) {
            const isUI = this.behaviors.some(b => b.isUI);
            let drawX = this.x;
            let drawY = this.y;

            if (!isUI) {
                const screenPos = viewport.worldToScreen(drawX, drawY);
                drawX = screenPos.x;
                drawY = screenPos.y;
            }

            const layer = display.getLayer(isUI ? 1 : 0);
            layer.ctx.fillStyle = this.color;
            // 描画の中心座標と実座標を合わせるためのオフセット調整 (SpriteBehavior準拠)
            layer.ctx.fillRect(drawX - this.width / 2, drawY - this.height / 2, this.width, this.height);
        }
    }
}

/**
 * エンティティの生成、更新、描画をライフサイクルとして管理するコンテナクラス。
 * @class EntityManager
 */
export class EntityManager {
    constructor(engine) {
        this.engine = engine;
        this.entities = [];
        this.collision = new CollisionSystem();
    }

    /**
     * 新しいEntityを管理下に追加し、衝突判定システムにも登録します。
     * @method add
     * @param {Entity} entity
     */
    add(entity) {
        entity.engine = this.engine;
        this.entities.push(entity);
        this.collision.register(entity);
    }

    /**
     * 登録された全ての有効なEntityの更新処理、及び衝突判定を実行します。
     * 死亡フラグが立ったEntityは除外されます。
     * @method update
     * @param {number} dt - デルタタイム
     */
    update(dt) {
        this.entities = this.entities.filter(e => {
            if (!e.alive) {
                this.collision.unregister(e);
                return false;
            }
            return true;
        });

        this.entities.forEach(e => e.update(dt));

        // 衝突判定の実行
        this.collision.checkCollisions();
    }

    /**
     * 全ての有効なEntityの描画メソッドを呼び出します。
     * @method draw
     * @param {DisplayManager} display 
     * @param {Viewport} viewport 
     */
    draw(display, viewport) {
        // 描画順のソート
        // 基本的には zOrder (デフォルト0) でソートする。
        // トップビューの場合かつ zOrder が同じなら、画面下（y が大きい）ものを手前に描画するよう Y ソートをかける。
        const sortedEntities = this.entities.slice().sort((a, b) => {
            if (a.zOrder !== b.zOrder) {
                return a.zOrder - b.zOrder;
            }
            if (this.engine.viewMode === 'top') {
                return a.y - b.y;
            }
            return 0;
        });

        sortedEntities.forEach(e => e.draw(display, viewport));
    }
}
