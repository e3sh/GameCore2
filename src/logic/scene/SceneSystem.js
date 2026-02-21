/**
 * 全てのシーン（画面状態）の基底クラス。
 * @class BaseScene
 */
export class BaseScene {
    /**
     * @constructor
     * @param {GameCore} engine - 対象のゲームエンジンインスタンス
     */
    constructor(engine) {
        this.engine = engine;
        this.alive = true;
    }
    /** シーン作成後、初期化のために呼ばれるフック */
    init() { }
    /** 毎フレーム呼ばれる更新処理 @param {number} dt */
    update(dt) { }
    /** 毎フレーム呼ばれる描画処理 @param {DisplayManager} display */
    draw(display) { }
    /** シーンが最前面でアクティブになった直後に呼ばれるフック */
    onEnter() { }
    /** 別のシーンに切り替わる等、非アクティブになる直前に呼ばれるフック */
    onExit() { }
}

/**
 * スタックベースのシーン管理（画面遷移）を行うクラス。
 * @class SceneNavigator
 */
export class SceneNavigator {
    /**
     * @constructor
     * @param {GameCore} engine
     */
    constructor(engine) {
        this.engine = engine;
        this.stack = [];
    }

    /**
     * 現在最前面でアクティブなシーンを取得します。
     * @property current
     * @returns {BaseScene|undefined}
     */
    get current() {
        return this.stack[this.stack.length - 1];
    }

    /**
     * 新しいシーンをスタックの最前面に追加し、アクティブにします。
     * 既存の最前面シーンは停止、裏側に保持されます。
     * @method push
     * @param {BaseScene} scene
     */
    push(scene) {
        if (this.current) this.current.onExit();
        this.stack.push(scene);
        scene.init();
        scene.onEnter();
    }

    /**
     * 最前面のシーンを破棄し、1つ前のシーンを再びアクティブにします。
     * @method pop
     * @returns {BaseScene|undefined} 破棄した元の最前面シーン
     */
    pop() {
        const scene = this.stack.pop();
        if (scene) scene.onExit();
        if (this.current) this.current.onEnter();
        return scene;
    }

    /**
     * 最前面のシーンを新しいシーンに置き換えます（履歴を増やさず遷移する）。
     * @method replace
     * @param {BaseScene} scene
     */
    replace(scene) {
        this.pop();
        this.push(scene);
    }

    /**
     * 全てのアクティブなシーンの更新を実行します。
     * @method update
     * @param {number} dt 
     */
    update(dt) {
        if (this.current) {
            this.current.update(dt);
        }
    }

    /**
     * スタック内の全シーンを描画します（透過用）。
     * @method draw
     * @param {DisplayManager} display 
     */
    draw(display) {
        // スタック全体を順に描画（透過ポーズ画面などのため）
        this.stack.forEach(scene => scene.draw(display));
    }
}
