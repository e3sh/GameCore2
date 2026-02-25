import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * グリッドマップに基づいた効率的な衝突判定を行うBehavior。
 * 高い壁（ジャンプで飛び越えられない）の判定もここで行います。
 */
export class GridCollisionBehavior extends Behavior {
    /**
     * @param {Object} mapData - Tiled形式のレイヤーデータ (data, width, height)
     * @param {number} tileSize - タイルのピクセルサイズ
     */
    constructor(mapData, tileSize = 32) {
        super();
        this.mapData = mapData;
        this.tileSize = tileSize;
        // タイルごとの物理的高さの定義
        // TODO: データから動的に定義できるように拡張可能
        this.tileHeights = {
            1: 100, // 壁（高い、ジャンプで超えられない）
            2: 32,  // 低い壁（ジャンプで超えられる可能性がある高さ）
            0: 0    // 床
        };
    }

    update(dt) {
        const e = this.entity;
        if (!e || !this.mapData) return;

        const halfW = e.width / 2;
        const halfH = e.height / 2;
        const dtFactor = dt / 16.666;

        // X軸方向の判定と押し戻し
        this._checkAxisCollision(e, 'x', e.vx * dtFactor, halfW, halfH);

        // Y軸方向の判定と押し戻し
        this._checkAxisCollision(e, 'y', e.vy * dtFactor, halfW, halfH);
    }

    /**
     * 軸ごとの衝突判定と解決
     * @private
     */
    _checkAxisCollision(e, axis, delta, halfW, halfH) {
        if (delta === 0) return;

        const nextVal = e[axis] + delta;
        const otherAxis = (axis === 'x') ? 'y' : 'x';
        const otherVal = e[otherAxis];

        // 判定ポイント（進行方向の二隅）
        const p1 = {};
        const p2 = {};

        // マージンを設けて角の引っ掛かりを防止
        const margin = 2;

        if (axis === 'x') {
            p1.x = p2.x = (delta > 0) ? nextVal + halfW : nextVal - halfW;
            p1.y = otherVal - halfH + margin;
            p2.y = otherVal + halfH - margin;
        } else {
            p1.y = p2.y = (delta > 0) ? nextVal + halfH : nextVal - halfH;
            p1.x = otherVal - halfW + margin;
            p2.x = otherVal + halfW - margin;
        }

        // どちらかのポイントが「自分の高さ(z)より高い壁」に触れているか
        if (this._isPointSolid(p1.x, p1.y, e.z) || this._isPointSolid(p2.x, p2.y, e.z)) {
            // 衝突！ 速度をゼロにし、Entity側での座標更新を無効化する
            // console.log(`Collision! [${e.constructor.name}] ${axis} wall hit at z=${e.z}`); // 負荷軽減のため必要に応じてON
            e['v' + axis] = 0;

            // タイルの境界に位置を補正する
            const tileIdx = Math.floor(p1[axis] / this.tileSize);
            if (delta > 0) {
                // 正方向への移動中：タイルの左端/上端
                e[axis] = (tileIdx * this.tileSize) - (axis === 'x' ? halfW : halfH) - 0.01;
            } else {
                // 負方向への移動中：タイルの右端/下端
                e[axis] = ((tileIdx + 1) * this.tileSize) + (axis === 'x' ? halfW : halfH) + 0.01;
            }
        }
    }

    /**
     * 指定されたワールド座標・高さにおいて通行不能かどうか
     * @private
     */
    _isPointSolid(x, y, z) {
        const tx = Math.floor(x / this.tileSize);
        const ty = Math.floor(y / this.tileSize);
        const tileId = this.getTileId(tx, ty);
        const wallHeight = this.tileHeights[tileId] || 0;

        // タイルの高さが Entity の高さ(z) より高い場合は衝突
        return wallHeight > z;
    }

    /**
     * グリッド座標からタイルIDを取得
     * @private
     */
    getTileId(tx, ty) {
        // mapData が渡されていない場合はエンジンから取得を試みる
        const map = this.mapData || (this.entity && this.entity.engine ? this.entity.engine.collisionMap : null);
        if (!map) return 0;

        const width = map.width;
        const height = map.height;
        if (tx < 0 || tx >= width || ty < 0 || ty >= height) return 1; // 枠外は壁扱い

        const data = map.data;
        return data[ty * width + tx];
    }
}
