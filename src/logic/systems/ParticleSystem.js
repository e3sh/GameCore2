import { Behavior } from '../entity/Behavior.js';

/**
 * @class ParticleSystem
 * @description
 * 軽量なパーティクルエフェクトを管理する。
 */
export class ParticleSystem extends Behavior {
    constructor(engine, maxParticles = 500) {
        super();
        this.engine = engine;
        this.particles = [];
        this.maxParticles = maxParticles;
    }

    /**
     * 現在のパーティクルをすべて消去します。
     * @method clear
     */
    clear() {
        this.particles = [];
    }

    emit(config) {
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
        }

        const particle = {
            x: config.x || 0,
            y: config.y || 0,
            vx: config.vx || 0,
            vy: config.vy || 0,
            life: config.life || 1000,
            maxLife: config.life || 1000,

            // スプライト描画用パラメータ
            imageKey: config.imageKey || null,
            sx: config.sx || 0,
            sy: config.sy || 0,
            sw: config.sw !== undefined ? config.sw : 32,
            sh: config.sh !== undefined ? config.sh : 32,
            z: config.z !== undefined ? config.z : 1.0,
            rotation: config.rotation || 0,
            spin: config.spin || 0, // 毎フレームの回転加算量

            // フォールバック（矩形描画）用パラメータ
            color: config.color || 'white',
            size: config.size || 2,

            // 物理系
            gravity: config.gravity || 0,
            drag: config.drag !== undefined ? config.drag : 1.0
        };
        this.particles.push(particle);
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            p.vy += p.gravity * (dt / 16);
            p.x += p.vx * (dt / 16);
            p.y += p.vy * (dt / 16);
            p.vx *= p.drag;
            p.vy *= p.drag;

            // スピン（回転）の適用
            p.rotation += p.spin * (dt / 16);
        }
    }

    draw(display, viewport) {
        const layer = display.getLayer(2); // VFX Layer (BGは0, Actorは1)

        this.particles.forEach(p => {
            const screen = viewport.worldToScreen(p.x, p.y);
            const alpha = Math.max(0, p.life / p.maxLife);

            if (p.imageKey && this.engine && this.engine.assets) {
                // --- スプライト描画モード ---
                const img = this.engine.assets.getImage(p.imageKey);
                if (img) {
                    const dw = p.sw * p.z;
                    const dh = p.sh * p.z;
                    // spPut のシグネチャ: img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, btx, bty, alpha, rotation
                    layer.spPut(
                        img,
                        p.sx, p.sy, p.sw, p.sh, // Source: 切り出し領域
                        -dw / 2, -dh / 2, dw, dh, // Dest: 中心基準
                        1, 0, 0, 1, // Matrix
                        screen.x, screen.y, // 位置
                        alpha * 255, // alpha (0-255)
                        p.rotation
                    );
                }
            } else {
                // --- フォールバック（矩形描画モード） ---
                layer.ctx.globalAlpha = alpha;
                layer.ctx.fillStyle = p.color;
                layer.ctx.fillRect(screen.x - p.size / 2, screen.y - p.size / 2, p.size, p.size);
                layer.ctx.globalAlpha = 1.0;
            }
        });
    }
}
