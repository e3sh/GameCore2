import { DisplayManager } from './display/DisplayManager.js';
import { SpriteSystem } from './display/SpriteSystem.js';
import { InputDevices } from './input/InputDevices.js';
import { AudioManager } from './audio/AudioManager.js';
import { AssetManager } from './assets/AssetManager.js';
import { Viewport } from '../math/Viewport.js';
import { EntityManager } from '../logic/entity/EntityManager.js';
import { SceneNavigator } from '../logic/scene/SceneSystem.js';
import { InputMapper } from '../logic/input/InputMapper.js';
import { EventBus } from '../utils/EventBus.js';
import { ParticleSystem } from '../logic/systems/ParticleSystem.js';

/**
 * エンジンの統合エントリクラス。
 * 表示、入力、音声、アセット、エンティティ、シーンなどの主要システムを統括します。
 * @class GameCore
 */
export class GameCore {
    /**
     * @constructor
     * @param {Object} sysParam - システム初期化パラメータ
     * @param {string} sysParam.canvasId - メインキャンバスのHTML要素ID
     * @param {Array<{resolution: {w: number, h: number}}>} sysParam.screen - 各レイヤーの解像度設定の配列
     * @param {{w: number, h: number}} [sysParam.viewport] - ビューポート（カメラ）のサイズ設定（省略時は 640x480）
     */
    constructor(sysParam) {
        console.log("GameCore initializing...");

        // 低レベル
        this.display = new DisplayManager(sysParam.canvasId, sysParam.screen);
        this.sprite = new SpriteSystem(this);
        this.inputRaw = new InputDevices(this.display.mainCanvas);
        this.sound = new AudioManager();
        this.assets = new AssetManager();

        // 高レベル
        this.viewport = new Viewport(sysParam.viewport || { w: 640, h: 480 });
        this.input = new InputMapper(this.inputRaw);
        this.entities = new EntityManager(this);
        this.scenes = new SceneNavigator(this);
        this.particles = new ParticleSystem(this);
        this.events = new EventBus();

        this.viewMode = sysParam.viewMode || 'side'; // 'side' または 'top'

        this.status = {
            isRunning: false,
            lastTime: 0,
            deltaTime: 0,
            frame: 0
        };
    }

    /**
     * ゲームループを開始します。
     * @method run
     */
    run() {
        if (this.status.isRunning) return;
        this.status.isRunning = true;
        this.status.lastTime = performance.now();

        const loop = (time) => {
            if (!this.status.isRunning) return;

            this.status.deltaTime = Math.min(time - this.status.lastTime, 100); // 最大100msに制限
            this.status.lastTime = time;
            this.status.frame++;

            this.update();
            this.draw();

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    /**
     * エンジン内の全システムの状態を更新します（1フレームごとの処理）。
     * @method update
     */
    update() {
        const dt = this.status.deltaTime;

        this.inputRaw.update();
        this.input.update();
        this.viewport.update();
        this.scenes.update(dt);
        this.entities.update(dt);
        this.particles.update(dt);
        this.sprite.update(dt);
        this.sound.step(this.status.lastTime);
    }

    /**
     * エンジン内の全システムの描画処理を行います。
     * @method draw
     */
    draw() {
        this.display.clearAll();

        // 描画順序: 背景(Entities L0) -> アクター(Entities L1+) -> パーティクル(L2) -> スプライトシステム
        this.entities.draw(this.display, this.viewport);
        this.particles.draw(this.display, this.viewport);
        this.sprite.draw(this.display, this.viewport);

        // シーン（UIやオーバーレイ）を最後に描画して最前面に表示
        this.scenes.draw(this.display);

        this.display.present();
    }

    /**
     * ゲームループを停止します。
     * @method stop
     */
    stop() {
        this.status.isRunning = false;
    }
}
