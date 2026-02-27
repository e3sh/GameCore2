/**
 * @class Viewport
 * @description ゲーム世界（World）の座標から画面（Screen）の座標への変換を管理する。
 */
export class Viewport {
    constructor(params) {
        this.width = params.w || 640;
        this.height = params.h || 480;
        this.worldX = 0;
        this.worldY = 0;
        this.target = null;
        this.damping = 0.1; // カメラ追従の滑らかさ
        this.targetOffsetX = 0; // ターゲットからのカメラのXオフセット
        this.targetOffsetY = 0; // ターゲットからのカメラのYオフセット
    }

    /**
     * @method follow
     * @param {Object} target 対象オブジェクト ({x, y} を持つもの)
     */
    follow(target) {
        this.target = target;
    }

    /**
     * @method lookAt
     * 指定した座標が画面中央に来るようにカメラを強制移動します。
     */
    lookAt(x, y) {
        this.worldX = x - this.width / 2;
        this.worldY = y - this.height / 2;
    }

    /**
     * @method update
     * カメラの追いかけ処理を更新。
     */
    update() {
        if (this.target) {
            const destX = (this.target.x + this.targetOffsetX) - this.width / 2;
            const destY = (this.target.y + this.targetOffsetY) - this.height / 2;

            this.worldX += (destX - this.worldX) * this.damping;
            this.worldY += (destY - this.worldY) * this.damping;
        }
    }

    /**
     * @method worldToScreen
     * @param {number} x 世界座標 X
     * @param {number} y 世界座標 Y
     * @returns {Object} {x, y} 画面内座標
     */
    worldToScreen(x, y) {
        return {
            x: x - this.worldX,
            y: y - this.worldY
        };
    }
}
