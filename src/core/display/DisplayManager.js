/**
 * 個別の描画レイヤー（OffscreenCanvas）を管理するクラス。
 * @class Layer
 */
class Layer {
    /**
     * @constructor
     * @param {number} width - レイヤーの幅
     * @param {number} height - レイヤーの高さ
     */
    constructor(width, height) {
        this.canvas = new OffscreenCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');
        this.width = width;
        this.height = height;
    }

    /**
     * レイヤー全体をクリアします。
     * @method clear
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * レイヤー全体を指定した色で塗りつぶします。
     * @method fill
     * @param {string|CanvasGradient|CanvasPattern} color - 塗りつぶす色
     */
    fill(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * 簡易的な画像描画（トリミング・リサイズ可能）を行います。
     * @method drawImg
     * @param {CanvasImageSource} img - 描画する画像元
     * @param {number} sx - 描画元のX座標
     * @param {number} sy - 描画元のY座標
     * @param {number} sw - 描画元の幅
     * @param {number} sh - 描画元の高さ
     * @param {number} dx - 描画先のX座標
     * @param {number} dy - 描画先のY座標
     * @param {number} dw - 描画先の幅
     * @param {number} dh - 描画先の高さ
     */
    drawImg(img, sx, sy, sw, sh, dx, dy, dw, dh) {
        this.ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    /**
     * 回転、反転、アルファ値などを含む高度なスプライト描画を行います。
     * @method spPut
     * @param {CanvasImageSource} img - 描画する画像元
     * @param {number} sx - 描画元のX座標
     * @param {number} sy - 描画元のY座標
     * @param {number} sw - 描画元の幅
     * @param {number} sh - 描画元の高さ
     * @param {number} dx - 描画先のX座標
     * @param {number} dy - 描画先のY座標
     * @param {number} dw - 描画先の幅
     * @param {number} dh - 描画先の高さ
     * @param {number} m11 - 変換行列 (水平スケール)
     * @param {number} m12 - 変換行列 (垂直スキュー)
     * @param {number} m21 - 変換行列 (水平スキュー)
     * @param {number} m22 - 変換行列 (垂直スケール)
     * @param {number} tx - 変換行列 (X並行移動)
     * @param {number} ty - 変換行列 (Y並行移動)
     * @param {number} alpha - 透明度 (0-255)
     * @param {number} r - 回転角度 (度数法)
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
 * 複数の描画レイヤーを管理し、メインキャンバスへ合成・転送するクラス。
 * @class DisplayManager
 */
export class DisplayManager {
    /**
     * @constructor
     * @param {string} canvasId - メインキャンバスのHTML要素ID
     * @param {Array<{resolution: {w: number, h: number}}>} screenParams - 各レイヤーの解像度設定
     */
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
     * 指定したインデックスのレイヤーを取得します。
     * @method getLayer
     * @param {number} index - レイヤー番号
     * @returns {Layer} 対応するレイヤーインスタンス
     */
    getLayer(index) {
        return this.layers[index];
    }

    /**
     * 全てのレイヤーをクリアします。
     * @method clearAll
     */
    clearAll() {
        this.layers.forEach(layer => layer.clear());
    }

    /**
     * 全てのレイヤーを順番にメインキャンバスへ描画（合成）します。
     * @method present
     */
    present() {
        this.mainCtx.clearRect(0, 0, this.width, this.height);
        this.layers.forEach(layer => {
            this.mainCtx.drawImage(layer.canvas, 0, 0);
        });
    }
}
