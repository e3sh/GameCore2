import { DisplayManager } from './display/DisplayManager.js';
import { SpriteSystem } from './display/SpriteSystem.js?v=13';
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
 * @class GameCore
 * @description 新エンジンの統合エントリ。
 */
export class GameCore {
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

        this.status = {
            isRunning: false,
            lastTime: 0,
            deltaTime: 0,
            frame: 0
        };
    }

    run() {
        if (this.status.isRunning) return;
        this.status.isRunning = true;
        this.status.lastTime = performance.now();

        const loop = (time) => {
            if (!this.status.isRunning) return;

            this.status.deltaTime = time - this.status.lastTime;
            this.status.lastTime = time;
            this.status.frame++;

            this.update();
            this.draw();

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

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

    draw() {
        this.display.clearAll();

        this.scenes.draw(this.display);
        this.particles.draw(this.display, this.viewport);
        this.entities.draw(this.display, this.viewport);
        this.sprite.draw(this.display, this.viewport);

        this.display.present();
    }

    stop() {
        this.status.isRunning = false;
    }
}
