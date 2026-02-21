/**
 * 生のキーボード入力を管理するクラス。
 * @class KeyboardDevice
 */
class KeyboardDevice {
    constructor() {
        this.keys = {};
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });
    }

    /**
     * 指定されたキーが現在押されているか判定します。
     * @method isPressed
     * @param {string} code - キーコード (例: "Space", "ArrowUp")
     * @returns {boolean} 押されていればtrue
     */
    isPressed(code) {
        return !!this.keys[code];
    }
}

/**
 * 生のマウス入力を管理するクラス。
 * @class MouseDevice
 */
class MouseDevice {
    constructor(element) {
        this.x = 0;
        this.y = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.dx = 0;
        this.dy = 0;
        this.wheel = 0;
        this._wheelAccum = 0; // 非同期で蓄積される値
        this.buttons = {};

        element.addEventListener('mousemove', e => {
            const rect = element.getBoundingClientRect();
            const scaleX = element.width / rect.width;
            const scaleY = element.height / rect.height;
            this.x = (e.clientX - rect.left) * scaleX;
            this.y = (e.clientY - rect.top) * scaleY;
        });

        element.addEventListener('mousedown', e => {
            this.buttons[e.button] = true;
        });

        element.addEventListener('mouseup', e => {
            this.buttons[e.button] = false;
        });

        element.addEventListener('wheel', e => {
            this._wheelAccum += e.deltaY;
        }, { passive: true });
    }

    /**
     * マウスの移動量やホイールの回転量を計算・更新します。
     * @method update
     */
    update() {
        // マウス移動量の算出
        this.dx = this.x - this.lastX;
        this.dy = this.y - this.lastY;
        this.lastX = this.x;
        this.lastY = this.y;

        // ホイール量の確定と蓄積リセット
        this.wheel = this._wheelAccum;
        this._wheelAccum = 0;
    }

    /**
     * 指定されたマウスボタンが現在押されているか判定します。
     * @method isPressed
     * @param {number} button - ボタン番号 (0: 左, 1: 中, 2: 右)
     * @returns {boolean} 押されていればtrue
     */
    isPressed(button) {
        return !!this.buttons[button];
    }
}

/**
 * ゲームパッドの状態を管理するクラス。
 * @class GamepadDevice
 */
class GamepadDevice {
    constructor() {
        this.gamepads = [];
        window.addEventListener("gamepadconnected", (e) => {
            console.log("Gamepad connected", e.gamepad);
        });
    }

    /**
     * 毎フレーム呼び出してゲームパッドの状態をポーリングします。
     * @method update
     */
    update() {
        this.gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    }

    /**
     * 指定したインデックスのゲームパッド情報を取得します。
     * @method getGamepad
     * @param {number} [index=0] - ゲームパッドのインデックス
     * @returns {Gamepad|null} ゲームパッドオブジェクト
     */
    getGamepad(index = 0) {
        return this.gamepads[index];
    }

    /**
     * 指定したボタンが押されているか判定します。
     * @method isButtonPressed
     * @param {number} buttonIndex - ボタンのインデックス (0~17等)
     * @param {number} [gpadIndex=0] - ゲームパッドのインデックス
     * @returns {boolean} 押されていればtrue
     */
    isButtonPressed(buttonIndex, gpadIndex = 0) {
        const gp = this.getGamepad(gpadIndex);
        if (!gp || !gp.buttons[buttonIndex]) return false;
        return gp.buttons[buttonIndex].pressed;
    }

    /**
     * 指定したアナログスティックの入力値（-1.0 〜 1.0）を取得します。
     * @method getAxis
     * @param {number} axisIndex - 軸のインデックス
     * @param {number} [gpadIndex=0] - ゲームパッドのインデックス
     * @returns {number} 軸の入力値
     */
    getAxis(axisIndex, gpadIndex = 0) {
        const gp = this.getGamepad(gpadIndex);
        if (!gp || !gp.axes[axisIndex]) return 0;
        return gp.axes[axisIndex];
    }
}

/**
 * 全ての物理入力デバイス（キーボード、マウス、ゲームパッド）を統括するクラス。
 * @class InputDevices
 */
export class InputDevices {
    constructor(element) {
        this.keyboard = new KeyboardDevice();
        this.mouse = new MouseDevice(element);
        this.gamepad = new GamepadDevice();
    }

    /**
     * 全ての入力デバイスの状態を更新します。
     * @method update
     */
    update() {
        this.mouse.update();
        this.gamepad.update();
    }
}
