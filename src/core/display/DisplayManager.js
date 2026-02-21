/**
 * @class Layer
 * @description 個別の描画レイヤー（OffscreenCanvas）を管理するクラス。
 */
class Layer {
    constructor(width, height) {
        this.canvas = new OffscreenCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');
        this.width = width;
        this.height = height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    fill(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * @method drawImg
     * 簡易的な画像描画（トリミング・リサイズ可能）
     */
    drawImg(img, sx, sy, sw, sh, dx, dy, dw, dh) {
        this.ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    /**
     * @method spPut
     * 回転、反転、アルファ値などを含む高度なスプライト描画
     */
    spPut(img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r) {
        this.ctx.save();
        this.ctx.setTransform(m11, m12, m21, m22, tx, ty);
        if (r !== 0) {
            this.ctx.rotate(Math.PI / 180 * r);
        }
        if (alpha !== 255) {
            this.ctx.globalAlpha = alpha / 255;
        }
        this.ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        this.ctx.restore();
    }
}

/**
 * @class DisplayManager
 * @description 複数の描画レイヤーを管理し、メインキャンバスへ合成・転送するクラス。
 */
export class DisplayManager {
    constructor(canvasId, screenParams) {
        this.mainCanvas = document.getElementById(canvasId);
        if (!this.mainCanvas) {
            throw new Error(`Canvas with id "${canvasId}" not found.`);
        }
        this.mainCtx = this.mainCanvas.getContext('2d');

        // 各レイヤーの初期化
        this.layers = screenParams.map(p => {
            const res = p.resolution;
            return new Layer(res.w, res.h);
        });

        this.width = this.mainCanvas.width;
        this.height = this.mainCanvas.height;
    }

    /**
     * @method getLayer
     * @param {number} index レイヤー番号
     * @returns {Layer}
     */
    getLayer(index) {
        return this.layers[index];
    }

    /**
     * @method clearAll
     * 全てのレイヤーをクリアします。
     */
    clearAll() {
        this.layers.forEach(layer => layer.clear());
    }

    /**
     * @method present
     * 全てのレイヤーを順番にメインキャンバスへ描画（合成）します。
     */
    present() {
        this.mainCtx.clearRect(0, 0, this.width, this.height);
        this.layers.forEach(layer => {
            this.mainCtx.drawImage(layer.canvas, 0, 0);
        });
    }
}
