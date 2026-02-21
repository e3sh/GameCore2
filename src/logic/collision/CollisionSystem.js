/**
 * @class CollisionSystem
 * @description
 * エンティティ間の衝突判定を管理。
 */
export class CollisionSystem {
    constructor() {
        this.entities = [];
    }

    register(entity) {
        if (!this.entities.includes(entity)) {
            this.entities.push(entity);
        }
    }

    unregister(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }

    checkCollisions() {
        for (let i = 0; i < this.entities.length; i++) {
            for (let j = i + 1; j < this.entities.length; j++) {
                const a = this.entities[i];
                const b = this.entities[j];

                if (a.collisionEnabled && b.collisionEnabled) {
                    const colData = this.getCollisionData(a, b);
                    if (colData) {
                        a.onCollision(b, {
                            overlapX: colData.overlapX,
                            overlapY: colData.overlapY,
                            dx: colData.dx,
                            dy: colData.dy
                        });
                        b.onCollision(a, {
                            overlapX: colData.overlapX,
                            overlapY: colData.overlapY,
                            dx: -colData.dx,
                            dy: -colData.dy
                        });
                    }
                }
            }
        }
    }

    getCollisionData(a, b) {
        const aHalfW = (a.width || 32) / 2;
        const aHalfH = (a.height || 32) / 2;
        const bHalfW = (b.width || 32) / 2;
        const bHalfH = (b.height || 32) / 2;

        const aCenterX = a.x + aHalfW;
        const aCenterY = a.y + aHalfH;
        const bCenterX = b.x + bHalfW;
        const bCenterY = b.y + bHalfH;

        const dx = aCenterX - bCenterX;
        const dy = aCenterY - bCenterY;

        const overlapX = aHalfW + bHalfW - Math.abs(dx);
        const overlapY = aHalfH + bHalfH - Math.abs(dy);

        if (overlapX > 0 && overlapY > 0) {
            return { overlapX, overlapY, dx, dy };
        }
        return null;
    }
}
