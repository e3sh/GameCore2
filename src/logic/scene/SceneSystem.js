/**
 * @class BaseScene
 * @description 全てのシーンの基底クラス。
 */
export class BaseScene {
    constructor(engine) {
        this.engine = engine;
        this.alive = true;
    }
    init() { }
    update(dt) { }
    draw(display) { }
    onEnter() { }
    onExit() { }
}

/**
 * @class SceneNavigator
 * @description スタックベースのシーン管理。
 */
export class SceneNavigator {
    constructor(engine) {
        this.engine = engine;
        this.stack = [];
    }

    get current() {
        return this.stack[this.stack.length - 1];
    }

    push(scene) {
        if (this.current) this.current.onExit();
        this.stack.push(scene);
        scene.init();
        scene.onEnter();
    }

    pop() {
        const scene = this.stack.pop();
        if (scene) scene.onExit();
        if (this.current) this.current.onEnter();
        return scene;
    }

    replace(scene) {
        this.pop();
        this.push(scene);
    }

    update(dt) {
        if (this.current) {
            this.current.update(dt);
        }
    }

    draw(display) {
        // スタック全体を順に描画（透過ポーズ画面などのため）
        this.stack.forEach(scene => scene.draw(display));
    }
}
