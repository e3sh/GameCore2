import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * 2次元配列マップデータに基づいて、タイル背景を一度に描画するBehavior
 */
export class TilemapRendererBehavior extends Behavior {
    /**
     * @param {GameCore} engine 
     * @param {number[][]} mapData 
     * @param {number} tileSize 
     */
    constructor(engine, mapData, tileSize = 32) {
        super();
        this.engine = engine;
        this.mapData = mapData;
        this.tileSize = tileSize;
        // zOrderはEntity側で設定
    }

    draw(display, viewport) {
        if (!this.mapData) return;

        const ptn = this.engine.sprite.patterns.get('Floor');
        if (!ptn || !ptn.frames || ptn.frames.length < 1) return;

        const frame = ptn.frames[0];
        const img = this.engine.assets.getImage(ptn.imageKey);
        if (!img) return;

        const layer = display.getLayer(0);

        // mapData が 2次元配列ではなく、Tiledの { data: [], width: number, height: number } 形式だった場合の対応
        let rows, cols;
        let getTileId;

        if (Array.isArray(this.mapData) && Array.isArray(this.mapData[0])) {
            rows = this.mapData.length;
            cols = this.mapData[0].length;
            getTileId = (x, y) => this.mapData[y][x];
        } else if (this.mapData.data && this.mapData.width) {
            cols = this.mapData.width;
            rows = this.mapData.height || Math.ceil(this.mapData.data.length / cols);
            getTileId = (x, y) => this.mapData.data[y * cols + x];
        } else {
            return;
        }

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tileId = getTileId(x, y);
                if (tileId !== undefined) {
                    // タイルIDに対応するパターン名を取得
                    // ID 0=Floor, 1=Wall(High), 2=LowWall
                    const patternName = (tileId === 1) ? 'Wall' : (tileId === 2) ? 'LowWall' : 'Floor';

                    const targetPtn = this.engine.sprite.patterns.get(patternName);
                    if (!targetPtn || !targetPtn.frames[0]) continue;

                    const targetFrame = targetPtn.frames[0];
                    const worldX = x * this.tileSize;
                    const worldY = y * this.tileSize;

                    const screenPos = viewport.worldToScreen(worldX, worldY);

                    if (screenPos.x < -this.tileSize || screenPos.x > viewport.width ||
                        screenPos.y < -this.tileSize || screenPos.y > viewport.height) {
                        continue;
                    }

                    layer.spPut(
                        img,
                        targetFrame.x, targetFrame.y, targetFrame.w, targetFrame.h,
                        0, 0, this.tileSize, this.tileSize,
                        1, 0, 0, 1,
                        screenPos.x, screenPos.y,
                        255, 0
                    );
                }
            }
        }
    }
}
