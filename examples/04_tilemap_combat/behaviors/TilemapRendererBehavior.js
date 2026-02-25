import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * 2次元配列マップデータに基づいて、タイル背景を一度に描画するBehavior
 */
export class TilemapRendererBehavior extends Behavior {
    /**
     * @param {GameCore} engine 
     * @param {Object} mapData - Tiled形式のレイヤーデータ (data, width, height) 
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

        // タイル描画用の画像アセットキー（dsfl_reconstruction では 'dummy' などが使われる可能性があるが、
        // タイルIDに応じて分岐させる。ここでは ID:1 = Wall, 0 = Floor とする）
        
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
                if (tileId !== 0 && tileId !== undefined) {
                    const worldX = x * this.tileSize;
                    const worldY = y * this.tileSize;

                    const screenPos = viewport.worldToScreen(worldX, worldY);

                    if (screenPos.x < -this.tileSize || screenPos.x > viewport.width ||
                        screenPos.y < -this.tileSize || screenPos.y > viewport.height) {
                        continue;
                    }

                    // デバッグ用の簡易描画
                    layer.ctx.fillStyle = (tileId === 1) ? "#555" : "#333";
                    layer.ctx.fillRect(screenPos.x, screenPos.y, this.tileSize, this.tileSize);
                    layer.ctx.strokeStyle = "#444";
                    layer.ctx.strokeRect(screenPos.x, screenPos.y, this.tileSize, this.tileSize);
                }
            }
        }
    }
}
