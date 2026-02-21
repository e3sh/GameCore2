import { CollisionSystem } from '../collision/CollisionSystem.js?v=10';

/**
 * @class Entity
 * @description 全てのゲームオブジェクトの基底クラス。
 */
export class Entity {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.width = 32;
        this.height = 32;
        this.alive = true;
        this.collisionEnabled = true;
        this.color = 'white';
        this.behaviors = [];
    }

    addBehavior(behavior) {
        this.behaviors.push(behavior);
        if (typeof behavior.onAttach === 'function') {
            behavior.onAttach(this);
        }
        return behavior;
    }

    getBehavior(className) {
        return this.behaviors.find(b => b.constructor.name === className);
    }

    getBehaviors(className) {
        return this.behaviors.filter(b => b.constructor.name === className);
    }

    update(dt) {
        this.behaviors.forEach(b => {
            if (b.enabled !== false && typeof b.update === 'function') {
                b.update(dt);
            }
        });
        this.x += this.vx * (dt / 16);
        this.y += this.vy * (dt / 16);
    }

    onCollision(other, colData) {
        this.behaviors.forEach(b => {
            if (b.enabled !== false && typeof b.onCollision === 'function') {
                b.onCollision(other, colData);
            }
        });
    }

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
 * @class EntityManager
 * @description エンティティの生成、更新、描画を管理。
 */
export class EntityManager {
    constructor(engine) {
        this.engine = engine;
        this.entities = [];
        this.collision = new CollisionSystem();
    }

    add(entity) {
        this.entities.push(entity);
        this.collision.register(entity);
    }

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

    draw(display, viewport) {
        this.entities.forEach(e => e.draw(display, viewport));
    }
}
