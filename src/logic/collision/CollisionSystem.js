/**
 * AABBベースのエンティティ間の衝突判定を管理・実行するシステム。
 * @class CollisionSystem
 */
export class CollisionSystem {
    /**
     * @constructor
     */
    constructor() {
        this.entities = [];
    }

    /**
     * 衝突判定の対象としてEntityを登録します。
     * @method register
     * @param {Entity} entity
     */
    register(entity) {
        if (!this.entities.includes(entity)) {
            this.entities.push(entity);
        }
    }

    /**
     * 衝突判定の対象からEntityを解除します。
     * @method unregister
     * @param {Entity} entity
     */
    unregister(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }

    /**
     * 登録された全ての有効なEntity間で総当たりによる矩形衝突判定を実行します。
     * 衝突を検知した場合、各Entityの onCollision を発火させます。
     * @method checkCollisions
     */
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

    /**
     * 2つのEntityのAABB（Axis-Aligned Bounding Box）をもとに詳細な衝突情報を計算します。
     * @method getCollisionData
     * @param {Entity} a - 判定対象A
     * @param {Entity} b - 判定対象B
     * @returns {{overlapX: number, overlapY: number, dx: number, dy: number}|null} 衝突していればその詳細、していなければnull
     */
    getCollisionData(a, b) {
        // トップビューなどのZ軸を考慮した判定
        // Z座標の差が大きい場合（例：ジャンプ中など）は衝突していないとみなす。
        // （サイドビューの場合はz=0が保たれるためこの判定をパスする想定）
        const zThreshold = 20; // 衝突とみなす高さの許容差
        if (Math.abs((a.z || 0) - (b.z || 0)) > zThreshold) {
            return null; // 高さが違いすぎるため衝突しない
        }

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
