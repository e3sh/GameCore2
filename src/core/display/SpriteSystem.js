/**
 * @class SpriteItem
 * @description
 * 個々のスプライトアイテムの状態を保持する。
 */
class SpriteItem {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.r = 0; // rotation (0-359)
        this.z = 1; // scale
        this.vx = 0;
        this.vy = 0;
        this.priority = 0;
        this.visible = false;
        this.alive = 0; // lifetime in ms
        this.patternId = "";
        this.count = 0; // timer for animation
        this.frameIndex = 0;
        this.alpha = 255;
        this.living = true;
    }

    update(dt) {
        if (!this.living) return;
        this.alive -= dt;
        this.x += this.vx * (dt / 16);
        this.y += this.vy * (dt / 16);
        if (this.alive <= 0) {
            this.visible = false;
        }
    }
}

/**
 * @class SpriteSystem
 * @description
 * 登録されたアニメーションパターンに基づき、大量の軽量スプライトを表示・管理する。
 */
export class SpriteSystem {
    constructor(engine) {
        this.engine = engine;
        this.patterns = new Map();
        this.items = [];
        this.activeScreenIndex = 0;
    }

    /**
     * @method setPattern
     * @param {string} id 
     * @param {Object} param { imageKey, wait, frames: [{x, y, w, h, r, fv, fh}] }
     */
    setPattern(id, param) {
        this.patterns.set(id, param);
    }

    /**
     * @method createItem
     * @param {string} patternId 
     * @param {number} x 
     * @param {number} y 
     * @returns {SpriteItem}
     */
    createItem(patternId, x = 0, y = 0) {
        const item = new SpriteItem();
        item.patternId = patternId;
        item.x = x;
        item.y = y;
        item.visible = true;
        item.alive = Infinity;
        this.items.push(item);
        return item;
    }

    update(dt) {
        this.items = this.items.filter(item => item.living);
        this.items.forEach(item => {
            if (item.visible) {
                item.update(dt);
                // アニメーション更新
                const ptn = this.patterns.get(item.patternId);
                if (ptn) {
                    item.count += dt;
                    const frameTime = (ptn.wait || 0) * 16.6; // 60fps基準のウェイト
                    if (item.count >= frameTime) {
                        item.count = 0;
                        item.frameIndex++;
                        if (item.frameIndex >= ptn.frames.length) {
                            item.frameIndex = 0;
                        }
                    }
                }
            }
        });
    }

    draw(display, viewport) {
        const layer = display.getLayer(this.activeScreenIndex);

        // 描画順序のためにコピーしてソート
        const sortedItems = [...this.items]
            .filter(i => i.visible)
            .sort((a, b) => a.priority - b.priority);

        sortedItems.forEach(item => {
            let rx = item.x;
            let ry = item.y;
            if (viewport) {
                const screenPos = viewport.worldToScreen(rx, ry);
                rx = screenPos.x;
                ry = screenPos.y;
            }

            const ptn = this.patterns.get(item.patternId);
            if (!ptn) {
                // フォールバック: パターンがない場合はデバッグ用の矩形を「中央基準」で描画
                layer.ctx.save();
                layer.ctx.fillStyle = (item.patternId === 1 || item.patternId === '1') ? 'blue' : 'gray';
                const size = 32 * item.z;
                layer.ctx.fillRect(Math.floor(rx - size / 2), Math.floor(ry - size / 2), Math.floor(size), Math.floor(size));
                layer.ctx.restore();
                return;
            }

            const frame = ptn.frames[item.frameIndex];
            if (!frame) return;

            const img = this.engine.assets.getImage(ptn.imageKey);
            if (!img) {
                // フォールバック: 画像が未ロードの場合は半透明の矩形
                layer.ctx.save();
                layer.ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
                const w = frame.w * item.z;
                const h = frame.h * item.z;
                layer.ctx.fillRect(Math.floor(rx - w / 2), Math.floor(ry - h / 2), Math.floor(w), Math.floor(h));
                layer.ctx.restore();
                return;
            }

            // フリップ行列の計算
            const m11 = frame.fh ? -1 : 1;
            const m22 = frame.fv ? -1 : 1;

            // スプライトの中央を基準に描画
            layer.spPut(
                img,
                frame.x, frame.y, frame.w, frame.h,
                (-frame.w / 2) * item.z,
                (-frame.h / 2) * item.z,
                frame.w * item.z,
                frame.h * item.z,
                m11, 0, 0, m22,
                rx, ry,
                item.alpha,
                item.r || frame.r || 0
            );
        });
    }
}
